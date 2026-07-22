import jsPDF from "jspdf";

const PRIMARY: [number, number, number] = [168, 119, 168];
const ACCENT: [number, number, number] = [217, 164, 138];
const TEXT: [number, number, number] = [55, 45, 60];
const MUTED: [number, number, number] = [130, 120, 135];
const PAPER: [number, number, number] = [253, 249, 245];

export type QuizResultPdfData = {
  firstName?: string;
  badge: string;
  headline: string;
  message: string;
  modules: { title: string; desc: string }[];
  priceLabel: string;
};

export function exportQuizResultPdf(data: QuizResultPdfData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 56;
  const CW = W - M * 2;

  // Background
  doc.setFillColor(...PAPER);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, W, 8, "F");
  doc.setFillColor(...ACCENT);
  doc.rect(0, H - 8, W, 8, "F");

  let y = M + 20;

  // Badge
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY);
  doc.text(data.badge.toUpperCase(), M, y, { charSpace: 2 });
  y += 30;

  // Intro
  if (data.firstName) {
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.setTextColor(...MUTED);
    doc.text(`${data.firstName}, voici ce que tes réponses racontent.`, M, y);
    y += 26;
  }

  // Headline
  doc.setFont("times", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...TEXT);
  const headlineLines = doc.splitTextToSize(data.headline, CW);
  for (const line of headlineLines) {
    doc.text(line, M, y);
    y += 32;
  }
  y += 4;

  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(1);
  doc.line(M, y, M + 50, y);
  y += 22;

  // Message
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...TEXT);
  const msgLines = doc.splitTextToSize(data.message, CW);
  for (const line of msgLines) {
    doc.text(line, M, y);
    y += 18;
  }
  y += 20;

  // Modules heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY);
  doc.text("TA FEUILLE DE ROUTE", M, y, { charSpace: 2 });
  y += 20;

  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...TEXT);
  doc.text("Les espaces à activer en priorité", M, y);
  y += 24;

  // Modules
  for (const m of data.modules) {
    if (y > H - 140) {
      doc.addPage();
      doc.setFillColor(...PAPER);
      doc.rect(0, 0, W, H, "F");
      y = M;
    }
    doc.setFont("times", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...PRIMARY);
    doc.text(`✦  ${m.title}`, M, y);
    y += 18;
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...TEXT);
    const dLines = doc.splitTextToSize(m.desc, CW - 20);
    for (const line of dLines) {
      doc.text(line, M + 20, y);
      y += 15;
    }
    y += 10;
  }

  // Footer / CTA
  const footerY = H - 90;
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(M, footerY - 20, W - M, footerY - 20);

  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  doc.text("Ta prochaine étape — Eclosia, accès à vie", M, footerY);

  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...TEXT);
  doc.text(data.priceLabel, M, footerY + 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("eclosiia.lovable.app", W - M, footerY + 22, { align: "right" });

  const name = data.firstName
    ? `mon-resultat-eclosia-${data.firstName}.pdf`
    : "mon-resultat-eclosia.pdf";
  doc.save(name);
}
