import { FaDumbbell, FaGlassWater, FaPersonRunning, FaUtensils } from "react-icons/fa6";
import { GiWrappedSweet } from "react-icons/gi";
import { MdDinnerDining, MdFreeBreakfast, MdLunchDining } from "react-icons/md";
import { MEALS, WATER_GOAL_L, type DayEntry, type Meal } from "@/lib/types";

export const MEAL_ICONS: Record<Meal, React.ComponentType> = {
  breakfast: MdFreeBreakfast,
  lunch: MdLunchDining,
  dinner: MdDinnerDining,
};

export function sugarColor(level: number) {
  if (level === 0) return "var(--good)";
  return level <= 2 ? "var(--warn)" : "var(--bad)";
}

// Icons shown inside a calendar day. `compact` packs them tighter for phones.
export default function DayIcons({ entry, compact }: { entry: DayEntry; compact: boolean }) {
  const mealsFollowed = MEALS.filter((meal) => entry.diet[meal]).length;
  const dietColor =
    mealsFollowed === 3 ? "var(--good)" : mealsFollowed === 0 ? "var(--bad)" : "var(--warn)";

  return (
    <div className="day-icons">
      {entry.jogging && (
        <span className="day-icon" style={{ color: "var(--accent)" }} title={`Jogged ${entry.distanceKm} km`}>
          <FaPersonRunning />
          {!compact && entry.distanceKm > 0 && <small>{entry.distanceKm}k</small>}
        </span>
      )}
      {entry.gym && (
        <span className="day-icon" style={{ color: "var(--accent)" }} title={entry.workout ? `Gym: ${entry.workout}` : "Gym"}>
          <FaDumbbell />
        </span>
      )}
      {entry.waterL > 0 && (
        <span
          className="day-icon"
          style={{ color: entry.waterL >= WATER_GOAL_L ? "var(--water)" : "var(--muted)" }}
          title={`Water ${entry.waterL} L`}
        >
          <FaGlassWater />
          {!compact && <small>{entry.waterL}L</small>}
        </span>
      )}
      <span className="day-icon" style={{ color: sugarColor(entry.sugar) }} title={`Sugar ${entry.sugar}/5`}>
        <GiWrappedSweet />
        {!compact && <small>{entry.sugar}</small>}
      </span>
      {compact ? (
        <span className="day-icon" style={{ color: dietColor }} title={`Diet ${mealsFollowed}/3 meals`}>
          <FaUtensils />
        </span>
      ) : (
        MEALS.map((meal) => {
          const Icon = MEAL_ICONS[meal];
          return (
            <span
              key={meal}
              className="day-icon"
              style={{ color: entry.diet[meal] ? "var(--good)" : "var(--bad)" }}
              title={`${meal}: ${entry.diet[meal] ? "followed" : "missed"}`}
            >
              <Icon />
            </span>
          );
        })
      )}
    </div>
  );
}
