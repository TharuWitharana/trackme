"use client";

import { App, Button, Calendar, Card, Flex, Grid, Modal, Popconfirm, Segmented } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaDroplet,
  FaDumbbell,
  FaGlassWater,
  FaHeart,
  FaHeartPulse,
  FaPersonRunning,
  FaPlus,
  FaTrashCan,
  FaUtensils,
} from "react-icons/fa6";
import { GiWrappedSweet } from "react-icons/gi";
import { setTheme, useThemeName, type ThemeName } from "@/app/providers";
import { DATE_FORMAT, emptyEntry, type DayEntry, type EntryInput, type EntryMap } from "@/lib/types";
import DayIcons from "./DayIcons";
import EntryForm, { ENTRY_FORM_ID } from "./EntryForm";
import MonthSummary from "./MonthSummary";

const LEGEND = [
  { icon: <FaPersonRunning />, label: "Jogging", color: "var(--accent)" },
  { icon: <FaDumbbell />, label: "Gym", color: "var(--accent)" },
  { icon: <FaGlassWater />, label: "Water goal met", color: "var(--water)" },
  { icon: <GiWrappedSweet />, label: "No sugar", color: "var(--good)" },
  { icon: <GiWrappedSweet />, label: "Some sugar", color: "var(--warn)" },
  { icon: <GiWrappedSweet />, label: "Lots of sugar", color: "var(--bad)" },
  { icon: <FaUtensils />, label: "Meal on plan", color: "var(--good)" },
  { icon: <FaUtensils />, label: "Meal off plan", color: "var(--bad)" },
];

export default function Tracker({ initialEntries }: { initialEntries: EntryMap }) {
  const { message } = App.useApp();
  const screens = Grid.useBreakpoint();
  const isMobile = screens.sm === false;
  const compact = screens.md === false;
  const theme = useThemeName();

  const [entries, setEntries] = useState(initialEntries);
  const [month, setMonth] = useState<Dayjs>(() => dayjs());
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(values: EntryInput) {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/entries/${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved: DayEntry = await res.json();
      setEntries((prev) => ({ ...prev, [saved.date]: saved }));
      setEditing(null);
      message.success("Saved!");
    } catch {
      message.error("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!editing) return;
    const date = editing;
    setSaving(true);
    try {
      const res = await fetch(`/api/entries/${date}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setEntries((prev) => {
        const next = { ...prev };
        delete next[date];
        return next;
      });
      setEditing(null);
      message.success("Deleted");
    } catch {
      message.error("Could not delete. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <FaHeartPulse /> TrackMe
        </div>
        <Segmented<ThemeName>
          value={theme}
          onChange={setTheme}
          options={[
            { label: "Pink", value: "pink", icon: <FaHeart /> },
            { label: "Blue", value: "blue", icon: <FaDroplet /> },
          ]}
        />
      </header>

      <main className="content">
        <MonthSummary entries={entries} month={month} />

        <Card className="calendar-card">
          <Calendar
            value={month}
            onChange={setMonth}
            onSelect={(date, { source }) => {
              if (source === "date") setEditing(date.format(DATE_FORMAT));
            }}
            disabledDate={(date) => date.isAfter(dayjs(), "day")}
            headerRender={({ value, onChange }) => (
              <Flex justify="space-between" align="center" gap={8} className="calendar-header">
                <Button
                  shape="circle"
                  icon={<FaChevronLeft />}
                  aria-label="Previous month"
                  onClick={() => onChange(value.subtract(1, "month"))}
                />
                <span className="calendar-title">{value.format(isMobile ? "MMM YYYY" : "MMMM YYYY")}</span>
                <Flex gap={8}>
                  <Button onClick={() => onChange(dayjs())}>Today</Button>
                  <Button
                    shape="circle"
                    icon={<FaChevronRight />}
                    aria-label="Next month"
                    onClick={() => onChange(value.add(1, "month"))}
                  />
                </Flex>
              </Flex>
            )}
            cellRender={(date, info) => {
              if (info.type !== "date") return info.originNode;
              const entry = entries[date.format(DATE_FORMAT)];
              return entry ? <DayIcons entry={entry} compact={compact} /> : null;
            }}
          />
        </Card>

        <Card size="small" title="Legend">
          <Flex wrap gap="small" className="legend">
            {LEGEND.map((item) => (
              <span key={item.label} className="legend-item">
                <span style={{ color: item.color }}>{item.icon}</span> {item.label}
              </span>
            ))}
          </Flex>
        </Card>
      </main>

      <Button
        type="primary"
        shape="round"
        size="large"
        icon={<FaPlus />}
        className="fab"
        onClick={() => setEditing(dayjs().format(DATE_FORMAT))}
      >
        Log today
      </Button>

      <Modal
        open={editing !== null}
        onCancel={() => setEditing(null)}
        title={editing ? dayjs(editing).format("dddd, D MMM YYYY") : ""}
        rootClassName="entry-modal"
        width={480}
        centered
        destroyOnHidden
        footer={
          <Flex justify="flex-end" align="center" gap={8}>
            {editing && entries[editing] && (
              <Popconfirm
                title="Delete this day's log?"
                onConfirm={remove}
                okText="Delete"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  size="large"
                  shape="circle"
                  icon={<FaTrashCan />}
                  aria-label="Delete this day's log"
                  disabled={saving}
                />
              </Popconfirm>
            )}
            <Button
              type="primary"
              htmlType="submit"
              form={ENTRY_FORM_ID}
              loading={saving}
              size="large"
              className="save-btn"
            >
              Save
            </Button>
          </Flex>
        }
      >
        {editing && <EntryForm key={editing} entry={entries[editing] ?? emptyEntry(editing)} onSave={save} />}
      </Modal>
    </div>
  );
}
