import jsPDF from "jspdf";

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export type JournalEntry = {
  id: string;
  prompt_key: string | null;
  content: string;
  created_at: string;
};

export type Portrait = {
  year: number;
  month: number;
  overcome: string;
  developing: string;
  new_strengths: string;
  becoming: string;
};

export type Chapter = {
  year: number;
  month: number; // 1-12
  portrait?: Portrait;
  entries: JournalEntry[];
  victories: JournalEntry[];
};

export type LivreMeta = {
  firstName?: string;
};

// Soft warm palette aligned with app aesthetic
const PRIMARY: [number, number, number] = [168, 119, 168]; // mauve doux
const ACCENT: [number, number, number] = [217, 164, 138]; // terracotta clair
const TEXT: [number, number, number] = [55, 45, 60];
const MUTED: [number, number, number] = [130, 120, 135];
const PAPER: [number, number, number] = [253, 249, 245];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

export function exportLivreReconstructionPdf(chapters: Chapter[], meta: LivreMeta = {}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 56;
  const CONTENT_W = W - M * 2;

  // ---- Cover page ----
  doc.setFillColor(...PAPER);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, W, 8, "F");
  doc.setFillColor(...ACCENT);
  doc.rect(0, H - 8, W, 8, "F");

  doc.setTextColor(...PRIMARY);
  doc.setFont("times", "italic");
  doc.setFontSize(14);
  doc.text("Un récit de toi, pour toi", W / 2, H / 2 - 90, { align: "center" });

  doc.setTextColor(...TEXT);
  doc.setFont("times", "bold");
  doc.setFontSize(34);
  doc.text("Mon Livre de", W / 2, H / 2 - 30, { align: "center" });
  doc.text("Reconstruction", W / 2, H / 2 + 10, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(28);
  doc.setTextColor(...ACCENT);
  doc.text("✦", W / 2, H / 2 + 50, { align: "center" });

  if (meta.firstName) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...MUTED);
    doc.text(meta.firstName, W / 2, H / 2 + 100, { align: "center" });
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(
    `Édition du ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}`,
    W / 2,
    H - 60,
    { align: "center" },
  );

  // ---- Chapters ----
  let y = M;
  const newPage = () => {
    doc.addPage();
    doc.setFillColor(...PAPER);
    doc.rect(0, 0, W, H, "F");
    y = M;
  };

  const ensure = (needed: number) => {
    if (y + needed > H - M) newPage();
  };

  const writeParagraph = (text: string, size = 11, color = TEXT, italic = false) => {
    if (!text) return;
    doc.setFont("times", italic ? "italic" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, CONTENT_W);
    for (const line of lines) {
      ensure(size + 4);
      doc.text(line, M, y);
      y += size + 4;
    }
  };

  const writeHeading = (text: string, size: number, color: [number, number, number], italic = false) => {
    ensure(size + 12);
    doc.setFont("times", italic ? "italic" : "bold");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(text, M, y);
    y += size + 8;
  };

  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i];
    newPage();

    // Chapter title page-like header
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(0.8);
    doc.line(M, y, M + 60, y);
    y += 16;

    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.setTextColor(...MUTED);
    doc.text(`Chapitre ${i + 1}`, M, y);
    y += 22;

    doc.setFont("times", "bold");
    doc.setFontSize(26);
    doc.setTextColor(...PRIMARY);
    doc.text(`${MONTHS[ch.month - 1]} ${ch.year}`, M, y);
    y += 28;

    doc.setDrawColor(...PRIMARY);
    doc.line(M, y, M + 40, y);
    y += 20;

    // Portrait
    if (ch.portrait) {
      writeHeading("Portrait du mois", 14, ACCENT);
      writeParagraph("Ce que tu as surmonté", 11, PRIMARY, true);
      writeParagraph(ch.portrait.overcome);
      y += 6;
      writeParagraph("Ce que tu développes", 11, PRIMARY, true);
      writeParagraph(ch.portrait.developing);
      y += 6;
      writeParagraph("Tes nouvelles forces", 11, PRIMARY, true);
      writeParagraph(ch.portrait.new_strengths);
      y += 6;
      writeParagraph("La femme que tu deviens", 11, PRIMARY, true);
      writeParagraph(ch.portrait.becoming);
      y += 14;
    }

    // Victoires
    if (ch.victories.length > 0) {
      writeHeading("Tes petites victoires", 14, ACCENT);
      for (const v of ch.victories) {
        writeParagraph(`✦ ${fmtDate(v.created_at)}`, 10, MUTED, true);
        writeParagraph(v.content || "—");
        y += 4;
      }
      y += 8;
    }

    // Journal
    if (ch.entries.length > 0) {
      writeHeading("Pages de journal", 14, ACCENT);
      for (const e of ch.entries) {
        writeParagraph(fmtDate(e.created_at), 10, MUTED, true);
        writeParagraph(e.content || "—");
        y += 8;
      }
    }

    if (!ch.portrait && ch.entries.length === 0 && ch.victories.length === 0) {
      writeParagraph("Aucune trace écrite ce mois-ci — mais tu étais là, et c'est déjà beaucoup.", 12, MUTED, true);
    }
  }

  // Page numbers
  const pageCount = doc.getNumberOfPages();
  for (let p = 2; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(`${p - 1}`, W / 2, H - 24, { align: "center" });
  }

  const name = meta.firstName ? `livre-reconstruction-${meta.firstName}.pdf` : "livre-reconstruction.pdf";
  doc.save(name);
}
