import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";

interface Props {
  checkinDates: Set<string>;
}

const DAYS_FR = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const StreakCalendar = ({ checkinDates }: Props) => {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { year, month, days, firstDayOffset } = useMemo(() => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rawDay = d.getDay();
    const firstDayOffset = rawDay === 0 ? 6 : rawDay - 1;
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return { year, month, days, firstDayOffset };
  }, [monthOffset]);

  const today = new Date().toISOString().split("T")[0];

  const isCheckedIn = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return checkinDates.has(dateStr);
  };

  const isToday = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return dateStr === today;
  };

  const isFuture = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return dateStr > today;
  };

  const isPartOfStreak = (day: number) => {
    if (!isCheckedIn(day)) return false;
    const prevDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day - 1).padStart(2, "0")}`;
    const nextDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day + 1).padStart(2, "0")}`;
    return checkinDates.has(prevDate) || checkinDates.has(nextDate);
  };

  const handleDayClick = (day: number) => {
    if (isCheckedIn(day)) {
      setSelectedDay(selectedDay === day ? null : day);
    }
  };

  return (
    <div className="rounded-xl bg-card p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setMonthOffset((o) => o - 1)}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold">
          {MONTHS_FR[month]} {year}
        </p>
        <button
          onClick={() => setMonthOffset((o) => Math.min(o + 1, 0))}
          disabled={monthOffset >= 0}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_FR.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const checked = isCheckedIn(day);
          const streak = isPartOfStreak(day);
          const todayCell = isToday(day);
          const future = isFuture(day);

          return (
            <motion.button
              key={day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: day * 0.01 }}
              onClick={() => handleDayClick(day)}
              disabled={future || !checked}
              className={`flex h-8 w-full items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                future
                  ? "text-muted-foreground/30"
                  : checked
                    ? streak
                      ? "bg-primary text-primary-foreground cursor-pointer"
                      : "bg-primary/60 text-primary-foreground cursor-pointer"
                    : todayCell
                      ? "ring-1 ring-primary/40 text-foreground"
                      : "text-muted-foreground"
              }`}
            >
              {day}
            </motion.button>
          );
        })}
      </div>

      {/* Emotional message when clicking a checked day */}
      <AnimatePresence>
        {selectedDay && isCheckedIn(selectedDay) && (
          <motion.div
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            className="mt-3 rounded-lg bg-primary/5 border border-primary/10 p-3 text-center"
          >
            <p className="text-xs font-medium text-primary">
              💛 Ce jour-là, tu t'es choisie
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-primary" />
          Check-in
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded ring-1 ring-primary/40" />
          Aujourd'hui
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;
