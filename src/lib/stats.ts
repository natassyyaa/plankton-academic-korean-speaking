/** Dashboard statistics computed from real practice history. Pure, unit-tested. */
export type HistoryRow = {
  created_at: string;
  duration_seconds: number | null;
  status: string;
  report: Partial<Record<"overall_score" | "grammar" | "vocabulary" | "fluency" | "pronunciation" | "academic" | "organisation", number | null>> | null;
};

const SKILLS = ["grammar", "vocabulary", "fluency", "pronunciation", "academic", "organisation"] as const;

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function computeStats(rows: HistoryRow[], now: Date = new Date()) {
  const totalSessions = rows.length;
  const weekStart = new Date(now);
  weekStart.setUTCHours(0, 0, 0, 0);
  weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7)); // Monday
  const minutesThisWeek = Math.round(
    rows.filter((r) => new Date(r.created_at) >= weekStart).reduce((a, r) => a + (r.duration_seconds ?? 0), 0) / 60,
  );

  const weekly = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
    const d = new Date(weekStart);
    d.setUTCDate(d.getUTCDate() + i);
    const key = dayKey(d);
    const secs = rows.filter((r) => r.created_at.slice(0, 10) === key).reduce((a, r) => a + (r.duration_seconds ?? 0), 0);
    return { day, minutes: Math.round(secs / 60) };
  });

  const days = new Set(rows.map((r) => r.created_at.slice(0, 10)));
  let streakDays = 0;
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1); // today not practised yet keeps yesterday's streak
  while (days.has(dayKey(cursor))) {
    streakDays++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  const skills = Object.fromEntries(
    SKILLS.map((k) => {
      const vals = rows.map((r) => r.report?.[k]).filter((v): v is number => typeof v === "number");
      return [k, vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null];
    }),
  ) as Record<(typeof SKILLS)[number], number | null>;

  const reportCount = rows.filter((r) => r.report).length;
  return { totalSessions, minutesThisWeek, weekly, streakDays, skills, reportCount };
}
