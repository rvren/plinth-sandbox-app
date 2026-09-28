import { CapabilityContract } from "@plinth/contract";

/**
 * Synthetic platform state. Every value here is invented — see src/platform/README.md.
 *
 * Shaped as one flat-ish object because that is what a real host application hands an
 * adaptive region: a view-model, not a database. Specs bind to paths within it.
 */
export const meridianData = {
  org: { name: "Northwind Labs", plan: "Enterprise", seats: 240 },
  spend: {
    monthToDate: 148_320,
    forecast: 203_900,
    budget: 180_000,
    lastMonth: 171_450,
    topDriver: "gpu-training-pool",
    byTeam: [
      { team: "research", amount: 71_200, change: 0.18 },
      { team: "platform", amount: 38_900, change: -0.04 },
      { team: "data-eng", amount: 24_750, change: 0.07 },
      { team: "inference", amount: 13_470, change: 0.31 },
    ],
  },
  compute: {
    clusters: 14,
    nodesTotal: 412,
    nodesUnhealthy: 3,
    gpuHoursMonth: 28_940,
    gpuUtilization: 0.61,
    idleGpuHours: 4_180,
    queueDepth: 27,
    oldestQueuedSeconds: 5_400,
  },
  reliability: {
    incidentsOpen: 2,
    incidentsWeek: 6,
    slo: 0.9987,
    sloTarget: 0.999,
    errorBudgetRemaining: 0.34,
    lastIncidentAt: "2026-06-14T03:12:00.000Z",
    alerts: [
      { severity: "critical", title: "etcd latency above threshold", cluster: "prod-eu-1" },
      { severity: "warning", title: "Node pool scaling throttled", cluster: "prod-us-2" },
    ],
  },
  training: {
    runsActive: 9,
    runsFailed24h: 4,
    avgQueueWaitSeconds: 2_280,
    checkpointStorageBytes: 8_246_337_208_320,
    topRun: { name: "llm-sft-7b-v4", gpuHours: 1_840, status: "running" },
  },
  /**
   * Deliberately empty. The Reports panel renders this with no next action, which is the
   * dead-end the audit is meant to find. Do not populate it.
   */
  reports: { saved: [] as { name: string; updatedAt: string }[] },
} as const;

export type MeridianData = typeof meridianData;

/**
 * What Meridian exposes.
 *
 * Note `personaHints` and the two capabilities marked as buried: `budget.forecast` and
 * `cluster.rightsize` are real, useful, and surfaced nowhere in the UI. That gap is the
 * feature-discovery problem, present in the fixture rather than described in a comment.
 */
export const meridianCapabilities = CapabilityContract.parse({
  source: "manual",
  version: "2.4.0",
  capabilities: [
    {
      id: "spend.summary",
      kind: "query",
      title: "Spend summary",
      provides: ["spend.monthToDate", "spend.budget", "spend.lastMonth", "spend.byTeam"],
      personaHints: ["finops"],
    },
    {
      id: "budget.forecast",
      kind: "query",
      title: "Budget forecast",
      description: "Projects month-end spend. Shipped in 2.1 and surfaced nowhere in the UI.",
      provides: ["spend.forecast", "spend.topDriver"],
      personaHints: ["finops"],
    },
    {
      id: "cluster.health",
      kind: "query",
      title: "Cluster health",
      provides: ["compute.clusters", "compute.nodesTotal", "compute.nodesUnhealthy"],
      personaHints: ["platform", "sre"],
    },
    {
      id: "cluster.rightsize",
      kind: "action",
      title: "Right-size node pools",
      description: "Reclaims idle GPU capacity. Buried three levels deep in settings.",
      provides: ["compute.idleGpuHours"],
      params: ["clusterId", "dryRun"],
      personaHints: ["platform", "finops"],
    },
    {
      id: "slo.status",
      kind: "query",
      title: "SLO and error budget",
      provides: ["reliability.slo", "reliability.sloTarget", "reliability.errorBudgetRemaining"],
      personaHints: ["sre"],
    },
    {
      id: "alerts.list",
      kind: "query",
      title: "Active alerts",
      provides: ["reliability.alerts", "reliability.incidentsOpen"],
      personaHints: ["sre", "platform"],
    },
    {
      id: "training.runs",
      kind: "query",
      title: "Training runs",
      provides: ["training.runsActive", "training.runsFailed24h", "training.avgQueueWaitSeconds", "training.topRun"],
      personaHints: ["ml"],
    },
    {
      id: "gpu.utilization",
      kind: "query",
      title: "GPU utilization",
      provides: ["compute.gpuHoursMonth", "compute.gpuUtilization", "compute.idleGpuHours"],
      personaHints: ["ml", "platform", "finops"],
    },
    {
      id: "queue.status",
      kind: "query",
      title: "Scheduler queue",
      provides: ["compute.queueDepth", "compute.oldestQueuedSeconds"],
      personaHints: ["ml"],
    },
    {
      id: "reports.saved",
      kind: "query",
      title: "Saved reports",
      provides: ["reports.saved"],
      personaHints: ["finops"],
    },
    {
      id: "reports.export",
      kind: "action",
      title: "Export report",
      description: "Requires a saved report. The button is disabled with no explanation given.",
      params: ["reportId", "format"],
      personaHints: ["finops"],
    },
  ],
});

/** The three personas that all currently share one dense interface. */
export const PERSONAS = [
  { id: "platform", label: "Platform Engineer", cares: ["cluster.health", "alerts.list", "gpu.utilization"] },
  { id: "ml", label: "ML Engineer", cares: ["training.runs", "queue.status", "gpu.utilization"] },
  { id: "finops", label: "FinOps Analyst", cares: ["spend.summary", "budget.forecast", "reports.saved"] },
] as const;

export type PersonaId = (typeof PERSONAS)[number]["id"];
