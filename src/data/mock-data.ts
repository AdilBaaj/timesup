export type StepType =
  | "input"
  | "coherence_check"
  | "ai_processing"
  | "output";

export type StepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "needs_review";

export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  description: string;
  subtitle: string;
  duration: number; // simulated duration in ms
  prompt?: string; // Short AI prompt description for the node
}

export interface StepExecution {
  stepId: string;
  status: StepStatus;
  startedAt?: Date;
  completedAt?: Date;
  logs: string[];
}

export interface ExecutionHistory {
  id: string;
  workflowName: string;
  date: string;
  duration: string;
  status: "completed" | "failed";
  stepsCompleted: number;
  totalSteps: number;
}

export const workflowSteps: WorkflowStep[] = [
  // Input nodes
  {
    id: "step-1",
    name: "Slides Marketing",
    type: "input",
    subtitle: "Entrée • PowerPoint",
    description: "Présentation marketing en entrée",
    duration: 1000,
  },
  {
    id: "step-2",
    name: "Excel Trésorerie",
    type: "input",
    subtitle: "Entrée • Excel",
    description: "Données de trésorerie",
    duration: 1000,
  },
  {
    id: "step-3",
    name: "Modèle Reporting",
    type: "input",
    subtitle: "Entrée • PowerPoint",
    description: "Modèle PowerPoint de reporting",
    duration: 1000,
  },
  {
    id: "step-6",
    name: "Excel Reporting",
    type: "input",
    subtitle: "Entrée • Excel",
    description: "Modèle Excel de reporting",
    duration: 1000,
  },
  // Coherence checks
  {
    id: "step-4",
    name: "Contrôle de cohérence",
    type: "coherence_check",
    subtitle: "Processus IA • Cohérence",
    description: "Valider les données des slides marketing",
    duration: 3000,
    prompt: "Vérifier la structure des slides, détecter les sections manquantes et la cohérence des données",
  },
  {
    id: "step-5",
    name: "Contrôle de cohérence",
    type: "coherence_check",
    subtitle: "Processus IA • Cohérence",
    description: "Valider les données de trésorerie",
    duration: 3000,
    prompt: "Valider les calculs financiers, vérifier l'intégrité des soldes et détecter les anomalies",
  },
  {
    id: "step-6b",
    name: "Contrôle de cohérence",
    type: "coherence_check",
    subtitle: "Processus IA • Cohérence",
    description: "Valider le modèle Excel de reporting",
    duration: 3000,
    prompt: "Valider les champs du modèle, vérifier la cohérence du format et le mappage des placeholders",
  },
  // Processing
  {
    id: "step-7",
    name: "Remplir Excel Reporting",
    type: "ai_processing",
    subtitle: "Processus IA • Remplissage",
    description: "L'IA remplit le modèle de reporting avec les données validées",
    duration: 5000,
    prompt: "Mapper les données de trésorerie vers le modèle, remplir les métriques, mettre à jour les graphiques et recalculer les formules",
  },
  {
    id: "step-8",
    name: "Remplir Slides Reporting",
    type: "ai_processing",
    subtitle: "Processus IA • Présentation",
    description: "L'IA génère les slides de présentation",
    duration: 5000,
    prompt: "Générer le résumé exécutif, créer les visualisations de données et formater la présentation",
  },
  {
    id: "step-9",
    name: "Contrôle de cohérence",
    type: "coherence_check",
    subtitle: "Processus IA • Validation finale",
    description: "Validation finale de la présentation générée",
    duration: 3000,
    prompt: "Vérifier l'exactitude des données, la cohérence du formatage et valider toutes les exigences",
  },
  // Output
  {
    id: "step-10",
    name: "Export Présentation",
    type: "output",
    subtitle: "Sortie • PowerPoint",
    description: "Exporter la présentation finale",
    duration: 2000,
  },
];

export const stepIcons: Record<StepType, string> = {
  input: "📁",
  coherence_check: "✓",
  ai_processing: "⚡",
  output: "📤",
};

export const expectedFiles = [
  { name: "Marketing_Slides.pptx", type: "PowerPoint", required: true },
  { name: "Cashflow_Data.xlsx", type: "Excel", required: true },
  { name: "Reporting_Template.pptx", type: "PowerPoint", required: true },
  { name: "Reporting_Template.xlsx", type: "Excel", required: true },
];

export const mockFinancialData = {
  pnl: [
    { item: "Revenue", oct: 45.2, nov: 42.9, variance: -2.3, variancePct: -5.1 },
    { item: "  - Pasta", oct: 28.4, nov: 26.1, variance: -2.3, variancePct: -8.1 },
    { item: "  - Sauces", oct: 12.8, nov: 13.2, variance: 0.4, variancePct: 3.1 },
    { item: "  - Ready Meals", oct: 4.0, nov: 3.6, variance: -0.4, variancePct: -10.0 },
    { item: "COGS", oct: 27.1, nov: 27.7, variance: 0.6, variancePct: 2.2 },
    { item: "Gross Profit", oct: 18.1, nov: 15.2, variance: -2.9, variancePct: -16.0 },
    { item: "SG&A", oct: 8.5, nov: 8.2, variance: -0.3, variancePct: -3.5 },
    { item: "EBITDA", oct: 9.6, nov: 7.0, variance: -2.6, variancePct: -27.1 },
  ],
  kpis: [
    { name: "Pasta Volume", value: "12,400 tons", change: "-7.2%" },
    { name: "Sauce Volume", value: "3,200 kL", change: "+2.8%" },
    { name: "Avg Selling Price", value: "€3.24/kg", change: "+2.1%" },
    { name: "Gross Margin", value: "35.4%", change: "-4.6pp" },
    { name: "Customer Count", value: "2,847", change: "-1.2%" },
  ],
};

export const mockAIOutputs = {
  varianceAnalysis: {
    prompt: `Analyze the following P&L variances for November 2024 vs October 2024 and explain the top drivers:
- Revenue: €42.9M vs €45.2M (-5.1%)
- COGS: €27.7M vs €27.1M (+2.2%)
- Gross Margin: 35.4% vs 40.0% (-4.6pp)

Provide business context and actionable insights.`,
    reasoning: [
      "Identified 8 P&L line items with significant variances (>2%)",
      "Ranked variances by absolute € impact: Revenue (-€2.3M), COGS (+€0.6M), Gross Profit (-€2.9M)",
      "Analyzed Revenue decline: Pasta segment down €2.3M, partially offset by Sauce growth +€0.4M",
      "Investigated COGS increase: Wheat commodity prices up 8%, energy costs elevated",
      "Cross-referenced with KPI data: Volume decline (-7.2%) confirms demand weakness",
      "Synthesized narrative focusing on actionable drivers",
    ],
    output: `**November Revenue Analysis**

November revenue declined by €2.3M (-5.1%) driven primarily by:

1. **Pasta Volume Decline (-€2.3M):** Weak consumer demand in Northern Italy due to unseasonably warm weather reduced pasta consumption. Competitive pressure from private label products also contributed to market share loss.

2. **Ready Meals Decline (-€0.4M):** Seasonal shift away from ready meals as holiday home cooking increased.

3. **Sauce Growth (+€0.4M):** Successful promotional campaign for premium tomato sauce line drove volume and mix improvement, partially offsetting pasta weakness.

**COGS Impact:** COGS increased 2.2% despite lower volume due to:
- Wheat commodity price increases (+8% spot price)
- Elevated energy costs in production facilities
- Unfavorable product mix shift

**Recommendation:** Accelerate premium sauce expansion while implementing wheat hedging for Q1.`,
    confidence: 87,
    sources: ["Monthly_P&L.xlsx (cells B12:F45)", "KPI_Tracker.xlsx", "Historical commodity data"],
  },
  executiveSummary: {
    prompt: `Generate an executive summary for the November 2024 monthly FP&A report for Panzani.
Key data:
- Revenue: €42.9M (-5.1% MoM)
- Gross Margin: 35.4% (-4.6pp)
- EBITDA: €7.0M (-27.1%)
Target audience: Board of Directors`,
    reasoning: [
      "Reviewed all KPI metrics and variance analysis",
      "Identified key themes: market headwinds, margin pressure, portfolio resilience",
      "Structured summary: Performance overview → Key drivers → Actions → Outlook",
      "Adjusted tone for board-level audience",
      "Kept to 3 paragraphs for executive brevity",
    ],
    output: `**Executive Summary - November 2024**

November presented challenging market conditions with revenue declining 5.1% to €42.9M. The pasta segment faced headwinds from unseasonable weather patterns and intensifying private label competition, while our sauce portfolio demonstrated resilience through successful premium positioning strategies.

Gross margin compressed to 35.4% as commodity inflation outpaced pricing actions. The team has initiated wheat hedging positions for Q1 2025 and accelerated the SKU rationalization program to improve product mix. SG&A discipline continued with a 3.5% reduction through operational efficiencies.

**Outlook:** December is expected to benefit from holiday demand patterns, though we maintain a cautious view on pasta volumes given competitive dynamics. Focus areas for Q1 include premium sauce expansion, pricing realization, and continued cost productivity initiatives. Full-year guidance remains under review pending December close.`,
    confidence: 92,
    sources: ["Variance Analysis", "KPI Dashboard", "Strategic Plan FY24"],
  },
};

export const mockLogs: Record<string, string[]> = {
  "step-1": [
    "[10:23:45.123] Loading Marketing Slides...",
    "[10:23:45.456] Reading Marketing_Slides.pptx",
    "[10:23:46.234] ✓ Parsed 24 slides",
    "[10:23:46.567] ✓ Extracted text and images",
    "[10:23:46.890] Marketing slides loaded successfully",
  ],
  "step-2": [
    "[10:23:47.012] Loading Cashflow Excel...",
    "[10:23:47.234] Reading Cashflow_Data.xlsx",
    "[10:23:47.456] ✓ Parsed 156 rows, 8 columns",
    "[10:23:47.678] ✓ Validated financial formulas",
    "[10:23:47.890] Cashflow data loaded successfully",
  ],
  "step-3": [
    "[10:23:48.012] Loading Reporting Template...",
    "[10:23:48.234] Reading Reporting_Template.pptx",
    "[10:23:48.456] ✓ Identified 12 data sections",
    "[10:23:48.678] ✓ Mapped placeholder fields",
    "[10:23:48.890] Template loaded successfully",
  ],
  "step-4": [
    "[10:23:49.012] Coherence Check 1: Marketing Slides...",
    "[10:23:49.234] Validating slide structure...",
    "[10:23:50.456] ✓ All required sections present",
    "[10:23:51.678] ✓ Data consistency verified",
    "[10:23:51.890] Coherence check 1 passed",
  ],
  "step-5": [
    "[10:23:52.012] Coherence Check 2: Cashflow Data...",
    "[10:23:52.234] Validating cashflow calculations...",
    "[10:23:53.456] ✓ Balance checks passed",
    "[10:23:54.678] ✓ No data anomalies detected",
    "[10:23:54.890] Coherence check 2 passed",
  ],
  "step-6": [
    "[10:23:48.112] Loading Reporting Excel...",
    "[10:23:48.334] Reading Reporting_Template.xlsx",
    "[10:23:48.556] ✓ Parsed 45 rows, 12 columns",
    "[10:23:48.778] ✓ Mapped data fields",
    "[10:23:48.990] Reporting Excel loaded successfully",
  ],
  "step-6b": [
    "[10:23:55.012] Coherence Check 3: Reporting Excel...",
    "[10:23:55.234] Validating template fields...",
    "[10:23:56.456] ✓ All placeholders validated",
    "[10:23:57.678] ✓ Format consistency confirmed",
    "[10:23:57.890] Coherence check 3 passed",
  ],
  "step-7": [
    "[10:23:58.012] Filling Reporting Excel...",
    "[10:23:58.234] Mapping cashflow data to template...",
    "[10:23:59.456] ✓ Financial metrics populated",
    "[10:24:00.678] ✓ Charts and graphs updated",
    "[10:24:01.890] ✓ Formulas recalculated",
    "[10:24:02.012] Reporting Excel filled successfully",
  ],
  "step-8": [
    "[10:24:02.234] Filling Reporting Slides...",
    "[10:24:02.456] Combining marketing slides with data...",
    "[10:24:03.678] ✓ Data visualizations created",
    "[10:24:04.890] ✓ Executive summary generated",
    "[10:24:06.012] ✓ Slides formatted and styled",
    "[10:24:07.234] Presentation slides completed",
  ],
  "step-9": [
    "[10:24:07.456] Final Coherence Check...",
    "[10:24:07.678] Validating complete presentation...",
    "[10:24:08.890] ✓ Data accuracy verified",
    "[10:24:10.012] ✓ Formatting consistency confirmed",
    "[10:24:10.234] ✓ All requirements met",
    "[10:24:10.456] Final coherence check passed",
  ],
  "step-10": [
    "[10:24:10.678] Exporting Final Presentation...",
    "[10:24:10.890] Compiling presentation file...",
    "[10:24:11.234] ✓ Generated: Panzani_FPA_Report.pptx",
    "[10:24:11.456] ✓ File size: 3.2 MB",
    "[10:24:11.678] Export completed successfully",
  ],
};

export const mockHistory: ExecutionHistory[] = [
  {
    id: "EX-042",
    workflowName: "Rapport FP&A Mensuel - Novembre 2024",
    date: "2024-11-28",
    duration: "4m 23s",
    status: "completed",
    stepsCompleted: 10,
    totalSteps: 10,
  },
  {
    id: "EX-041",
    workflowName: "Rapport FP&A Mensuel - Octobre 2024",
    date: "2024-10-30",
    duration: "5m 12s",
    status: "completed",
    stepsCompleted: 10,
    totalSteps: 10,
  },
  {
    id: "EX-040",
    workflowName: "Rapport FP&A Mensuel - Octobre 2024",
    date: "2024-10-29",
    duration: "2m 45s",
    status: "failed",
    stepsCompleted: 4,
    totalSteps: 10,
  },
  {
    id: "EX-039",
    workflowName: "Rapport FP&A Mensuel - Septembre 2024",
    date: "2024-09-28",
    duration: "4m 08s",
    status: "completed",
    stepsCompleted: 10,
    totalSteps: 10,
  },
  {
    id: "EX-038",
    workflowName: "Rapport FP&A Mensuel - Août 2024",
    date: "2024-08-29",
    duration: "4m 55s",
    status: "completed",
    stepsCompleted: 10,
    totalSteps: 10,
  },
  {
    id: "EX-037",
    workflowName: "Rapport FP&A Mensuel - Juillet 2024",
    date: "2024-07-30",
    duration: "4m 32s",
    status: "completed",
    stepsCompleted: 10,
    totalSteps: 10,
  },
];

export const mockSlides = [
  {
    id: "slide-1",
    title: "Title Slide",
    description: "Panzani Monthly FP&A Report - November 2024",
  },
  {
    id: "slide-2",
    title: "Executive Summary",
    description: "Key highlights and outlook",
  },
  {
    id: "slide-3",
    title: "P&L Summary",
    description: "Revenue, COGS, and profitability metrics",
  },
  {
    id: "slide-4",
    title: "KPI Dashboard",
    description: "Volume, pricing, and operational metrics",
  },
  {
    id: "slide-5",
    title: "Variance Commentary",
    description: "AI-generated analysis of key variances",
  },
];
