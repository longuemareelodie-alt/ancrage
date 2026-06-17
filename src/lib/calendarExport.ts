// Helpers to export an appointment to external calendars
// without requiring any OAuth/Google API setup.

export interface CalendarEvent {
  title: string;
  startISO: string; // ISO datetime string
  durationMinutes?: number; // default 60
  location?: string;
  notes?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Format a Date as UTC compact string: 20251231T120000Z */
const toICSDate = (d: Date): string =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
    d.getUTCHours(),
  )}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

const getEnd = (e: CalendarEvent): Date => {
  const start = new Date(e.startISO);
  return new Date(start.getTime() + (e.durationMinutes ?? 60) * 60_000);
};

/**
 * Build a Google Calendar "create event" URL.
 * Opens Google Calendar prefilled with the event details.
 */
export const buildGoogleCalendarUrl = (e: CalendarEvent): string => {
  const start = new Date(e.startISO);
  const end = getEnd(e);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${toICSDate(start)}/${toICSDate(end)}`,
  });
  if (e.location) params.set("location", e.location);
  if (e.notes) params.set("details", e.notes);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/** Escape a value for ICS field. */
const escapeICS = (s: string): string =>
  s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

/** Build a .ics VCALENDAR string compatible with Apple/Outlook/Google import. */
export const buildICS = (e: CalendarEvent): string => {
  const start = new Date(e.startISO);
  const end = getEnd(e);
  const uid = `${start.getTime()}-${Math.random().toString(36).slice(2, 10)}@ancrage`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eclosia//RDV//FR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${escapeICS(e.title)}`,
  ];
  if (e.location) lines.push(`LOCATION:${escapeICS(e.location)}`);
  if (e.notes) lines.push(`DESCRIPTION:${escapeICS(e.notes)}`);
  lines.push("BEGIN:VALARM", "TRIGGER:-PT1H", "ACTION:DISPLAY", `DESCRIPTION:${escapeICS(e.title)}`, "END:VALARM");
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
};

/** Trigger a download of an .ics file in the browser. */
export const downloadICS = (e: CalendarEvent, filename = "rendez-vous.ics") => {
  const blob = new Blob([buildICS(e)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
