"use client";

import { Button, Form, Input, InputNumber, Progress, Segmented } from "antd";
import { FaCheck, FaDumbbell, FaGlassWater, FaMinus, FaPersonRunning, FaPlus, FaUtensils } from "react-icons/fa6";
import { GiWrappedSweet } from "react-icons/gi";
import { MEALS, WATER_GOAL_L, type DayEntry, type EntryInput } from "@/lib/types";
import { MEAL_ICONS, sugarColor } from "./DayIcons";

// The Save button lives in the modal footer and submits via this form id.
export const ENTRY_FORM_ID = "entry-form";

const SUGAR_LABELS = ["No sugar", "A little", "Some", "Moderate", "A lot", "Way too much"];
const WATER_STEP_L = 0.25;

interface Props {
  entry: DayEntry;
  onSave: (values: EntryInput) => void;
}

// Big tappable on/off tile. Form.Item feeds it `checked` and `onChange`.
function ToggleTile({
  checked,
  onChange,
  icon,
  label,
  tone = "accent",
}: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  icon: React.ReactNode;
  label: string;
  tone?: "accent" | "good";
}) {
  return (
    <button
      type="button"
      className={`tile tile-${tone}${checked ? " tile-on" : ""}`}
      aria-pressed={!!checked}
      onClick={() => onChange?.(!checked)}
    >
      {checked && <FaCheck className="tile-check" />}
      <span className="tile-icon">{icon}</span>
      {label}
    </button>
  );
}

function WaterStepper({ value = 0, onChange }: { value?: number; onChange?: (value: number) => void }) {
  const change = (delta: number) => onChange?.(Math.min(10, Math.max(0, Math.round((value + delta) * 100) / 100)));
  const percent = Math.min(100, Math.round((value / WATER_GOAL_L) * 100));

  return (
    <div>
      <div className="stepper">
        <Button shape="circle" size="large" icon={<FaMinus />} aria-label="Less water" onClick={() => change(-WATER_STEP_L)} disabled={value <= 0} />
        <div className="stepper-value">
          {value} <small>L</small>
        </div>
        <Button shape="circle" size="large" icon={<FaPlus />} aria-label="More water" onClick={() => change(WATER_STEP_L)} />
      </div>
      <Progress percent={percent} strokeColor="var(--water)" size="small" format={() => `${percent}%`} />
      <div className="hint">Each tap is one glass (250 ml) · goal {WATER_GOAL_L} L</div>
    </div>
  );
}

function SugarPicker({ value = 0, onChange }: { value?: number; onChange?: (value: number) => void }) {
  return (
    <div>
      <Segmented<number>
        block
        value={value}
        onChange={onChange}
        options={SUGAR_LABELS.map((_, level) => ({ label: String(level), value: level }))}
      />
      <div className="sugar-label" style={{ color: sugarColor(value) }}>
        <GiWrappedSweet /> {SUGAR_LABELS[value]}
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="form-block">
      <h4 className="form-section">
        {icon} {title}
      </h4>
      {children}
    </section>
  );
}

export default function EntryForm({ entry, onSave }: Props) {
  const [form] = Form.useForm<EntryInput>();
  const jogging = Form.useWatch("jogging", form);
  const gym = Form.useWatch("gym", form);

  return (
    <Form
      form={form}
      name={ENTRY_FORM_ID}
      layout="vertical"
      initialValues={entry}
      onFinish={onSave}
      requiredMark={false}
    >
      <Section icon={<FaPersonRunning />} title="Exercise">
        <div className="tile-grid">
          <Form.Item name="jogging" valuePropName="checked" noStyle>
            <ToggleTile icon={<FaPersonRunning />} label="Jogging" />
          </Form.Item>
          <Form.Item name="gym" valuePropName="checked" noStyle>
            <ToggleTile icon={<FaDumbbell />} label="Gym" />
          </Form.Item>
        </div>
        {jogging && (
          <Form.Item name="distanceKm" label="How far?" className="follow-up">
            <InputNumber min={0} max={200} step={0.5} suffix="km" inputMode="decimal" style={{ width: "100%" }} />
          </Form.Item>
        )}
        {gym && (
          <Form.Item name="workout" label="What did you train?" className="follow-up">
            <Input placeholder="e.g. Legs, Upper body, Cardio" maxLength={100} />
          </Form.Item>
        )}
      </Section>

      <Section icon={<FaGlassWater />} title="Water">
        <Form.Item name="waterL" noStyle>
          <WaterStepper />
        </Form.Item>
      </Section>

      <Section icon={<GiWrappedSweet />} title="Sugar">
        <Form.Item name="sugar" noStyle>
          <SugarPicker />
        </Form.Item>
      </Section>

      <Section icon={<FaUtensils />} title="Stuck to my diet plan at">
        <div className="tile-grid tile-grid-3">
          {MEALS.map((meal) => {
            const Icon = MEAL_ICONS[meal];
            return (
              <Form.Item key={meal} name={["diet", meal]} valuePropName="checked" noStyle>
                <ToggleTile icon={<Icon />} label={meal[0].toUpperCase() + meal.slice(1)} tone="good" />
              </Form.Item>
            );
          })}
        </div>
      </Section>

      <Form.Item name="note" style={{ marginBottom: 0 }}>
        <Input.TextArea autoSize={{ minRows: 1, maxRows: 4 }} maxLength={500} placeholder="Add a note (optional)" />
      </Form.Item>
    </Form>
  );
}
