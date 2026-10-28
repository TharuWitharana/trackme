export const MEALS = ["breakfast", "lunch", "dinner"] as const;
export type Meal = (typeof MEALS)[number];

export interface DayEntry {
  date: string; // YYYY-MM-DD
  jogging: boolean;
  distanceKm: number;
  gym: boolean;
  workout: string;
  waterL: number;
  sugar: number; // 0 = none, 5 = a lot
  diet: Record<Meal, boolean>;
  note: string;
}

export type EntryMap = Record<string, DayEntry>;
export type EntryInput = Omit<DayEntry, "date">;

export const DATE_FORMAT = "YYYY-MM-DD";
export const WATER_GOAL_L = 2.5;

export function isValidDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date));
}

export function emptyEntry(date: string): DayEntry {
  return {
    date,
    jogging: false,
    distanceKm: 0,
    gym: false,
    workout: "",
    waterL: 0,
    sugar: 0,
    diet: { breakfast: false, lunch: false, dinner: false },
    note: "",
  };
}

function clamp(value: unknown, min: number, max: number) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : 0;
}

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

// Turns untrusted request data into a well-formed entry.
export function sanitizeEntry(date: string, raw: unknown): DayEntry {
  const r = (raw ?? {}) as Partial<Record<keyof DayEntry, unknown>>;
  const diet = (r.diet ?? {}) as Partial<Record<Meal, unknown>>;
  const jogging = r.jogging === true;
  const gym = r.gym === true;

  return {
    date,
    jogging,
    distanceKm: jogging ? Math.round(clamp(r.distanceKm, 0, 200) * 100) / 100 : 0,
    gym,
    workout: gym ? text(r.workout, 100) : "",
    waterL: Math.round(clamp(r.waterL, 0, 10) * 100) / 100,
    sugar: Math.round(clamp(r.sugar, 0, 5)),
    diet: {
      breakfast: diet.breakfast === true,
      lunch: diet.lunch === true,
      dinner: diet.dinner === true,
    },
    note: text(r.note, 500),
  };
}
