"use client";

import { Card, Col, Row, Statistic } from "antd";
import type { Dayjs } from "dayjs";
import { FaDumbbell, FaGlassWater, FaPersonRunning, FaRoute, FaUtensils } from "react-icons/fa6";
import { GiWrappedSweet } from "react-icons/gi";
import { MEALS, type EntryMap } from "@/lib/types";

export default function MonthSummary({ entries, month }: { entries: EntryMap; month: Dayjs }) {
  const prefix = month.format("YYYY-MM");
  const days = Object.values(entries).filter((entry) => entry.date.startsWith(prefix));

  const jogDays = days.filter((d) => d.jogging).length;
  const totalKm = days.reduce((sum, d) => sum + d.distanceKm, 0);
  const gymDays = days.filter((d) => d.gym).length;
  const avgWater = days.length ? days.reduce((sum, d) => sum + d.waterL, 0) / days.length : 0;
  const sugarFree = days.filter((d) => d.sugar === 0).length;
  const mealsFollowed = days.reduce((sum, d) => sum + MEALS.filter((m) => d.diet[m]).length, 0);
  const dietPct = days.length ? Math.round((mealsFollowed / (days.length * 3)) * 100) : 0;

  const stats = [
    { title: "Jog days", value: jogDays, icon: <FaPersonRunning /> },
    { title: "Distance", value: Number(totalKm.toFixed(1)), suffix: "km", icon: <FaRoute /> },
    { title: "Gym days", value: gymDays, icon: <FaDumbbell /> },
    { title: "Avg water", value: Number(avgWater.toFixed(1)), suffix: "L", icon: <FaGlassWater /> },
    { title: "Sugar-free", value: sugarFree, suffix: "days", icon: <GiWrappedSweet /> },
    { title: "Diet followed", value: dietPct, suffix: "%", icon: <FaUtensils /> },
  ];

  return (
    <Row gutter={[12, 12]}>
      {stats.map((stat) => (
        <Col key={stat.title} xs={12} sm={8} lg={4}>
          <Card size="small" className="stat-card">
            <Statistic
              title={stat.title}
              value={stat.value}
              suffix={stat.suffix}
              prefix={<span className="stat-icon">{stat.icon}</span>}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
