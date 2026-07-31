import jsPDF from "jspdf";
import { SUPPORT_TYPES, SupportItem, SupportType } from "@/data/supportTemplates";

type Meta = {
  title: string;
  type: SupportType;
  childName?: string;
  items: SupportItem[];
};

/**
 * Export imprimable d'un support d'autonomie.
 * Gros caractères, beaucoup de blanc : la feuille doit rester lisible
 * quand elle est affichée sur un frigo, à hauteur d'enfant.
 */
export function exportSupportPdf({ title, type, childName, items }: Meta) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 18;
  const def = SUPPORT_TYPES[type];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(title, M, 28);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(120);
  doc.text([def.label, childName].filter(Boolean).join(" · "), M, 36);
  doc.setTextColor(30);

  let y = 50;

  const newPageIfNeeded = (h: number) => {
    if (y + h > 280) {
      doc.addPage();
      y = 28;
    }
  };

  if (type === "cartes") {
    const cols = 2;
    const cw = (W - M * 2 - 8) / cols;
    const ch = 42;
    items.forEach((item, i) => {
      const col = i % cols;
      if (col === 0) newPageIfNeeded(ch + 8);
      const x = M + col * (cw + 8);
      doc.setDrawColor(190);
      doc.roundedRect(x, y, cw, ch, 4, 4);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(item.label, x + cw / 2, y + ch / 2 + 2, { align: "center", maxWidth: cw - 10 });
      if (col === cols - 1) y += ch + 8;
    });
    if (items.length % cols !== 0) y += ch + 8;
  } else if (type === "recompenses") {
    const stars = 5;
    items.forEach((item) => {
      newPageIfNeeded(20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.text(item.label, M, y + 5, { maxWidth: 110 });
      for (let s = 0; s < stars; s++) {
        doc.setDrawColor(190);
        doc.circle(140 + s * 13, y + 3, 4.5);
      }
      y += 18;
      doc.setDrawColor(230);
      doc.line(M, y - 6, W - M, y - 6);
    });
  } else {
    items.forEach((item, i) => {
      newPageIfNeeded(18);
      doc.setDrawColor(190);
      if (type === "checklist") {
        doc.roundedRect(M, y - 4, 7, 7, 1.5, 1.5);
      } else {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(150);
        doc.text(String(i + 1), M, y + 1.5);
        doc.setTextColor(30);
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      const left = M + 13;
      if (item.time) {
        doc.setFont("helvetica", "bold");
        doc.text(item.time, left, y + 1.5);
        doc.setFont("helvetica", "normal");
        doc.text(item.label, left + 20, y + 1.5, { maxWidth: W - left - 20 - M });
      } else {
        doc.text(item.label, left, y + 1.5, { maxWidth: W - left - M });
      }
      if (item.note) {
        y += 6;
        doc.setFontSize(10);
        doc.setTextColor(130);
        doc.text(item.note, left, y + 1.5, { maxWidth: W - left - M });
        doc.setTextColor(30);
      }
      y += type === "histoire" ? 16 : 14;
    });
  }

  doc.setFontSize(9);
  doc.setTextColor(160);
  doc.text("Créé avec Eclosia", M, 290);

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  doc.save(`eclosia-${slug || "support"}.pdf`);
}
