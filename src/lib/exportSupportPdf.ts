import jsPDF from "jspdf";
import { SUPPORT_TYPES, SupportItem, SupportType } from "@/data/supportTemplates";

export type PdfFormat = "a4" | "a5";

type Meta = {
  title: string;
  type: SupportType;
  childName?: string;
  items: SupportItem[];
  format?: PdfFormat;
};

/**
 * Export imprimable d'un support d'autonomie.
 * A4 ou A5, marges généreuses, gros caractères : la feuille doit rester lisible
 * quand elle est affichée sur un frigo, à hauteur d'enfant. Aucun filigrane.
 */
export function exportSupportPdf({ title, type, childName, items, format = "a4" }: Meta) {
  const doc = new jsPDF({ unit: "mm", format });
  const W = format === "a4" ? 210 : 148;
  const H = format === "a4" ? 297 : 210;
  const M = format === "a4" ? 18 : 13;
  const k = format === "a4" ? 1 : 0.72; // facteur d'échelle typographique
  const bottom = H - M;
  const def = SUPPORT_TYPES[type];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24 * k);
  doc.text(title, M, M + 10 * k);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11 * k);
  doc.setTextColor(120);
  doc.text([def.label, childName].filter(Boolean).join(" · "), M, M + 18 * k);
  doc.setTextColor(30);

  let y = M + 32 * k;

  const newPageIfNeeded = (h: number) => {
    if (y + h > bottom) {
      doc.addPage();
      y = M + 10 * k;
    }
  };

  if (type === "cartes") {
    const cols = 2;
    const gap = 8 * k;
    const cw = (W - M * 2 - gap) / cols;
    const ch = 42 * k;
    items.forEach((item, i) => {
      const col = i % cols;
      if (col === 0) newPageIfNeeded(ch + gap);
      const x = M + col * (cw + gap);
      doc.setDrawColor(190);
      doc.roundedRect(x, y, cw, ch, 4, 4);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16 * k);
      doc.text(item.label, x + cw / 2, y + ch / 2 + 2, { align: "center", maxWidth: cw - 10 });
      if (col === cols - 1) y += ch + gap;
    });
    if (items.length % cols !== 0) y += ch + gap;
  } else if (type === "recompenses") {
    const stars = 5;
    const starGap = 13 * k;
    const starX = W - M - stars * starGap + starGap / 2;
    items.forEach((item) => {
      newPageIfNeeded(20 * k);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(13 * k);
      doc.text(item.label, M, y + 5 * k, { maxWidth: starX - M - 6 });
      for (let s = 0; s < stars; s++) {
        doc.setDrawColor(190);
        doc.circle(starX + s * starGap, y + 3 * k, 4.5 * k);
      }
      y += 18 * k;
      doc.setDrawColor(230);
      doc.line(M, y - 6 * k, W - M, y - 6 * k);
    });
  } else {
    items.forEach((item, i) => {
      newPageIfNeeded(18 * k);
      doc.setDrawColor(190);
      if (type === "checklist") {
        doc.roundedRect(M, y - 4 * k, 7 * k, 7 * k, 1.5, 1.5);
      } else {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12 * k);
        doc.setTextColor(150);
        doc.text(String(i + 1), M, y + 1.5 * k);
        doc.setTextColor(30);
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14 * k);
      const left = M + 13 * k;
      if (item.time) {
        doc.setFont("helvetica", "bold");
        doc.text(item.time, left, y + 1.5 * k);
        doc.setFont("helvetica", "normal");
        doc.text(item.label, left + 20 * k, y + 1.5 * k, {
          maxWidth: W - left - 20 * k - M,
        });
      } else {
        doc.text(item.label, left, y + 1.5 * k, { maxWidth: W - left - M });
      }
      if (item.note) {
        y += 6 * k;
        doc.setFontSize(10 * k);
        doc.setTextColor(130);
        doc.text(item.note, left, y + 1.5 * k, { maxWidth: W - left - M });
        doc.setTextColor(30);
      }
      y += (type === "histoire" ? 16 : 14) * k;
    });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  doc.save(`${slug || "support"}-${format}.pdf`);
}
