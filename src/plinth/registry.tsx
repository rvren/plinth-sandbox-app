import type { ReactNode } from "react";
import type { PlanValue } from "@plinth/renderer";
import { planRows, planText, type PrimitiveProps, type PrimitiveRegistry } from "@plinth/renderer/react";
import * as UI from "../ui";

/**
 * The plinth registry: spec primitives → Meridian's own components.
 *
 * This folder (src/plinth) is what the setup pull request adds to a customer's repository.
 * Everything visible is still Meridian's: the renderer never produces markup, it hands each
 * component already-resolved, inert values. None of these interpolate a plan value into
 * markup, set innerHTML, or build a handler from plan data.
 */

const TONES = new Set<UI.Tone>(["default", "muted", "accent", "positive", "warning", "critical"]);
const tone = (value: PlanValue | undefined): UI.Tone | undefined => {
  const text = planText(value);
  return TONES.has(text as UI.Tone) ? (text as UI.Tone) : undefined;
};
const space = (value: PlanValue | undefined, fallback: 1 | 2 | 3 | 4 | 6): 1 | 2 | 3 | 4 | 6 => {
  const n = Number(planText(value));
  return n === 1 || n === 2 || n === 3 || n === 4 || n === 6 ? n : fallback;
};
const optional = <K extends string>(key: K, value: string): { [P in K]?: string } =>
  (value ? { [key]: value } : {}) as { [P in K]?: string };

const Stack = ({ props, children }: PrimitiveProps): ReactNode => {
  const align = planText(props.align);
  return (
    <UI.Stack
      direction={planText(props.direction) === "row" ? "row" : "column"}
      gap={space(props.gap, 3)}
      wrap={props.wrap === true}
      {...(align === "start" || align === "center" || align === "end" || align === "stretch" || align === "baseline"
        ? { align }
        : {})}
    >
      {children}
    </UI.Stack>
  );
};

const Grid = ({ props, children }: PrimitiveProps): ReactNode => (
  <UI.Grid columns={Number(planText(props.columns)) || 2} gap={space(props.gap, 4)}>
    {children}
  </UI.Grid>
);

const Card = ({ props, children }: PrimitiveProps): ReactNode => {
  const t = tone(props.tone);
  return (
    <UI.Card {...optional("title", planText(props.title))} {...optional("subtitle", planText(props.subtitle))} {...(t ? { tone: t } : {})}>
      {children}
    </UI.Card>
  );
};

const Section = ({ props, children }: PrimitiveProps): ReactNode => (
  <UI.Section title={planText(props.title)} {...optional("description", planText(props.description))} collapsed={props.collapsed === true}>
    {children}
  </UI.Section>
);

const Heading = ({ props }: PrimitiveProps): ReactNode => {
  const level = Math.max(1, Math.min(Number(planText(props.level)) || 3, 4)) as 1 | 2 | 3 | 4;
  return <UI.Heading level={level} text={planText(props.text)} />;
};

const Text = ({ props }: PrimitiveProps): ReactNode => {
  const t = tone(props.tone);
  return (
    <UI.Text
      text={planText(props.text)}
      size={planText(props.size) === "sm" ? "sm" : "md"}
      emphasis={props.emphasis === true}
      {...(t ? { tone: t } : {})}
    />
  );
};

const Metric = ({ props }: PrimitiveProps): ReactNode => {
  const t = tone(props.tone);
  return (
    <UI.Metric
      label={planText(props.label)}
      value={planText(props.value)}
      {...optional("unit", planText(props.unit))}
      {...optional("delta", planText(props.delta))}
      {...(t ? { tone: t } : {})}
    />
  );
};

const Badge = ({ props }: PrimitiveProps): ReactNode => {
  const t = tone(props.tone);
  return <UI.Badge text={planText(props.text)} {...(t ? { tone: t } : {})} />;
};

const Divider = (): ReactNode => <UI.Divider />;

const ProgressBar = ({ props }: PrimitiveProps): ReactNode => {
  const t = tone(props.tone);
  return (
    <UI.ProgressBar
      value={Number(planText(props.value)) || 0}
      max={Number(planText(props.max)) || 100}
      {...optional("label", planText(props.label))}
      {...(t ? { tone: t } : {})}
    />
  );
};

/** A null href means the renderer neutralized an unsafe URL; the label renders inert. */
const Link = ({ props }: PrimitiveProps): ReactNode => (
  <UI.Link href={props.href === null ? null : planText(props.href) || null} text={planText(props.text)} />
);

const Button = ({ props, onAction }: PrimitiveProps): ReactNode => (
  <UI.Button text={planText(props.text)} disabled={props.disabled === true} {...(onAction ? { onClick: onAction } : {})} />
);

const List = ({ props }: PrimitiveProps): ReactNode => {
  const field = planText(props.itemText) || "label";
  const items = planRows(props.items).map((item) =>
    planText(typeof item === "object" && item !== null && !Array.isArray(item) ? (item as Record<string, PlanValue>)[field] : item),
  );
  return <UI.List items={items} {...optional("emptyText", planText(props.emptyText))} />;
};

/**
 * Table renders a header row from its TableColumn children and a body row per element,
 * using cells the renderer already resolved — it does no field lookup of its own.
 */
const Table = ({ props, children, iterations }: PrimitiveProps): ReactNode => (
  <UI.DataTable header={children} rows={iterations ?? []} {...optional("emptyText", planText(props.emptyText))} />
);

/**
 * A column is a header cell in the template pass and a body cell inside a repeat; the
 * plan builder rewrites keys inside a repeat, which is how one component serves both.
 */
const TableColumn = ({ props, nodeKey }: PrimitiveProps): ReactNode => {
  const align = planText(props.align) === "right" ? "right" : "left";
  const body = nodeKey.includes(".row");
  return <UI.ColumnCell text={planText(body ? props.value : props.header)} align={align} header={!body} />;
};

const EmptyState = ({ props, onAction }: PrimitiveProps): ReactNode => (
  <UI.EmptyState
    title={planText(props.title)}
    {...optional("body", planText(props.body))}
    {...optional("actionText", planText(props.actionText))}
    {...(onAction ? { onAction } : {})}
  />
);

/** Every primitive the renderer can emit maps to a real Meridian component. */
export const meridianComponents: PrimitiveRegistry = {
  Stack,
  Grid,
  Card,
  Section,
  Heading,
  Text,
  Metric,
  Badge,
  Divider,
  ProgressBar,
  Link,
  Button,
  List,
  Table,
  TableColumn,
  EmptyState,
};
