"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import InProgressCard from "./in-progress-card";

interface Job {
  id: string;
  date: string;
  location: string;
  substrate: string | null;
  setsUsed: number | null;
  boardFeet: number | null;
  gallonsTotal: number | null;
  jobType: string | null;
  rating: number | null;
  yieldActual: number | null;
  yieldTarget: number | null;
  yieldVariance: number | null;
  problems: string[];
  foamSystem: { product: string; yieldPerSet: number } | null;
  user: { name: string } | null;
}

interface JobSite {
  id: string;
  name: string;
  address: string | null;
  jobType: string | null;
  substrate: string | null;
  foamSystemId: string | null;
  foamSystem: { id: string; product: string; manufacturer: string; type: string; yieldPerSet: number } | null;
  estimatedSets: number | null;
  status: string;
  notes: string | null;
  totalSets: number;
  totalBF: number;
  daysWorked: number;
  user: { name: string } | null;
}

const DEFAULT_TARGET = 20000;

export default function Dashboard({
  onNavigate,
  onViewSite,
}: {
  onNavigate: (page: string) => void;
  onViewSite: (siteId: string) => void;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sites, setSites] = useState<JobSite[]>([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [yieldHealth, setYieldHealth] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/jobs?limit=100").then((r) => r.json()),
      fetch("/api/job-sites").then((r) => r.json()),
      fetch("/api/yield-alerts").then((r) => r.json()).catch(() => ({ success: false })),
    ])
      .then(([jobsData, sitesData, yieldData]) => {
        if (jobsData.success) setJobs(jobsData.data);
        if (sitesData.success) setSites(sitesData.data);
        if (yieldData.success) setYieldHealth(yieldData.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeSites = useMemo(
    () => sites.filter((s) => s.status === "in_progress" || s.status === "on_hold"),
    [sites]
  );

  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thisWeek = jobs.filter((j) => new Date(j.date) >= weekAgo);
    const thisMonth = jobs.filter((j) => new Date(j.date) >= monthAgo);

    const totalBF = jobs.reduce((s, j) => s + (j.boardFeet || 0), 0);
    const totalSets = jobs.reduce((s, j) => s + (j.setsUsed || 0), 0);

    const yields = jobs
      .map((j) => j.yieldActual)
      .filter((y): y is number => y != null);
    const avgYield =
      yields.length > 0
        ? Math.round(yields.reduce((a, b) => a + b, 0) / yields.length)
        : 0;

    const target = jobs.find((j) => j.foamSystem?.yieldPerSet)?.foamSystem?.yieldPerSet || DEFAULT_TARGET;
    const yieldPercent = target > 0 ? (avgYield / target) * 100 : 100;

    return {
      jobsThisWeek: thisWeek.length,
      jobsThisMonth: thisMonth.length,
      totalBF,
      totalSets,
      avgYield,
      yieldPercent,
      target,
    };
  }, [jobs]);

  const yieldTrend = useMemo(() => {
    return jobs
      .filter((j) => j.yieldActual != null)
      .slice(0, 10)
      .reverse()
      .map((j) => ({
        yield: j.yieldActual!,
        location: j.location,
        date: j.date,
      }));
  }, [jobs]);

  const yieldAlert = useMemo(() => {
    const recent = jobs
      .filter((j) => j.yieldActual != null)
      .slice(0, 3);
    if (recent.length === 0) return null;

    const avgRecent = recent.reduce((s, j) => s + (j.yieldActual || 0), 0) / recent.length;
    const target = recent[0]?.foamSystem?.yieldPerSet || DEFAULT_TARGET;
    const pctOff = ((target - avgRecent) / target) * 100;

    let level: "red" | "yellow" | "green" = "green";
    let message = "Looking good! Your recent yields are on target.";
    let suggestion = "";

    if (pctOff >= 10) {
      level = "red";
      message = `Yield is ${pctOff.toFixed(0)}% below target across your last ${recent.length} jobs.`;
      suggestion = "Check drum temps (should be 68-72F), verify ratio is balanced, and inspect gun/nozzle for wear. Cold drums are the #1 cause of low yield.";
    } else if (pctOff >= 5) {
      level = "yellow";
      message = `Yield is ${pctOff.toFixed(0)}% below target. Trending down slightly.`;
      suggestion = "Monitor hose temps and make sure you are applying at proper thickness. Thin passes waste more material to overspray.";
    } else {
      suggestion = "Keep doing what you are doing. Consistent drum conditioning and proper pass thickness are keeping your yield healthy.";
    }

    return { level, message, suggestion, avgRecent: Math.round(avgRecent), target };
  }, [jobs]);

  const topProblems = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const j of jobs) {
      const probs = Array.isArray(j.problems) ? j.problems : [];
      for (const p of probs) {
        if (p && p !== "None") counts[p] = (counts[p] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([problem, count]) => ({ problem, count }));
  }, [jobs]);

  const lastJob = jobs[0] || null;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const yieldColor =
    stats.yieldPercent >= 95
      ? "text-green-400"
      : stats.yieldPercent >= 85
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* In-progress jobs — top of dashboard so they're impossible to miss */}
      <InProgressCard onResume={(jobId) => onNavigate(`resume-job:${jobId}`)} />

      {/* Command Hero — shimmer edge + inner glow */}
      <motion.div variants={item} className="fd-command-hero shimmer-edge inner-glow-orange p-5 sm:p-6 lg:p-8">
        <div className="relative z-10 grid gap-6 xl:grid-cols-[1.25fr_0.75fr] xl:items-end">
          <div>
            <div className="fd-hero-chip mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-orange shadow-[0_0_12px_rgba(249,115,22,0.9)]" />
              FoamDial Field Intelligence
            </div>
            <h1 className="max-w-4xl text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.055em] text-white">
              Spray command center for yield, heat, chemical behavior, and jobsite memory.
            </h1>
            <p className="mt-4 max-w-2xl text-sm sm:text-base text-white/50 leading-7">
              Built like LRP&apos;s executive dashboard, but skinned for the rig: closed-cell texture,
              thermal orange, steel-blue instrumentation, and fast readouts that protect material margin.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="pill-info">Live job memory</span>
              <span className="pill-caution">Yield drift watch</span>
              <span className="pill-go">Dial-in ready</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="fd-foam-panel rounded-2xl p-4">
              <div className="relative z-10 text-[10px] text-white/35 uppercase tracking-[0.14em]">Board Feet</div>
              <div className="relative z-10 fd-mono-readout mt-2 text-2xl text-white">{stats.totalBF.toLocaleString()}</div>
            </div>
            <div className="fd-foam-panel rounded-2xl p-4">
              <div className="relative z-10 text-[10px] text-white/35 uppercase tracking-[0.14em]">Avg Yield</div>
              <div className={`relative z-10 fd-mono-readout mt-2 text-2xl ${yieldColor}`}>{stats.avgYield.toLocaleString()}</div>
            </div>
            <div className="fd-foam-panel rounded-2xl p-4">
              <div className="relative z-10 text-[10px] text-white/35 uppercase tracking-[0.14em]">Active Sites</div>
              <div className="relative z-10 fd-mono-readout mt-2 text-2xl text-orange">{activeSites.length}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Active Job Sites Section */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="fd-section-title">Active Job Sites</h2>
          <button
            onClick={() => onNavigate("new-job-site")}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-orange/15 text-orange border border-orange/20 hover:bg-orange/25 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Job Site
          </button>
        </div>
        {activeSites.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-white/30 text-sm">No active job sites. Create one to start tracking multi-day projects.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {activeSites.map((site) => {
              const progressPct = site.estimatedSets && site.estimatedSets > 0
                ? Math.min((site.totalSets / site.estimatedSets) * 100, 100)
                : null;
              return (
                <motion.button
                  key={site.id}
                  onClick={() => onViewSite(site.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="glass-card interactive-card fd-foam-panel p-4 text-left hover:bg-white/8 transition-all cursor-pointer w-full"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium truncate">{site.name}</div>
                      {site.address && (
                        <div className="text-xs text-white/30 truncate mt-0.5">{site.address}</div>
                      )}
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                        site.status === "in_progress"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {site.status === "in_progress" ? "Active" : "On Hold"}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-white/50">
                    <span>{site.totalSets.toFixed(1)} sets</span>
                    <span>{site.daysWorked} day{site.daysWorked !== 1 ? "s" : ""}</span>
                    {site.estimatedSets && (
                      <span className="text-orange/70">{site.estimatedSets} est.</span>
                    )}
                  </div>
                  {progressPct !== null && (
                    <div className="mt-2">
                      <div className="progress-track">
                        <div
                          className={`progress-fill ${
                            progressPct >= 100
                              ? "!bg-gradient-to-r !from-green-500 !to-emerald-400"
                              : progressPct >= 75
                              ? ""
                              : "!bg-gradient-to-r !from-blue !to-cyan"
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {site.foamSystem && (
                    <div className="text-[10px] text-white/25 mt-2 truncate">
                      {site.foamSystem.manufacturer} {site.foamSystem.product}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Top Stats Row — glass-elevated with color-matched glows */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total BF Sprayed"
          value={stats.totalBF.toLocaleString()}
          glowClass="inner-glow-orange"
          glowShadow="0 0 40px rgba(249, 115, 22, 0.06)"
        />
        <StatCard
          label="Total Sets Used"
          value={stats.totalSets.toFixed(1)}
          glowClass="inner-glow-amber"
          glowShadow="0 0 40px rgba(245, 158, 11, 0.06)"
        />
        <StatCard
          label="Avg Yield (bf/set)"
          value={stats.avgYield.toLocaleString()}
          className={yieldColor}
          glowClass="inner-glow-blue"
          glowShadow="0 0 40px rgba(59, 130, 246, 0.06)"
        />
        <div
          className="glass-elevated inner-glow-green p-4"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.28), 0 16px 48px rgba(0,0,0,0.18), 0 0 40px rgba(52, 211, 153, 0.06)" }}
        >
          <div className="relative z-10 fd-section-title">Jobs</div>
          <div className="relative z-10 text-lg font-light text-white mt-1 fd-mono-readout">
            {stats.jobsThisWeek} <span className="text-xs text-white/30">this week</span>
          </div>
          <div className="relative z-10 text-sm text-white/50">
            {stats.jobsThisMonth} <span className="text-xs text-white/30">this month</span>
          </div>
        </div>
      </motion.div>

      {/* Yield Health Card */}
      {yieldHealth?.hasData && (
        <motion.div
          variants={item}
          className={`glass-card p-6 border-l-4 ${
            yieldHealth.alertLevel === "red"
              ? "border-l-red-500"
              : yieldHealth.alertLevel === "yellow"
              ? "border-l-yellow-500"
              : "border-l-green-500"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  yieldHealth.alertLevel === "red"
                    ? "bg-red-500/20"
                    : yieldHealth.alertLevel === "yellow"
                    ? "bg-yellow-500/20"
                    : "bg-green-500/20"
                }`}
              >
                {yieldHealth.trend === "up" ? (
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                ) : yieldHealth.trend === "down" ? (
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Yield Health</h2>
                <p
                  className={`text-lg font-light ${
                    yieldHealth.alertLevel === "red"
                      ? "text-red-400"
                      : yieldHealth.alertLevel === "yellow"
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {yieldHealth.avgYieldPercent}% of target
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-light text-white">
                {yieldHealth.avgYield?.toLocaleString()}
              </div>
              <div className="text-[10px] text-white/30">avg bf/set (last 5)</div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-white/30">Trend</span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  yieldHealth.trend === "up"
                    ? "bg-green-500/20 text-green-400"
                    : yieldHealth.trend === "down"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-white/10 text-white/50"
                }`}
              >
                {yieldHealth.trend === "up"
                  ? "Improving"
                  : yieldHealth.trend === "down"
                  ? "Declining"
                  : "Stable"}
              </span>
            </div>
            {yieldHealth.streakCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-white/30">Low streak</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                  {yieldHealth.streakCount} jobs
                </span>
              </div>
            )}
            {yieldHealth.target && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-white/30">Target</span>
                <span className="text-xs text-white/50">
                  {yieldHealth.target.toLocaleString()} bf/set
                </span>
              </div>
            )}
          </div>

          {yieldHealth.alertActive && yieldHealth.causes?.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 space-y-1.5"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-red-400 font-medium uppercase tracking-wider">Likely Causes</span>
              </div>
              {yieldHealth.causes.map((cause: string, i: number) => (
                <p key={i} className="text-xs text-white/50 pl-4">
                  {cause}
                </p>
              ))}
            </motion.div>
          )}

          {!yieldHealth.alertActive && yieldHealth.alertLevel === "green" && (
            <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-green-400 font-medium">On Track</span>
              <span className="text-xs text-white/40">- Yield is healthy and consistent</span>
            </div>
          )}

          {!yieldHealth.alertActive && yieldHealth.alertLevel === "yellow" && (
            <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-xs text-yellow-400 font-medium">Watch</span>
              <span className="text-xs text-white/40">- Yield slightly below target, monitor next few jobs</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Log CTA — shimmer edge */}
      <motion.div variants={item}>
        <button
          onClick={() => onNavigate("job-logger")}
          className="w-full lg:w-auto glass-card shimmer-edge interactive-card px-8 py-4 flex items-center gap-4 hover:bg-white/8 transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-orange/20 flex items-center justify-center group-hover:bg-orange/30 transition-colors">
            <svg className="w-6 h-6 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-white font-medium">Log New Job</div>
            <div className="text-xs text-white/40">60-second quick entry</div>
          </div>
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Yield Alert Card */}
        {yieldAlert && (
          <motion.div variants={item} className={`glass-card p-6 ${
            yieldAlert.level === "red"
              ? "border-red-500/30"
              : yieldAlert.level === "yellow"
              ? "border-yellow-500/30"
              : "border-green-500/30"
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${
                yieldAlert.level === "red"
                  ? "bg-red-500 animate-pulse"
                  : yieldAlert.level === "yellow"
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`} />
              <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Yield Alert</h2>
            </div>
            <p className={`text-sm font-medium ${
              yieldAlert.level === "red"
                ? "text-red-400"
                : yieldAlert.level === "yellow"
                ? "text-yellow-400"
                : "text-green-400"
            }`}>
              {yieldAlert.message}
            </p>
            <div className="flex gap-4 mt-2 text-xs text-white/40">
              <span>Recent avg: {yieldAlert.avgRecent.toLocaleString()} bf/set</span>
              <span>Target: {yieldAlert.target.toLocaleString()} bf/set</span>
            </div>
            <p className="text-xs text-white/50 mt-3 p-2 rounded-lg bg-white/3">
              {yieldAlert.suggestion}
            </p>
          </motion.div>
        )}

        {/* Last Job Summary */}
        {lastJob && (
          <motion.div variants={item} className="glass-card p-6">
            <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">Last Job</h2>
            <div className="text-white font-medium">{lastJob.location}</div>
            <div className="text-xs text-white/40 mt-1">
              {new Date(lastJob.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              {lastJob.foamSystem ? ` \u00b7 ${lastJob.foamSystem.product}` : ""}
              {lastJob.jobType ? ` \u00b7 ${lastJob.jobType.replace(/_/g, " ")}` : ""}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div>
                <div className="text-[10px] text-white/30">Sets</div>
                <div className="text-sm text-white">{lastJob.setsUsed ?? "-"}</div>
              </div>
              <div>
                <div className="text-[10px] text-white/30">Board Feet</div>
                <div className="text-sm text-white">{lastJob.boardFeet ? Math.round(lastJob.boardFeet).toLocaleString() : "-"}</div>
              </div>
              <div>
                <div className="text-[10px] text-white/30">Yield</div>
                <div className={`text-sm font-medium ${
                  lastJob.yieldVariance != null
                    ? lastJob.yieldVariance >= 0 ? "text-green-400" : "text-red-400"
                    : "text-white"
                }`}>
                  {lastJob.yieldActual ? `${Math.round(lastJob.yieldActual).toLocaleString()} bf/set` : "-"}
                </div>
              </div>
            </div>
            {lastJob.rating && (
              <div className="mt-3 text-orange text-sm">
                {"\u2605".repeat(lastJob.rating)}{"\u2606".repeat(5 - lastJob.rating)}
              </div>
            )}
          </motion.div>
        )}

        {/* Yield Trend Bar Chart */}
        <motion.div variants={item} className="glass-textured p-6 rounded-[22px]">
          <div className="glass-grain" />
          <h2 className="relative z-10 text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
            Yield Trend (Last 10 Jobs)
          </h2>
          {yieldTrend.length > 1 ? (
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-white/30 mb-1">
                <div className="w-3 h-0.5 bg-orange/50" />
                <span>Target: {stats.target.toLocaleString()} bf/set</span>
              </div>
              <div className="h-32 flex items-end gap-1.5">
                {yieldTrend.map((entry, i) => {
                  const max = Math.max(...yieldTrend.map((e) => e.yield), stats.target * 1.1);
                  const height = (entry.yield / max) * 100;
                  const targetHeight = (stats.target / max) * 100;
                  const isAboveTarget = entry.yield >= stats.target;

                  return (
                    <div key={i} className="flex-1 relative group">
                      <div
                        className="absolute w-full border-t border-dashed border-orange/30"
                        style={{ bottom: `${targetHeight}%` }}
                      />
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        className={`w-full rounded-t-sm min-h-[4px] ${
                          isAboveTarget
                            ? "bg-gradient-to-t from-green-500/40 to-green-500/80"
                            : "bg-gradient-to-t from-red-500/40 to-red-500/70"
                        }`}
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-black/90 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                          {Math.round(entry.yield).toLocaleString()} bf/set
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="relative z-10 text-white/30 text-sm py-4 text-center">
              Log more jobs to see trends
            </div>
          )}
        </motion.div>

        {/* Most Common Problems */}
        <motion.div variants={item} className="glass-card p-6">
          <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
            Top Problems
          </h2>
          {topProblems.length > 0 ? (
            <div className="space-y-2">
              {topProblems.map((p, i) => (
                <div key={p.problem} className="flex items-center gap-3">
                  <span className="text-xs text-white/30 w-4">{i + 1}.</span>
                  <div className="flex-1 flex items-center justify-between p-2 rounded-lg interactive-row">
                    <span className="text-sm text-white/70">{p.problem}</span>
                    <span className="text-xs text-red-400 font-medium">{p.count}x</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white/30 text-sm py-4 text-center">
              No problems logged yet
            </div>
          )}
        </motion.div>

        {/* Recent Jobs */}
        <motion.div variants={item} className="glass-card p-6 lg:col-span-2">
          <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
            Recent Jobs
          </h2>
          {loading ? (
            <div className="text-white/30 text-sm py-8 text-center">Loading...</div>
          ) : jobs.length === 0 ? (
            <div className="text-white/30 text-sm py-8 text-center">
              No jobs logged yet. Start by logging your first job.
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.slice(0, 6).map((job) => (
                <div
                  key={job.id}
                  className="p-3 rounded-xl interactive-row border border-white/5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-white font-medium">{job.location}</div>
                      <div className="text-xs text-white/40 mt-0.5">
                        {job.foamSystem?.product || "No foam system"}
                        {job.setsUsed ? ` \u00b7 ${job.setsUsed} set(s)` : ""}
                        {job.boardFeet ? ` \u00b7 ${Math.round(job.boardFeet).toLocaleString()} bf` : ""}
                        {job.jobType ? ` \u00b7 ${job.jobType.replace(/_/g, " ")}` : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/40">{new Date(job.date).toLocaleDateString()}</div>
                      {job.rating && (
                        <div className="text-xs text-orange mt-0.5">
                          {"\u2605".repeat(job.rating)}{"\u2606".repeat(5 - job.rating)}
                        </div>
                      )}
                    </div>
                  </div>
                  {job.yieldActual != null && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="text-xs text-white/50">
                        Yield: {Math.round(job.yieldActual).toLocaleString()} bf/set
                      </div>
                      {job.yieldVariance != null && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          job.yieldVariance >= 0
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {job.yieldVariance >= 0 ? "+" : ""}{job.yieldVariance.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={item} className="glass-card p-6">
        <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Job Sites", page: "job-sites-list", color: "orange" },
            { label: "Log Job", page: "job-logger", color: "orange" },
            { label: "BF Calculator", page: "bf-calculator", color: "blue" },
            { label: "Dial-In Calc", page: "calculator", color: "blue" },
            { label: "Foam Database", page: "foam-db", color: "orange" },
          ].map((action) => (
            <button
              key={action.page}
              onClick={() => onNavigate(action.page)}
              className={`p-3 rounded-xl border transition-all text-left interactive-card ${
                action.color === "orange"
                  ? "border-orange/20 hover:bg-orange/10 text-orange/80"
                  : "border-blue/20 hover:bg-blue/10 text-blue/80"
              }`}
            >
              <div className="text-sm font-medium">{action.label}</div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  className,
  glowClass,
  glowShadow,
}: {
  label: string;
  value: string;
  className?: string;
  glowClass?: string;
  glowShadow?: string;
}) {
  return (
    <div
      className={`glass-elevated fd-foam-panel p-4 ${glowClass || ""}`}
      style={glowShadow ? { boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.28), 0 16px 48px rgba(0,0,0,0.18), ${glowShadow}` } : undefined}
    >
      <div className="relative z-10 fd-section-title">{label}</div>
      <div className={`relative z-10 text-2xl font-light mt-1 fd-mono-readout ${className || "text-white"}`}>{value}</div>
    </div>
  );
}
