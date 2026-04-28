import { emotions } from "@/data/emotions";
import type { CheckinExport, ExportMeta, ExportOptions } from "./exportCheckinsPdf";

const emotionLabel = (id: string) => emotions.find((e) => e.id === id)?.label ?? id;

const escapeCsv = (val: string | number | null | undefined) => {
  const s = val == null ? "" : String(val);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

export function exportCheckinsToCsv(
  checkins: CheckinExport[],
  meta: ExportMeta = {},
  options: ExportOptions = { includeFirstName: true, includeEmail: false, anonymize: false },
) {
  const { anonymize = false } = options;
  const showFirstName = !anonymize && (options.includeFirstName ?? true) && !!meta.firstName;
  const showEmail = !anonymize && (options.includeEmail ?? false) && !!meta.email;

  const headers = ["date", "heure", "emotion_id", "emotion", "type"];
  if (showFirstName) headers.push("prenom");
  if (showEmail) headers.push("email");

  const sorted = [...checkins].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const lines: string[] = [headers.join(",")];
  sorted.forEach((c) => {
    const d = new Date(c.created_at);
    const date = d.toISOString().slice(0, 10);
    const time = d.toTimeString().slice(0, 5);
    const row = [
      escapeCsv(date),
      escapeCsv(time),
      escapeCsv(c.emotion),
      escapeCsv(emotionLabel(c.emotion)),
      escapeCsv(c.emotion_type),
    ];
    if (showFirstName) row.push(escapeCsv(meta.firstName));
    if (showEmail) row.push(escapeCsv(meta.email));
    lines.push(row.join(","));
  });

  // BOM for Excel UTF-8 compatibility
  const csv = "\uFEFF" + lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const suffix = anonymize ? "-anonyme" : "";
  const filename = `ancrage-checkins${suffix}-${new Date().toISOString().slice(0, 10)}.csv`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
