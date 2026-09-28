import { ComponentSpec, lit, ref, type ComponentSpec as Spec } from "@plinth/contract";

/**
 * Meridian's component catalog.
 *
 * Hand-authored by the "vendor". These are the primitives the local model composes from
 * and ranks (Tier 1), and what a generated spec is measured against: if a generated
 * component does not look like it belongs beside these, fidelity has failed.
 *
 * Parsed at module load on purpose. A malformed catalog should fail at startup, not at
 * render time in front of a user.
 */

const spec = (input: unknown): Spec => ComponentSpec.parse(input);

export const spendSummary = spec({
  specVersion: 1,
  id: "spend-summary",
  title: "Spend summary",
  description: "Month-to-date spend against budget.",
  level: "L1",
  origin: "catalog",
  dataContract: { reads: ["spend.monthToDate", "spend.budget", "spend.lastMonth"] },
  root: {
    primitive: "Card",
    key: "spend-summary",
    props: { title: lit("Spend") },
    children: [
      {
        primitive: "Grid",
        props: { columns: lit(2), gap: lit("3") },
        children: [
          {
            primitive: "Metric",
            key: "spend-mtd",
            props: {
              label: lit("Month to date"),
              value: { kind: "fmt", fn: "currency", args: [ref("spend.monthToDate"), lit("USD")] },
            },
          },
          {
            primitive: "Metric",
            key: "spend-budget",
            props: {
              label: lit("Budget"),
              value: { kind: "fmt", fn: "currency", args: [ref("spend.budget"), lit("USD")] },
            },
          },
        ],
      },
      {
        primitive: "ProgressBar",
        props: {
          label: lit("Budget consumed"),
          value: ref("spend.monthToDate"),
          max: ref("spend.budget"),
          // Turns critical once spend passes budget — a conditional, evaluated locally.
          tone: {
            kind: "cond",
            test: { kind: "cmp", op: "gt", left: ref("spend.monthToDate"), right: ref("spend.budget") },
            then: lit("critical"),
            otherwise: lit("positive"),
          },
        },
      },
    ],
  },
});

/**
 * The spec for a capability nobody discovers.
 *
 * `budget.forecast` has shipped since 2.1 and appears in no screen. This spec exists in
 * the catalog precisely so the Foundry demo can show it being surfaced to the persona
 * who needed it all along.
 */
export const budgetForecast = spec({
  specVersion: 1,
  id: "budget-forecast",
  title: "Budget forecast",
  description: "Projected month-end spend. Currently surfaced nowhere in the product.",
  level: "L2",
  origin: "catalog",
  dataContract: { reads: ["spend.forecast", "spend.budget", "spend.topDriver"] },
  root: {
    primitive: "Card",
    key: "budget-forecast",
    props: { title: lit("Forecast to month end") },
    children: [
      {
        primitive: "Metric",
        key: "forecast-value",
        props: {
          label: lit("Projected"),
          value: { kind: "fmt", fn: "currency", args: [ref("spend.forecast"), lit("USD")] },
          delta: {
            kind: "cond",
            test: { kind: "cmp", op: "gt", left: ref("spend.forecast"), right: ref("spend.budget") },
            then: lit("Over budget"),
            otherwise: lit("Within budget"),
          },
          tone: {
            kind: "cond",
            test: { kind: "cmp", op: "gt", left: ref("spend.forecast"), right: ref("spend.budget") },
            then: lit("critical"),
            otherwise: lit("positive"),
          },
        },
      },
      {
        primitive: "Text",
        props: {
          size: lit("sm"),
          tone: lit("muted"),
          text: { kind: "fmt", fn: "coalesce", args: [ref("spend.topDriver"), lit("no dominant driver")] },
        },
      },
    ],
  },
});

export const clusterHealth = spec({
  specVersion: 1,
  id: "cluster-health",
  title: "Cluster health",
  level: "L1",
  origin: "catalog",
  dataContract: { reads: ["compute.clusters", "compute.nodesTotal", "compute.nodesUnhealthy"] },
  root: {
    primitive: "Card",
    key: "cluster-health",
    props: { title: lit("Clusters") },
    children: [
      {
        primitive: "Grid",
        props: { columns: lit(3), gap: lit("3") },
        children: [
          { primitive: "Metric", key: "clusters", props: { label: lit("Clusters"), value: ref("compute.clusters") } },
          { primitive: "Metric", key: "nodes", props: { label: lit("Nodes"), value: ref("compute.nodesTotal") } },
          {
            primitive: "Metric",
            key: "nodes-unhealthy",
            props: {
              label: lit("Unhealthy"),
              value: ref("compute.nodesUnhealthy"),
              tone: {
                kind: "cond",
                test: { kind: "cmp", op: "gt", left: ref("compute.nodesUnhealthy"), right: lit(0) },
                then: lit("warning"),
                otherwise: lit("positive"),
              },
            },
          },
        ],
      },
    ],
  },
});

export const gpuUtilization = spec({
  specVersion: 1,
  id: "gpu-utilization",
  title: "GPU utilization",
  level: "L1",
  origin: "catalog",
  dataContract: { reads: ["compute.gpuUtilization", "compute.gpuHoursMonth", "compute.idleGpuHours"] },
  root: {
    primitive: "Card",
    key: "gpu-utilization",
    props: { title: lit("GPU utilization") },
    children: [
      {
        primitive: "Metric",
        key: "gpu-util",
        props: {
          label: lit("Utilization"),
          value: { kind: "fmt", fn: "percent", args: [ref("compute.gpuUtilization")] },
          tone: {
            kind: "cond",
            test: { kind: "cmp", op: "lt", left: ref("compute.gpuUtilization"), right: lit(0.7) },
            then: lit("warning"),
            otherwise: lit("positive"),
          },
        },
      },
      {
        primitive: "Text",
        props: {
          size: lit("sm"),
          tone: lit("muted"),
          text: { kind: "fmt", fn: "join", args: [ref("compute.idleGpuHours"), lit(" ")] },
        },
      },
      {
        primitive: "Metric",
        key: "gpu-idle",
        props: { label: lit("Idle GPU hours"), value: { kind: "fmt", fn: "number", args: [ref("compute.idleGpuHours")] } },
      },
    ],
  },
});

export const sloStatus = spec({
  specVersion: 1,
  id: "slo-status",
  title: "SLO and error budget",
  level: "L1",
  origin: "catalog",
  dataContract: { reads: ["reliability.slo", "reliability.errorBudgetRemaining", "reliability.lastIncidentAt"] },
  root: {
    primitive: "Card",
    key: "slo-status",
    props: { title: lit("Reliability") },
    children: [
      {
        primitive: "Metric",
        key: "slo",
        props: { label: lit("SLO"), value: { kind: "fmt", fn: "percent", args: [ref("reliability.slo")] } },
      },
      {
        primitive: "ProgressBar",
        props: {
          label: lit("Error budget remaining"),
          value: ref("reliability.errorBudgetRemaining"),
          max: lit(1),
          tone: {
            kind: "cond",
            test: { kind: "cmp", op: "lt", left: ref("reliability.errorBudgetRemaining"), right: lit(0.25) },
            then: lit("critical"),
            otherwise: lit("positive"),
          },
        },
      },
      {
        primitive: "Text",
        props: {
          size: lit("sm"),
          tone: lit("muted"),
          text: { kind: "fmt", fn: "relativeTime", args: [ref("reliability.lastIncidentAt")] },
        },
      },
    ],
  },
});

export const trainingRuns = spec({
  specVersion: 1,
  id: "training-runs",
  title: "Training runs",
  level: "L1",
  origin: "catalog",
  dataContract: { reads: ["training.runsActive", "training.runsFailed24h", "training.avgQueueWaitSeconds"] },
  root: {
    primitive: "Card",
    key: "training-runs",
    props: { title: lit("Training") },
    children: [
      {
        primitive: "Grid",
        props: { columns: lit(3), gap: lit("3") },
        children: [
          { primitive: "Metric", key: "runs-active", props: { label: lit("Active"), value: ref("training.runsActive") } },
          {
            primitive: "Metric",
            key: "runs-failed",
            props: {
              label: lit("Failed 24h"),
              value: ref("training.runsFailed24h"),
              tone: {
                kind: "cond",
                test: { kind: "cmp", op: "gt", left: ref("training.runsFailed24h"), right: lit(0) },
                then: lit("critical"),
                otherwise: lit("positive"),
              },
            },
          },
          {
            primitive: "Metric",
            key: "queue-wait",
            props: {
              label: lit("Avg queue wait"),
              value: { kind: "fmt", fn: "duration", args: [ref("training.avgQueueWaitSeconds")] },
            },
          },
        ],
      },
    ],
  },
});

export const queueStatus = spec({
  specVersion: 1,
  id: "queue-status",
  title: "Scheduler queue",
  level: "L1",
  origin: "catalog",
  dataContract: { reads: ["compute.queueDepth", "compute.oldestQueuedSeconds"] },
  root: {
    primitive: "Card",
    key: "queue-status",
    props: { title: lit("Queue") },
    children: [
      { primitive: "Metric", key: "queue-depth", props: { label: lit("Depth"), value: ref("compute.queueDepth") } },
      {
        primitive: "Metric",
        key: "queue-oldest",
        props: {
          label: lit("Oldest waiting"),
          value: { kind: "fmt", fn: "duration", args: [ref("compute.oldestQueuedSeconds")] },
        },
      },
    ],
  },
});

export const spendByTeam = spec({
  specVersion: 1,
  id: "spend-by-team",
  title: "Spend by team",
  level: "L1",
  origin: "catalog",
  dataContract: { reads: ["spend.byTeam"] },
  root: {
    primitive: "Card",
    key: "spend-by-team",
    props: { title: lit("Spend by team") },
    children: [
      {
        primitive: "Table",
        props: { rows: ref("spend.byTeam"), emptyText: lit("No team spend recorded.") },
        children: [
          { primitive: "TableColumn", props: { header: lit("Team"), value: ref("team") } },
          {
            primitive: "TableColumn",
            props: {
              header: lit("Amount"),
              value: { kind: "fmt", fn: "currency", args: [ref("amount"), lit("USD")] },
              align: lit("right"),
            },
          },
          {
            primitive: "TableColumn",
            props: {
              header: lit("Change"),
              value: { kind: "fmt", fn: "percent", args: [ref("change")] },
              align: lit("right"),
            },
          },
        ],
      },
    ],
  },
});

/**
 * The dead end.
 *
 * Renders an empty table with no action available. Deliberately offers no way forward —
 * this is the friction the persona audit is supposed to detect, so it must stay broken.
 */
export const savedReports = spec({
  specVersion: 1,
  id: "saved-reports",
  title: "Saved reports",
  level: "L0",
  origin: "catalog",
  dataContract: { reads: ["reports.saved"] },
  root: {
    primitive: "Card",
    key: "saved-reports",
    props: { title: lit("Reports") },
    children: [
      {
        primitive: "Table",
        props: { rows: ref("reports.saved"), emptyText: lit("No saved reports.") },
        children: [{ primitive: "TableColumn", props: { header: lit("Name"), value: ref("name") } }],
      },
      // Disabled with no reason given. This is what produces the rage-clicks.
      { primitive: "Button", key: "export-report", props: { text: lit("Export"), disabled: lit(true) } },
    ],
  },
});

export const alertsList = spec({
  specVersion: 1,
  id: "alerts-list",
  title: "Active alerts",
  level: "L1",
  origin: "catalog",
  dataContract: { reads: ["reliability.alerts", "reliability.incidentsOpen"] },
  root: {
    primitive: "Card",
    key: "alerts-list",
    props: { title: lit("Alerts") },
    children: [
      {
        primitive: "Metric",
        key: "incidents-open",
        props: {
          label: lit("Open incidents"),
          value: ref("reliability.incidentsOpen"),
          tone: {
            kind: "cond",
            test: { kind: "cmp", op: "gt", left: ref("reliability.incidentsOpen"), right: lit(0) },
            then: lit("critical"),
            otherwise: lit("positive"),
          },
        },
      },
      {
        primitive: "List",
        props: {
          items: ref("reliability.alerts"),
          itemText: lit("title"),
          emptyText: lit("No active alerts."),
        },
      },
    ],
  },
});

/**
 * Everything the vendor has authored, including specs no screen shows.
 *
 * The distinction from `defaultDashboard` below is the whole feature-discovery problem in
 * two constants: shipping a component is not the same as anyone finding it.
 */
export const meridianCatalog: Spec[] = [
  spendSummary,
  spendByTeam,
  clusterHealth,
  gpuUtilization,
  sloStatus,
  alertsList,
  trainingRuns,
  queueStatus,
  savedReports,
  budgetForecast,
];

/**
 * What actually renders, in this order, for every persona.
 *
 * `budget-forecast` is deliberately absent: it was built, it works, and no user has ever
 * seen it. That is the gap the persona audit reports and the promotion ladder closes.
 */
export const defaultDashboard: Spec[] = [
  alertsList,
  gpuUtilization,
  queueStatus,
  clusterHealth,
  spendSummary,
  spendByTeam,
  sloStatus,
  trainingRuns,
  savedReports,
];

/** Which capability each spec surfaces — used later to detect undiscovered capabilities. */
export const specCapabilities: Record<string, string> = {
  "spend-summary": "spend.summary",
  "spend-by-team": "spend.summary",
  "cluster-health": "cluster.health",
  "gpu-utilization": "gpu.utilization",
  "slo-status": "slo.status",
  "alerts-list": "alerts.list",
  "training-runs": "training.runs",
  "queue-status": "queue.status",
  "saved-reports": "reports.saved",
  "budget-forecast": "budget.forecast",
};
