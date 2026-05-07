#!/usr/bin/env node
/**
 * Vérifie et régénère les illustrations LSF manquantes ou corrompues.
 *
 * Usage :
 *   LOVABLE_API_KEY=... node scripts/check-lsf-illustrations.mjs            # check + regen
 *   node scripts/check-lsf-illustrations.mjs --check                        # check only
 *   node scripts/check-lsf-illustrations.mjs --only=new-bebe-pipi,emo-aime  # cible des clés
 *   node scripts/check-lsf-illustrations.mjs --force                        # régénère tout
 *
 * Charte : docs/lsf-illustration-style.md
 *
 * Sortie : rapport JSON dans /tmp/lsf-illustrations-report.json
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSETS_DIR = path.join(ROOT, "src/assets/lsf");
const CATALOG_FILE = path.join(ROOT, "src/data/lsfCatalog.ts");
const NEW_SIGNS_FILE = path.join(ROOT, "src/data/lsfNewSigns.ts");
const REPORT_FILE = "/tmp/lsf-illustrations-report.json";

const MIN_FILE_BYTES = 4 * 1024; // 4 Ko : sous ce seuil, on considère l'image cassée
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 2000;

const args = process.argv.slice(2);
const flag = (name) => args.some((a) => a === `--${name}`);
const opt = (name) => {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : null;
};

const CHECK_ONLY = flag("check");
const FORCE = flag("force");
const ONLY_KEYS = (opt("only") || "").split(",").map((s) => s.trim()).filter(Boolean);

// ─── Parse des fichiers TS sans transpiler ──────────────────────────────────
async function parseSigns() {
  const out = [];

  const catalog = await fs.readFile(CATALOG_FILE, "utf8");
  // Lignes du genre :
  //   { key: "bebe-manger", label: "Manger", gesture: "Main plate ...", emoji: "🍽️", image: bebeManger },
  const catalogRe = /\{\s*key:\s*"([^"]+)"\s*,\s*label:\s*"([^"]+)"\s*,\s*gesture:\s*"([^"]+)"[^}]*\}/g;
  for (const m of catalog.matchAll(catalogRe)) {
    out.push({ key: m[1], label: m[2], gesture: m[3], source: "catalog" });
  }

  const newSigns = await fs.readFile(NEW_SIGNS_FILE, "utf8");
  // Lignes du genre :
  //   { key: "new-bebe-pipi", label: "Pipi", gesture: "...", emoji: "🚽", themeSlug: "bebe-besoins" },
  const newRe = /\{\s*key:\s*"([^"]+)"\s*,\s*label:\s*"([^"]+)"\s*,\s*gesture:\s*"([^"]+)"[^}]*\}/g;
  for (const m of newSigns.matchAll(newRe)) {
    out.push({ key: m[1], label: m[2], gesture: m[3], source: "new" });
  }

  return out;
}

// ─── Validation d'un fichier image ──────────────────────────────────────────
async function inspectFile(filePath) {
  try {
    const buf = await fs.readFile(filePath);
    if (buf.length < MIN_FILE_BYTES) {
      return { ok: false, reason: `too_small(${buf.length}b)`, size: buf.length };
    }
    // JPEG magic bytes : FF D8 FF
    if (!(buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)) {
      return { ok: false, reason: "not_jpeg_header", size: buf.length };
    }
    // Marqueur de fin EOI : FF D9
    const last = buf.length - 1;
    if (!(buf[last - 1] === 0xff && buf[last] === 0xd9)) {
      return { ok: false, reason: "truncated_no_eoi", size: buf.length };
    }
    return { ok: true, size: buf.length };
  } catch (err) {
    if (err.code === "ENOENT") return { ok: false, reason: "missing" };
    return { ok: false, reason: `io_error(${err.code || err.message})` };
  }
}

// ─── Prompt selon la charte ─────────────────────────────────────────────────
function buildPrompt(sign) {
  return [
    `Soft hand-drawn illustration of "${sign.label}" in French Sign Language (LSF):`,
    `${sign.gesture}`,
    `Clean line-art style, thin warm brown outline (#7A5240), pale peachy-pink skin tone (#F4C9B8),`,
    `soft cream background (#FBF6EC) filling the whole square frame,`,
    `centered composition with generous margins.`,
    `Subtle coral arrows or dotted curves (#E08F7E) to indicate motion if relevant.`,
    `No text, no letters, no caption, no watermark.`,
    `Front view from the observer's perspective. Square 1:1 format.`,
    `Calm, warm, pedagogical, suitable for a parenting app teaching baby sign language to French families.`,
  ].join(" ");
}

// ─── Génération via AI Gateway (Nano Banana) ────────────────────────────────
async function generateImage(sign, attempt = 1) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY manquant dans l'environnement");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      modalities: ["image", "text"],
      messages: [{ role: "user", content: buildPrompt(sign) }],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const dataUrl = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!dataUrl || !dataUrl.startsWith("data:image/")) {
    throw new Error("Réponse sans image (data URL)");
  }
  const b64 = dataUrl.split(",", 2)[1];
  if (!b64) throw new Error("Data URL malformé");
  const buf = Buffer.from(b64, "base64");

  // L'API renvoie souvent du PNG ; on convertit pas (on enregistre en .jpg simplement
  // si l'extension d'output l'exige, mais le navigateur lit le PNG sous .jpg → on
  // garde la magie d'origine et on ajuste l'extension au besoin).
  return { buf, mime: dataUrl.slice(5, dataUrl.indexOf(";")) };
}

async function generateWithRetry(sign) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await generateImage(sign, attempt);
    } catch (err) {
      lastErr = err;
      const wait = RETRY_BASE_MS * Math.pow(2, attempt - 1);
      console.warn(`  ⚠️  tentative ${attempt}/${MAX_RETRIES} échouée : ${err.message}`);
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }
  throw lastErr;
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  await fs.mkdir(ASSETS_DIR, { recursive: true });

  const signs = await parseSigns();
  const targeted = ONLY_KEYS.length
    ? signs.filter((s) => ONLY_KEYS.includes(s.key))
    : signs;

  console.log(`🔍 ${targeted.length} signes ciblés (sur ${signs.length} au total)`);

  const report = {
    generated_at: new Date().toISOString(),
    total: targeted.length,
    ok: [],
    missing: [],
    broken: [],
    regenerated: [],
    failed: [],
  };

  // Phase 1 : audit
  for (const sign of targeted) {
    const filePath = path.join(ASSETS_DIR, `${sign.key}.jpg`);
    const inspection = await inspectFile(filePath);
    if (FORCE) {
      report.broken.push({ key: sign.key, reason: "force" });
    } else if (inspection.ok) {
      report.ok.push({ key: sign.key, size: inspection.size });
    } else if (inspection.reason === "missing") {
      report.missing.push({ key: sign.key });
    } else {
      report.broken.push({ key: sign.key, reason: inspection.reason, size: inspection.size });
    }
  }

  console.log(`✅ OK            : ${report.ok.length}`);
  console.log(`📂 Manquantes    : ${report.missing.length}`);
  console.log(`💥 Cassées       : ${report.broken.length}`);
  if (report.missing.length) {
    console.log("   →", report.missing.slice(0, 10).map((x) => x.key).join(", "),
      report.missing.length > 10 ? `… (+${report.missing.length - 10})` : "");
  }
  if (report.broken.length) {
    console.log("   →", report.broken.slice(0, 10).map((x) => `${x.key}(${x.reason})`).join(", "),
      report.broken.length > 10 ? `… (+${report.broken.length - 10})` : "");
  }

  if (CHECK_ONLY) {
    await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2));
    console.log(`\n📄 Rapport : ${REPORT_FILE}`);
    process.exit(report.missing.length + report.broken.length > 0 ? 1 : 0);
  }

  // Phase 2 : régénération
  const toRegen = [...report.missing, ...report.broken];
  if (toRegen.length === 0) {
    console.log("\n✨ Rien à régénérer.");
    await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2));
    return;
  }

  if (!process.env.LOVABLE_API_KEY) {
    console.error("\n❌ LOVABLE_API_KEY manquant — impossible de régénérer.");
    console.error("   Relance le script avec : LOVABLE_API_KEY=... node scripts/check-lsf-illustrations.mjs");
    await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2));
    process.exit(2);
  }

  console.log(`\n🎨 Régénération de ${toRegen.length} illustration(s)…`);

  for (let i = 0; i < toRegen.length; i++) {
    const item = toRegen[i];
    const sign = signs.find((s) => s.key === item.key);
    if (!sign) {
      report.failed.push({ key: item.key, reason: "sign_not_found" });
      continue;
    }
    const filePath = path.join(ASSETS_DIR, `${sign.key}.jpg`);
    console.log(`[${i + 1}/${toRegen.length}] ${sign.key} — « ${sign.label} »`);
    try {
      const { buf } = await generateWithRetry(sign);
      await fs.writeFile(filePath, buf);
      // Re-vérification post-écriture (tolère PNG car certaines réponses renvoient PNG)
      const stat = await fs.stat(filePath);
      if (stat.size < MIN_FILE_BYTES) {
        throw new Error(`fichier écrit trop petit (${stat.size}b)`);
      }
      report.regenerated.push({ key: sign.key, size: stat.size });
      console.log(`  ✅ écrite (${(stat.size / 1024).toFixed(1)} Ko)`);
    } catch (err) {
      console.error(`  ❌ échec définitif : ${err.message}`);
      report.failed.push({ key: sign.key, reason: err.message });
    }
    // Petit throttle pour éviter le rate limit
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(`\n🎯 Régénérées : ${report.regenerated.length} / ${toRegen.length}`);
  if (report.failed.length) {
    console.log(`💔 Échecs    : ${report.failed.length}`);
    for (const f of report.failed) console.log(`   - ${f.key} : ${f.reason}`);
  }

  await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`📄 Rapport : ${REPORT_FILE}`);

  process.exit(report.failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("💥 Erreur fatale :", err);
  process.exit(99);
});
