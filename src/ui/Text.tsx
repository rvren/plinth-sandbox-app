import { toneColor, type Tone } from "./tone";

export interface TextProps {
  text: string;
  size?: "sm" | "md";
  tone?: Tone;
  emphasis?: boolean;
}

export const Text = ({ text, size = "md", tone, emphasis = false }: TextProps) => (
  <p
    style={{
      margin: 0,
      fontSize: size === "sm" ? 12 : 13,
      color: toneColor(tone),
      fontWeight: emphasis ? 600 : 400,
      // Host strings can be arbitrarily long; wrap rather than blow out the layout.
      overflowWrap: "anywhere",
    }}
  >
    {text}
  </p>
);
