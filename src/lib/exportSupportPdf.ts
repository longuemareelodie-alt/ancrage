import jsPDF from "jspdf";
import { SUPPORT_TYPES, SupportItem, SupportType } from "@/data/supportTemplates";

export type PdfFormat = "a4" | "a5";

export type SupportSheet = {
  title: string;
  type: SupportType;
  childName?: string;
  items: SupportItem[];
  subtitle?: string;
};

type Meta = SupportSheet & { format?: PdfFormat };

type Geometry = { W: number; H: number; M: number; k: number; bottom: number };

const geometry = (format: PdfFormat): Geometry => {
  const W = format === "a4" ? 210 : 148;
  const H = format === "a4" ? 297 : 210;
  const M = format === "a4" ? 18 : 13;
  return { W, H, M, k: format === "a4" ? 1 : 0.72, bottom: H - M };
};

/**
 * Dessine une feuille de support à partir de `y`, et renvoie le `y` final.
 * Sans filigrane, sans élément d'interface : la page doit rester lisible
 * quand elle est affichée sur un frigo, à hauteur d'enfant.
 */
function drawSheet(doc: jsPDF, sheet: SupportSheet, g: Geometry, startY: number): number {
  const { W, M, k, bottom } = g;
  const def = SUPPORT_TYPES[sheet.type];
  let y = startY;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24 * k);
  doc.setTextColor(30);
  doc.text(sheet.title, M, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11 * k);
  doc.setTextColor(120);
  doc.text(
    [def?.label ?? sheet.type, sheet.childName, sheet.subtitle].filter(Boolean).join(" · "),
    M,
    y + 8 * k,
  );
  doc.setTextColor(30);

  y += 22 * k;

  const newPageIfNeeded = (h: number) => {
    if (y + h > bottom) {
      doc.addPage();
      y = M + 10 * k;
    }
  };

  const { type, items } = sheet;

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

  return y;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Export imprimable d'un support d'autonomie, en A4 ou A5. */
export function exportSupportPdf({ format = "a4", ...sheet }: Meta) {
  const doc = new jsPDF({ unit: "mm", format });
  const g = geometry(format);
  drawSheet(doc, sheet, g, g.M + 10 * g.k);
  doc.save(`${slugify(sheet.title) || "support"}-${format}.pdf`);
}

/**
 * Fusionne plusieurs supports dans un seul document imprimable :
 * une feuille par support, avec une page de garde quand il y en a plusieurs.
 */
export function exportMergedSupportsPdf(
  sheets: SupportSheet[],
  options: { format?: PdfFormat; docTitle?: string; childName?: string } = {},
) {
  if (!sheets.length) return;
  const format = options.format ?? "a4";
  const doc = new jsPDF({ unit: "mm", format });
  const g = geometry(format);
  const { M, k, W, H } = g;
  const title = options.docTitle?.trim() || "Mes supports";

  if (sheets.length > 1) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30 * k);
    doc.setTextColor(30);
    doc.text(title, M, H / 2 - 10 * k, { maxWidth: W - M * 2 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12 * k);
    doc.setTextColor(120);
    doc.text(
      [options.childName, `${sheets.length} supports`].filter(Boolean).join(" · "),
      M,
      H / 2 + 2 * k,
    );
    doc.setFontSize(10 * k);
    let ly = H / 2 + 16 * k;
    sheets.forEach((s, i) => {
      doc.text(`${i + 1}. ${s.title}`, M, ly, { maxWidth: W - M * 2 });
      ly += 7 * k;
    });
    doc.setTextColor(30);
  }

  sheets.forEach((sheet, i) => {
    if (i > 0 || sheets.length > 1) doc.addPage();
    drawSheet(doc, sheet, g, M + 10 * k);
  });

  doc.save(`${slugify(title) || "supports"}-${format}.pdf`);
}
