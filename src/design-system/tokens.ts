import type { DesignSystemContract } from "@plinth/contract";

/**
 * Meridian's design system, in DTCG format.
 *
 * Expressed as a DesignSystemContract rather than as ad-hoc CSS because that is what the
 * ingest agent will later produce automatically from a real customer's application. The
 * fixture and the extracted artifact need to be the same shape, or the pipeline is only
 * ever tested against hand-written input.
 */
export const meridianDesignSystem: DesignSystemContract = {
  name: "Meridian",
  version: "2.4.0",
  source: "manual",
  tokens: {
    "color.bg": { $type: "color", $value: "#0b0e14" },
    "color.surface": { $type: "color", $value: "#141925" },
    "color.surface.raised": { $type: "color", $value: "#1b2231" },
    "color.border": { $type: "color", $value: "#273044" },
    "color.text": { $type: "color", $value: "#e6e9f0" },
    "color.text.muted": { $type: "color", $value: "#8b95ab" },
    "color.accent": { $type: "color", $value: "#5b8cff" },
    "color.positive": { $type: "color", $value: "#3fb950" },
    "color.warning": { $type: "color", $value: "#d29922" },
    "color.critical": { $type: "color", $value: "#f85149" },
    "space.1": { $type: "dimension", $value: "4px" },
    "space.2": { $type: "dimension", $value: "8px" },
    "space.3": { $type: "dimension", $value: "12px" },
    "space.4": { $type: "dimension", $value: "16px" },
    "space.6": { $type: "dimension", $value: "24px" },
    "radius.md": { $type: "dimension", $value: "8px" },
    "font.sans": {
      $type: "fontFamily",
      $value: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
    },
    "font.mono": { $type: "fontFamily", $value: "ui-monospace, 'SF Mono', Menlo, monospace" },
  },
  bindings: [
    { primitive: "Stack", component: "meridian/Stack", propMap: {} },
    { primitive: "Grid", component: "meridian/Grid", propMap: {} },
    { primitive: "Card", component: "meridian/Card", propMap: {} },
    { primitive: "Section", component: "meridian/Section", propMap: {} },
    { primitive: "Heading", component: "meridian/Heading", propMap: {} },
    { primitive: "Text", component: "meridian/Text", propMap: {} },
    { primitive: "Metric", component: "meridian/Metric", propMap: {} },
    { primitive: "Badge", component: "meridian/Badge", propMap: {} },
    { primitive: "Divider", component: "meridian/Divider", propMap: {} },
    { primitive: "ProgressBar", component: "meridian/ProgressBar", propMap: {} },
    { primitive: "Link", component: "meridian/Link", propMap: {} },
    { primitive: "Button", component: "meridian/Button", propMap: {} },
    { primitive: "List", component: "meridian/List", propMap: {} },
    { primitive: "Table", component: "meridian/Table", propMap: {} },
    { primitive: "TableColumn", component: "meridian/TableColumn", propMap: {} },
    { primitive: "EmptyState", component: "meridian/EmptyState", propMap: {} },
  ],
  rules: {
    // A generated spec may only reference these colour tokens. Anything off-palette is
    // rejected by the guardrails rather than quietly rendered.
    allowedColorTokens: [
      "color.text",
      "color.text.muted",
      "color.accent",
      "color.positive",
      "color.warning",
      "color.critical",
    ],
    maxNestingDepth: 6,
    forbidden: ["inline-style", "raw-html"],
    // Every permitted tone is contrast-checked against each of these (WCAG 1.4.3 / 1.4.11).
    surfaceTokens: ["color.bg", "color.surface", "color.surface.raised"],
  },
};
