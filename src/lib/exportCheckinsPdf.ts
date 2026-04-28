import jsPDF from "jspdf";
import { emotions } from "@/data/emotions";

export interface CheckinExport {
  emotion: string;
  emotion_type: string;
  created_at: string;
}

export interface ExportMeta {
  firstName?: string;
  email?: string;
  currentStreak?: number;
}

export interface ExportOptions {
  includeFirstName?: boolean;
  includeEmail?: boolean;
  anonymize?: boolean; // when true, ignore firstName/email entirely
}

const PRIMARY: [number, number, number] = [121, 62, 207]; // ~ hsl(258 70% 52%)
const MUTED: [number, number, number] = [110, 110, 125];
const TEXT: [number, number, number] = [30, 30, 40];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const emotionLabel = (id: string) => emotions.find((e) => e.id === id)?.label ?? id;

export function exportCheckinsToPdf(
  checkins: CheckinExport[],
  meta: ExportMeta = {},
  options: ExportOptions = { includeFirstName: true, includeEmail: false, anonymize: false },
) {
  const { anonymize = false } = options;
  const showFirstName = !anonymize && (options.includeFirstName ?? true) && !!meta.firstName;
  const showEmail = !anonymize && (options.includeEmail ?? false) && !!meta.email;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin;

  // ---- Header ----
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageWidth, 90, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Ancrage", margin, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Mon suivi émotionnel", margin, 62);
  doc.setFontSize(9);
  doc.text(
    `Exporté le ${new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}`,
    pageWidth - margin,
    42,
    { align: "right" },
  );

  y = 120;

  // ---- User info ----
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  if (anonymize) {
    doc.text("Suivi anonyme", margin, y);
  } else {
    doc.text(showFirstName ? `Bonjour ${meta.firstName}` : "Ton suivi", margin, y);
  }
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  if (showEmail) {
    doc.text(meta.email!, margin, y);
    y += 14;
  }
  if (anonymize) {
    doc.text("Aucune donnée personnelle incluse dans ce document.", margin, y);
    y += 14;
  }
  y += 8;

  // ---- Stats ----
  const total = checkins.length;
  const positive = checkins.filter((c) => c.emotion_type === "positive").length;
  const negative = total - positive;
  const positivePct = total ? Math.round((positive / total) * 100) : 0;

  // Range
  const sorted = [...checkins].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const rangeStart = sorted[0]?.created_at;
  const rangeEnd = sorted[sorted.length - 1]?.created_at;

  const stats: { label: string; value: string }[] = [
    { label: "Check-ins", value: String(total) },
    { label: "Positifs", value: `${positivePct}%` },
    { label: "Série actuelle", value: `${meta.currentStreak ?? 0} j` },
  ];
  const cardW = (pageWidth - margin * 2 - 16) / 3;
  stats.forEach((s, i) => {
    const x = margin + i * (cardW + 8);
    doc.setFillColor(245, 240, 255);
    doc.roundedRect(x, y, cardW, 56, 8, 8, "F");
    doc.setTextColor(...PRIMARY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(s.value, x + cardW / 2, y + 26, { align: "center" });
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(s.label, x + cardW / 2, y + 44, { align: "center" });
  });
  y += 76;

  if (rangeStart && rangeEnd) {
    doc.setTextColor(...MUTED);
    doc.setFontSize(10);
    doc.text(`Période : ${fmtDate(rangeStart)} → ${fmtDate(rangeEnd)}`, margin, y);
    y += 20;
  }

  // ---- Top emotions ----
  const freq: Record<string, number> = {};
  checkins.forEach((c) => (freq[c.emotion] = (freq[c.emotion] || 0) + 1));
  const top = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (top.length) {
    doc.setTextColor(...TEXT);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Émotions les plus fréquentes", margin, y);
    y += 16;
    const max = top[0][1];
    const barAreaW = pageWidth - margin * 2 - 140;
    top.forEach(([id, count]) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...TEXT);
      doc.text(emotionLabel(id), margin, y + 10);
      const barW = (count / max) * barAreaW;
      doc.setFillColor(...PRIMARY);
      doc.roundedRect(margin + 110, y, barW, 12, 4, 4, "F");
      doc.setTextColor(...MUTED);
      doc.text(String(count), margin + 110 + barW + 6, y + 10);
      y += 20;
    });
    y += 8;
  }

  // ---- Detail list ----
  const ensureSpace = (h: number) => {
    if (y + h > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  ensureSpace(40);
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Détail des check-ins", margin, y);
  y += 16;

  // Table header
  doc.setFillColor(245, 240, 255);
  doc.rect(margin, y, pageWidth - margin * 2, 22, "F");
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("DATE", margin + 8, y + 14);
  doc.text("HEURE", margin + 130, y + 14);
  doc.text("ÉMOTION", margin + 200, y + 14);
  doc.text("TYPE", pageWidth - margin - 60, y + 14);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const rowsByDateDesc = [...checkins].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  rowsByDateDesc.forEach((c, i) => {
    ensureSpace(20);
    if (i % 2 === 1) {
      doc.setFillColor(250, 248, 253);
      doc.rect(margin, y, pageWidth - margin * 2, 20, "F");
    }
    doc.setTextColor(...TEXT);
    doc.text(fmtDate(c.created_at), margin + 8, y + 14);
    doc.text(fmtTime(c.created_at), margin + 130, y + 14);
    doc.text(emotionLabel(c.emotion), margin + 200, y + 14);
    if (c.emotion_type === "positive") {
      doc.setTextColor(...PRIMARY);
      doc.text("Positif", pageWidth - margin - 60, y + 14);
    } else {
      doc.setTextColor(200, 70, 80);
      doc.text("Négatif", pageWidth - margin - 60, y + 14);
    }
    y += 20;
  });

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      "Ancrage — Ton compagnon de régulation émotionnelle",
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" },
    );
    doc.text(`${p} / ${pageCount}`, pageWidth - margin, pageHeight - 20, { align: "right" });
  }

  const filename = `ancrage-checkins-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
