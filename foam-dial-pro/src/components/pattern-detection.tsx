"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Thermometer,
  Droplets,
  Layers,
  Building2,
  AlertTriangle,
  Lightbulb,
  Award,
} from "lucide-react";

interface Job {
  id: string;
  date: string;
  location: string;
  substrate: string | null;
  setsUsed: number | null;
  boardFeet: number | null;
  jobType: string | null;
  yieldActual: number | null;
  yieldTarget: number | null;
  ambientTemp: number | null;
  humidity: number | null;
  problems: string[];
  foamSystem: { product: string; yieldPerSet: number } | null;
}

interface Insight {
  id: string;
  icon: typeof TrendingUp;
  title: string;
  finding: string;
  recommendation: string;
  type: "good" | "bad" | "neutral";
  value?: number;
}

interface BucketStats {
  label: string;
  count: number;
  avgYield: number;
  jobs: Job[];
}

const TEMP_BUCKETS = [
  { label: "< 50\u00B0F", min: -Infinity, max: 50 },
  { label: "50\u201370\u00B0F", min: 50, max: 70 },
  { label: "70\u201390\u00B0F", min: 70, max: 90 },
  { label: "90\u00B0F+", min: 90, max: Infinity },
];

const HUMIDITY_BUCKETS = [
  { label: "< 50%", min: -Infinity, max: 50 },
  { label: "50\u201370%", min: 50, max: 70 },
  { label: "70%+", min: 70, max: Infinity },
];

const JOB_TYPE_LABELS: Record<string, string> = {
  metal_building: "Metal Building",
  underfloor: "Underfloor/Crawlspace",
  stemwall: "Stemwall",
  new_construction: "New Construction (Wood)",
  retrofit: "Retrofit (Wood)",
  mixed: "Mixed",
};

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function bucketize(
  jobs: Job[],
  getVal: (j: Job) => number | null,
  buckets: { label: string; min: number; max: number }[]
): BucketStats[] {
  return buckets.map((b) => {
    const matching = jobs.filter((j) => {
      const v = getVal(j);
      return v != null && v >= b.min && v < b.max;
    });
    const yields = matching
      .map((j) => j.yieldActual)
      .filter((y): y is number => y != null);
    const avgYield =
      yields.length > 0
        ? Math.round(yields.reduce((a, b) => a + b, 0) / yields.length)
        : 0;
    return { label: b.label, count: matching.length, avgYield, jobs: matching };
  });
}

function groupBy(
  jobs: Job[],
  getKey: (j: Job) => string | null
): Record<string, BucketStats> {
  const groups: Record<string, Job[]> = {};
  for (const j of jobs) {
    const key = getKey(j);
    if (!key) continue;
    if (!groups[key]) groups[key] = [];
    groups[key].push(j);
  }
  const result: Record<string, BucketStats> = {};
  for (const [key, groupJobs] of Object.entries(groups)) {
    const yields = groupJobs
      .map((j) => j.yieldActual)
      .filter((y): y is number => y != null);
    const avgYield =
      yields.length > 0
        ? Math.round(yields.reduce((a, b) => a + b, 0) / yields.length)
        : 0;
    result[key] = {
      label: key,
      count: groupJobs.length,
      avgYield,
      jobs: groupJobs,
    };
  }
  return result;
}

export default function PatternDetection() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/jobs?limit=100")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setJobs(d.data);
        else setError("Failed to load job history");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  const jobsWithYield = useMemo(
    () => jobs.filter((j) => j.yieldActual != null),
    [jobs]
  );

  const overallAvg = useMemo(() => {
    if (jobsWithYield.length === 0) return 0;
    return Math.round(
      jobsWithYield.reduce((s, j) => s + (j.yieldActual || 0), 0) /
        jobsWithYield.length
    );
  }, [jobsWithYield]);

  const insights = useMemo(() => {
    if (jobsWithYield.length < 3) return [];
    const results: Insight[] = [];
    let insightId = 0;

    // --- Temperature analysis ---
    const tempBuckets = bucketize(
      jobsWithYield,
      (j) => j.ambientTemp,
      TEMP_BUCKETS
    ).filter((b) => b.count >= 2);

    if (tempBuckets.length >= 2) {
      const best = tempBuckets.reduce((a, b) =>
        a.avgYield > b.avgYield ? a : b
      );
      const worst = tempBuckets.reduce((a, b) =>
        a.avgYield < b.avgYield ? a : b
      );

      if (best.avgYield > worst.avgYield) {
        results.push({
          id: `temp-best-${insightId++}`,
          icon: Thermometer,
          title: "Best Temperature Range",
          finding: `Your best yields (avg ${formatNumber(best.avgYield)} bf/set) come at ${best.label} across ${best.count} jobs.`,
          recommendation: `Schedule spray days when temps are in the ${best.label} range when possible. This range outperforms ${worst.label} by ${formatNumber(best.avgYield - worst.avgYield)} bf/set.`,
          type: "good",
          value: best.avgYield,
        });

        if (worst.count >= 2 && best.avgYield - worst.avgYield > 500) {
          results.push({
            id: `temp-worst-${insightId++}`,
            icon: Thermometer,
            title: "Temperature Watch",
            finding: `Yield drops to avg ${formatNumber(worst.avgYield)} bf/set at ${worst.label} (${worst.count} jobs).`,
            recommendation:
              worst.label.includes("< 50")
                ? "Pre-condition drums overnight, use drum heaters, and verify substrate temp is above 40\u00B0F before spraying."
                : worst.label.includes("90")
                ? "Spray earlier in the day. Hot conditions can cause fast rise and poor cell structure, reducing yield."
                : "Adjust hose temps and technique for this range.",
            type: "bad",
            value: worst.avgYield,
          });
        }
      }
    }

    // --- Humidity analysis ---
    const humBuckets = bucketize(
      jobsWithYield,
      (j) => j.humidity,
      HUMIDITY_BUCKETS
    ).filter((b) => b.count >= 2);

    if (humBuckets.length >= 2) {
      const best = humBuckets.reduce((a, b) =>
        a.avgYield > b.avgYield ? a : b
      );
      const worst = humBuckets.reduce((a, b) =>
        a.avgYield < b.avgYield ? a : b
      );

      if (best.avgYield > worst.avgYield && best.avgYield - worst.avgYield > 300) {
        results.push({
          id: `hum-best-${insightId++}`,
          icon: Droplets,
          title: "Optimal Humidity",
          finding: `Yields are highest at ${best.label} humidity (avg ${formatNumber(best.avgYield)} bf/set, ${best.count} jobs).`,
          recommendation: `Target spray days with humidity in the ${best.label} range. High humidity increases dew point risk and can cause adhesion issues.`,
          type: "good",
          value: best.avgYield,
        });
      }

      if (worst.count >= 2 && worst.label.includes("70%+")) {
        results.push({
          id: `hum-worst-${insightId++}`,
          icon: Droplets,
          title: "High Humidity Warning",
          finding: `Yield drops to ${formatNumber(worst.avgYield)} bf/set at ${worst.label} humidity (${worst.count} jobs).`,
          recommendation:
            "Check dew point spread before spraying. Use fans or dehumidifiers in enclosed spaces. High humidity can cause fisheyes and adhesion failures.",
          type: "bad",
          value: worst.avgYield,
        });
      }
    }

    // --- Substrate analysis ---
    const substrateGroups = groupBy(jobsWithYield, (j) => j.substrate);
    const substrates = Object.values(substrateGroups).filter(
      (g) => g.count >= 2
    );

    if (substrates.length >= 2) {
      const best = substrates.reduce((a, b) =>
        a.avgYield > b.avgYield ? a : b
      );
      const worst = substrates.reduce((a, b) =>
        a.avgYield < b.avgYield ? a : b
      );

      if (best.avgYield > worst.avgYield) {
        results.push({
          id: `sub-best-${insightId++}`,
          icon: Layers,
          title: "Best Substrate",
          finding: `${best.label} yields avg ${formatNumber(best.avgYield)} bf/set across ${best.count} jobs \u2014 your best-performing substrate.`,
          recommendation: `Keep current technique for ${best.label}. Document your process for consistent results.`,
          type: "good",
          value: best.avgYield,
        });
      }

      if (best.avgYield - worst.avgYield > 500) {
        const pctDiff = Math.round(
          ((best.avgYield - worst.avgYield) / best.avgYield) * 100
        );
        results.push({
          id: `sub-worst-${insightId++}`,
          icon: Layers,
          title: "Substrate Yield Gap",
          finding: `${worst.label} averages ${pctDiff}% lower yield than ${best.label} (${formatNumber(worst.avgYield)} vs ${formatNumber(best.avgYield)} bf/set).`,
          recommendation: `For ${worst.label}: verify surface prep, check for moisture or contaminants, and consider adjusting pass thickness.`,
          type: "bad",
          value: worst.avgYield,
        });
      }
    }

    // --- Job type analysis ---
    const jobTypeGroups = groupBy(jobsWithYield, (j) => j.jobType);
    const jobTypes = Object.values(jobTypeGroups).filter((g) => g.count >= 2);

    if (jobTypes.length >= 2) {
      const best = jobTypes.reduce((a, b) =>
        a.avgYield > b.avgYield ? a : b
      );
      const worst = jobTypes.reduce((a, b) =>
        a.avgYield < b.avgYield ? a : b
      );
      const bestLabel = JOB_TYPE_LABELS[best.label] || best.label;
      const worstLabel = JOB_TYPE_LABELS[worst.label] || worst.label;

      if (best.avgYield > worst.avgYield) {
        results.push({
          id: `jt-best-${insightId++}`,
          icon: Building2,
          title: "Best Job Type",
          finding: `${bestLabel} jobs produce your highest yields at ${formatNumber(best.avgYield)} bf/set (${best.count} jobs).`,
          recommendation: `Your technique and setup are dialed in for ${bestLabel}. Use this as your benchmark.`,
          type: "good",
          value: best.avgYield,
        });
      }

      if (best.avgYield - worst.avgYield > 500) {
        const pctDiff = Math.round(
          ((best.avgYield - worst.avgYield) / best.avgYield) * 100
        );
        results.push({
          id: `jt-worst-${insightId++}`,
          icon: Building2,
          title: "Job Type Yield Gap",
          finding: `${worstLabel} jobs average ${pctDiff}% lower yield than ${bestLabel} (${formatNumber(worst.avgYield)} vs ${formatNumber(best.avgYield)} bf/set).`,
          recommendation: `Review gun distance and pass speed for ${worstLabel}. Metal buildings often need different technique than wood frame.`,
          type: "bad",
          value: worst.avgYield,
        });
      }
    }

    // --- Problem pattern analysis ---
    const problemCounts: Record<string, { count: number; conditions: string[] }> = {};
    for (const j of jobsWithYield) {
      const probs = Array.isArray(j.problems) ? j.problems : [];
      for (const p of probs) {
        if (!p || p === "None") continue;
        const ps = p as string;
        if (!problemCounts[ps]) problemCounts[ps] = { count: 0, conditions: [] };
        problemCounts[ps].count++;
        if (j.ambientTemp != null && j.humidity != null) {
          problemCounts[ps].conditions.push(
            `${j.ambientTemp}\u00B0F/${j.humidity}%`
          );
        }
      }
    }

    const topProblems = Object.entries(problemCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3);

    for (const [problem, info] of topProblems) {
      if (info.count >= 2) {
        results.push({
          id: `prob-${insightId++}`,
          icon: AlertTriangle,
          title: `Recurring: ${problem}`,
          finding: `"${problem}" has appeared in ${info.count} of your last ${jobsWithYield.length} jobs.${info.conditions.length > 0 ? ` Common conditions: ${info.conditions.slice(0, 3).join(", ")}.` : ""}`,
          recommendation:
            problem === "Low Yield"
              ? "Check drum temps (68\u201372\u00B0F), verify ratio balance, and inspect nozzle for wear."
              : problem === "Tacky/Sticky"
              ? "Often caused by off-ratio (too much B-side) or cold substrate. Check proportioner ratio and substrate temp."
              : problem === "Fisheyes"
              ? "Usually from surface contamination or high humidity. Improve surface prep and check dew point spread."
              : `Track when ${problem} occurs. Look for common conditions (temp, humidity, substrate) to isolate the cause.`,
          type: "bad",
        });
      }
    }

    return results;
  }, [jobsWithYield]);

  // Top conditions summary
  const topConditions = useMemo(() => {
    if (jobsWithYield.length < 5) return null;

    const topJobs = [...jobsWithYield]
      .sort((a, b) => (b.yieldActual || 0) - (a.yieldActual || 0))
      .slice(0, Math.max(3, Math.floor(jobsWithYield.length * 0.2)));

    const temps = topJobs
      .map((j) => j.ambientTemp)
      .filter((t): t is number => t != null);
    const hums = topJobs
      .map((j) => j.humidity)
      .filter((h): h is number => h != null);

    if (temps.length === 0 && hums.length === 0) return null;

    const avgTemp =
      temps.length > 0
        ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length)
        : null;
    const avgHum =
      hums.length > 0
        ? Math.round(hums.reduce((a, b) => a + b, 0) / hums.length)
        : null;
    const avgYield = Math.round(
      topJobs.reduce((s, j) => s + (j.yieldActual || 0), 0) / topJobs.length
    );

    return { avgTemp, avgHum, avgYield, count: topJobs.length };
  }, [jobsWithYield]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="animate-pulse text-white/30 text-sm">
          Analyzing job patterns...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
        <div className="text-sm text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange/15 border border-orange/20 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-orange" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Pattern Detection
          </h2>
          <p className="text-xs text-white/40">
            {jobsWithYield.length} jobs analyzed &middot; avg yield{" "}
            {formatNumber(overallAvg)} bf/set
          </p>
        </div>
      </motion.div>

      {/* Top conditions summary */}
      {topConditions && (
        <motion.div
          variants={item}
          className="glass-card p-5 border border-orange/15"
        >
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-orange" />
            <span className="text-sm font-medium text-orange">
              Your Best Conditions
            </span>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            Your top {topConditions.count} jobs (avg{" "}
            <span className="text-green-400 font-medium">
              {formatNumber(topConditions.avgYield)} bf/set
            </span>
            ) were sprayed at
            {topConditions.avgTemp != null && (
              <span className="text-white font-medium">
                {" "}
                ~{topConditions.avgTemp}&deg;F
              </span>
            )}
            {topConditions.avgHum != null && (
              <span className="text-white font-medium">
                {" "}
                with ~{topConditions.avgHum}% humidity
              </span>
            )}
            . Aim for these conditions to maximize yield.
          </p>
        </motion.div>
      )}

      {/* Insights */}
      {insights.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {insights.map((insight) => {
            const Icon = insight.icon;
            const borderColor =
              insight.type === "good"
                ? "border-green-400/20 hover:border-green-400/30"
                : insight.type === "bad"
                ? "border-red-400/20 hover:border-red-400/30"
                : "border-white/[0.08] hover:border-white/[0.12]";
            const iconColor =
              insight.type === "good"
                ? "text-green-400 bg-green-400/10"
                : insight.type === "bad"
                ? "text-red-400 bg-red-400/10"
                : "text-white/50 bg-white/[0.06]";
            const titleColor =
              insight.type === "good"
                ? "text-green-400"
                : insight.type === "bad"
                ? "text-red-400"
                : "text-white/70";

            return (
              <motion.div
                key={insight.id}
                variants={item}
                className={`glass-card p-4 border ${borderColor} transition-colors`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3
                      className={`text-sm font-medium mb-1 ${titleColor}`}
                    >
                      {insight.title}
                    </h3>
                    <p className="text-xs text-white/50 leading-relaxed mb-2">
                      {insight.finding}
                    </p>
                    <p className="text-xs text-white/35 leading-relaxed italic">
                      {insight.recommendation}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div variants={item} className="glass-card p-8 text-center">
          <div className="text-white/30 text-sm">
            {jobsWithYield.length < 3
              ? "Log at least 3 jobs with yield data to start seeing patterns."
              : "Not enough variation in your data yet to detect patterns. Keep logging jobs."}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
