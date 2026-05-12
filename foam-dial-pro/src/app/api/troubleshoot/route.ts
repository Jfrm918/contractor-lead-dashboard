import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

interface Diagnostic {
  id: string;
  problem: string;
  category: string;
  severity: string;
  causes: string[] | unknown;
  fixes: string[] | unknown;
}

function toArray(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === "string") return [val];
  return [];
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

// Key synonym groups — expands user's words to domain terms
const SYNONYMS: Record<string, string[]> = {
  stringy: ["string", "cobweb", "fibers", "hair", "tendrils"],
  spit: ["spitting", "spit", "spatter", "chunks", "drips", "dripping"],
  off: ["ratio", "mix", "imbalance", "off-ratio", "sticky", "soft"],
  sticky: ["tacky", "soft", "uncured", "wet", "gummy"],
  bubbles: ["bubble", "void", "pinholes", "foam", "blister", "blistering"],
  cellphone: ["cell", "open cell", "coarse", "rough"],
  shrink: ["shrinkage", "pull", "pull-away", "pulling", "contraction"],
  peel: ["delaminate", "delamination", "adhesion", "stick", "not sticking", "falling off"],
  hot: ["heat", "temperature", "temp", "overheating", "scorch"],
  cold: ["cool", "chilly", "low temp", "freeze"],
  pressure: ["psi", "pressure", "flow", "ratio"],
  slow: ["clog", "blockage", "restricted", "low flow"],
  yellow: ["yellowing", "discolor", "UV", "color", "off-color"],
  smoke: ["smokes", "burning", "char", "scorching"],
  smell: ["odor", "fumes", "chemical", "stink"],
};

// EasySeal-specific diagnostics from knowledge base
const EASYSEAL_EXTRA_DIAGNOSTICS: Diagnostic[] = [
  {
    id: "kb-es-1",
    problem: "Foam feels too hot / scorching in tight spaces",
    category: "application",
    severity: "medium",
    causes: [
      "High ambient temp combined with thick lift",
      "Poor ventilation in enclosed spaces",
    ],
    fixes: [
      "Reduce lift thickness, spray in thinner passes",
      "Improve air circulation before spraying",
      "Spray in the cooler part of the day",
    ],
  },
  {
    id: "kb-es-2",
    problem: "Foam not sticking to cold metal",
    category: "adhesion",
    severity: "high",
    causes: [
      "Metal surface below 50°F",
      "Condensation or moisture on substrate",
    ],
    fixes: [
      "Warm substrate with propane heater before spraying",
      "Verify no surface moisture with hand test or meter",
      "Spray a test pass first and check adhesion",
    ],
  },
  {
    id: "kb-es-3",
    problem: "Foam rising too fast / out of control",
    category: "application",
    severity: "high",
    causes: [
      "Over-temperature (hose too hot)",
      "High ambient heat in building",
    ],
    fixes: [
      "Drop hose temp 5-10°F and test",
      "Spray in cooler conditions or earlier in the day",
      "Check drum temps are not running too hot",
    ],
  },
  {
    id: "kb-es-4",
    problem: "Foam looks good but yield is low",
    category: "yield",
    severity: "medium",
    causes: [
      "Spray technique: too far from substrate or excessive drift",
      "Gun tip worn or partially clogged",
    ],
    fixes: [
      "Maintain 12-18\" spray distance from substrate",
      "Replace gun tip if worn",
      "Check for air leaks in the system",
    ],
  },
];

// AF1-specific diagnostics from knowledge base
const AF1_EXTRA_DIAGNOSTICS: Diagnostic[] = [
  {
    id: "kb-af1-1",
    problem: "AF1 foam rising too fast in warm conditions",
    category: "application",
    severity: "medium",
    causes: [
      "Drum temps too high",
      "Ambient >100°F",
    ],
    fixes: [
      "Lower drum temps to 70-80°F",
      "Spray earlier in day",
    ],
  },
  {
    id: "kb-af1-2",
    problem: "AF1 poor adhesion on cold substrates",
    category: "adhesion",
    severity: "high",
    causes: [
      "Substrate <40°F",
      "Moisture on surface",
    ],
    fixes: [
      "Pre-heat substrate",
      "Check moisture meter",
      "Wait for dew point clearance",
    ],
  },
  {
    id: "kb-af1-3",
    problem: "AF1 cells not opening properly",
    category: "application",
    severity: "high",
    causes: [
      "Hose temps too low (<120°F)",
      "Pressure imbalance",
    ],
    fixes: [
      "Raise hose temps to 130-140°F",
      "Balance A/B within 100 PSI",
    ],
  },
  {
    id: "kb-af1-4",
    problem: "AF1 yield lower than expected",
    category: "yield",
    severity: "medium",
    causes: [
      "Off-ratio",
      "Drum temps uneven",
      "Hose too short",
    ],
    fixes: [
      "Check ratio at gun",
      "Verify both drums 70-90°F",
      "Extend hose heat time",
    ],
  },
];

function expandTokens(tokens: string[]): string[] {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    for (const [key, synonyms] of Object.entries(SYNONYMS)) {
      if (key.includes(token) || synonyms.some((s) => s.includes(token) || token.includes(s))) {
        expanded.add(key);
        synonyms.forEach((s) => expanded.add(s));
      }
    }
  }
  return Array.from(expanded);
}

function scoreMatch(queryTokens: string[], diagnostic: Diagnostic): number {
  const diagText = [
    diagnostic.problem,
    diagnostic.category,
    ...toArray(diagnostic.causes),
    ...toArray(diagnostic.fixes),
  ]
    .join(" ")
    .toLowerCase();

  const diagTokens = tokenize(diagText);
  let score = 0;

  for (const qt of queryTokens) {
    // Direct token match in problem title = 3x weight
    if (diagnostic.problem.toLowerCase().includes(qt)) {
      score += 3;
    }
    // Category match = 2x weight
    if (diagnostic.category.toLowerCase().includes(qt)) {
      score += 2;
    }
    // Body match
    if (diagText.includes(qt)) {
      score += 1;
    }
    // Partial match
    if (diagTokens.some((dt) => dt.includes(qt) || qt.includes(dt))) {
      score += 0.5;
    }
  }

  // Severity boost (high severity issues surface first when ambiguous)
  if (diagnostic.severity === "high") score += 0.3;

  return score;
}

function generateRecommendation(
  topMatches: { diagnostic: Diagnostic; score: number }[],
  description: string,
  recentConditions: { ambientTemp?: number; humidity?: number; hoseTempA?: number; hoseTempB?: number; drumTempA?: number; drumTempB?: number } | null
): string {
  if (topMatches.length === 0) {
    return "No matching diagnostics found. Try describing the visual appearance of the foam, the conditions, or the equipment behavior.";
  }

  const top = topMatches[0];
  const causes = toArray(top.diagnostic.causes);
  const fixes = toArray(top.diagnostic.fixes);

  let rec = `Most likely issue: **${top.diagnostic.problem}** (${top.diagnostic.category}, ${top.diagnostic.severity} severity).\n\n`;

  if (causes.length > 0) {
    rec += `Primary cause: ${causes[0]}`;
    if (causes.length > 1) rec += `, or ${causes[1].toLowerCase()}`;
    rec += ".\n\n";
  }

  if (fixes.length > 0) {
    rec += `Immediate action: ${fixes[0]}`;
    if (fixes.length > 1) rec += `. Also check: ${fixes[1].toLowerCase()}`;
    rec += ".";
  }

  // Inject condition-specific advice
  if (recentConditions) {
    const flags: string[] = [];
    if (recentConditions.ambientTemp && recentConditions.ambientTemp < 50) {
      flags.push("ambient temp is below 50°F — substrate is likely cold, pre-heat if possible");
    }
    if (recentConditions.humidity && recentConditions.humidity > 85) {
      flags.push("humidity is above 85% — dew point risk is high, verify substrate is dry");
    }
    if (recentConditions.hoseTempA && recentConditions.hoseTempB &&
        Math.abs(recentConditions.hoseTempA - recentConditions.hoseTempB) > 5) {
      flags.push(`hose temp imbalance detected (A: ${recentConditions.hoseTempA}°F vs B: ${recentConditions.hoseTempB}°F) — match both to target`);
    }
    if (flags.length > 0) {
      rec += `\n\n⚠️ Current condition flags: ${flags.join("; ")}.`;
    }
  }

  return rec;
}

export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const { description, conditions: clientConditions, photoDescription } = await request.json();
    // Allow either text description or decision-tree generated description
    const fullDescription = [description, photoDescription].filter(Boolean).join(". ");
    if (!fullDescription || fullDescription.trim().length < 3) {
      return NextResponse.json({ success: false, error: { message: "Please describe the problem" } }, { status: 400 });
    }

    // Fetch all diagnostics + recent job conditions in parallel
    const [diagnostics, recentJobs] = await Promise.all([
      prisma.foamDiagnostic.findMany(),
      prisma.foamJob.findMany({
        where: { userId: session.userId, companyId: session.companyId },
        orderBy: { date: "desc" },
        take: 1,
        select: {
          ambientTemp: true,
          humidity: true,
          hoseTempA: true,
          hoseTempB: true,
          drumTempA: true,
          drumTempB: true,
        },
      }),
    ]);

    // Combine DB diagnostics with knowledge base extras (EasySeal + AF1)
    const allDiagnostics: Diagnostic[] = [
      ...(diagnostics as Diagnostic[]),
      ...EASYSEAL_EXTRA_DIAGNOSTICS,
      ...AF1_EXTRA_DIAGNOSTICS,
    ];

    const rawTokens = tokenize(fullDescription);
    const queryTokens = expandTokens(rawTokens);

    const scored = allDiagnostics
      .map((d) => ({ diagnostic: d, score: scoreMatch(queryTokens, d) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Client-side conditions (from dial-in live mode) override DB conditions
    const dbConditions = recentJobs.length > 0 ? {
      ambientTemp: recentJobs[0].ambientTemp ?? undefined,
      humidity: recentJobs[0].humidity ?? undefined,
      hoseTempA: recentJobs[0].hoseTempA ?? undefined,
      hoseTempB: recentJobs[0].hoseTempB ?? undefined,
      drumTempA: recentJobs[0].drumTempA ?? undefined,
      drumTempB: recentJobs[0].drumTempB ?? undefined,
    } : null;

    const recentConditions = clientConditions ? {
      ambientTemp: clientConditions.ambient ?? dbConditions?.ambientTemp,
      humidity: clientConditions.humidity ?? dbConditions?.humidity,
      hoseTempA: clientConditions.recHoseTemp ?? dbConditions?.hoseTempA,
      hoseTempB: clientConditions.recHoseTemp ?? dbConditions?.hoseTempB,
      drumTempA: clientConditions.recDrumTemp ?? dbConditions?.drumTempA,
      drumTempB: clientConditions.recDrumTemp ?? dbConditions?.drumTempB,
    } : dbConditions;

    const recommendation = generateRecommendation(scored.slice(0, 3), fullDescription, recentConditions);
    const maxScore = scored[0]?.score ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        matches: scored.map((r) => ({
          ...r.diagnostic,
          causes: toArray(r.diagnostic.causes),
          fixes: toArray(r.diagnostic.fixes),
          confidence: maxScore > 0 ? Math.min(100, Math.round((r.score / maxScore) * 100)) : 0,
          score: r.score,
        })),
        recommendation,
        conditionsUsed: recentConditions,
        queryTokens,
      },
    });
  } catch (err) {
    console.error("[Troubleshoot]", err);
    return NextResponse.json({ success: false, error: { message: "Troubleshoot failed" } }, { status: 500 });
  }
}
