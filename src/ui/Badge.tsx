import { toneColor, type Tone } from "./tone";

export interface BadgeProps {
  text: string;
  tone?: Tone;
}

export const Badge = ({ text, tone }: BadgeProps) => (
  <span
    style={{
      fontSize: 11,
      padding: "2px 8px",
      borderRadius: 999,
      border: `1px solid ${toneColor(tone)}`,
      color: toneColor(tone),
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </span>
);
