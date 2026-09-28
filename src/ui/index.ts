/**
 * Meridian's component library — written the way a customer's components are written:
 * each with its own typed props, no knowledge of plinth. The scan reads these.
 *
 * src/plinth/registry.tsx is the thin adapter that lets the plinth renderer draw specs
 * with them; that folder is what the setup pull request adds to a customer's repository.
 */
export * from "./Stack";
export * from "./Grid";
export * from "./Card";
export * from "./Section";
export * from "./Heading";
export * from "./Text";
export * from "./Metric";
export * from "./Badge";
export * from "./Divider";
export * from "./ProgressBar";
export * from "./Link";
export * from "./Button";
export * from "./List";
export * from "./DataTable";
export * from "./EmptyState";
export type { Tone } from "./tone";
