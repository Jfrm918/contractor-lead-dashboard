"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

interface JobSite {
  id: string;
  name: string;
  address: string | null;
  jobType: string | null;
  status: string;
  estimatedSets: number | null;
  totalSets: number;
  totalBF: number;
  totalSqft: number;
  daysWorked: number;
  foamSystem: { product: string; manufacturer: string; yieldPerSet: number } | null;
  user: { name: string } | null;
  createdAt: string;
  updatedAt?: string;
}

/* ── Completion ring SVG ── */
function CompletionRing({ pct }: { pct: number }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color =
    pct >= 100 ? "#34d399" : pct >= 75 ? "#f97316" : "#3b82f6";
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0">
      <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      <motion.circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
      />
      <text
        x="20"
        y="20"
        textAnchor="middle"
        dominantBaseline="central"
        fill="rgba(255,255,255,0.5)"
        fontSize="9"
        fontWeight="500"
      >
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

/* ── Yield efficiency badge ── */
function YieldBadge({ site }: { site: JobSite }) {
  if (site.status !== "complete" || !site.foamSystem || site.totalSets <= 0) return null;
  const actualYield = site.totalBF / site.totalSets;
  const pct = (actualYield / site.foamSystem.yieldPerSet) * 100;
  if (!isFinite(pct)) return null;
  const color =
    pct >= 85
      ? "bg-green-500/20 text-green-400"
      : pct >= 70
      ? "bg-orange/20 text-orange"
      : "bg-red-500/20 text-red-400";
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${color}`}>
      {Math.round(pct)}% yield
    </span>
  );
}

export default function JobSitesList({
  onNavigate,
  onViewSite,
}: {
  onNavigate: (page: string) => void;
  onViewSite: (siteId: string) => void;
}) {
  const [sites, setSites] = useState<JobSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("active");

  useEffect(() => {
    fetch("/api/job-sites")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSites(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "active") return sites.filter((s) => s.status === "in_progress" || s.status === "on_hold");
    if (filter === "complete") return sites.filter((s) => s.status === "complete");
    return sites;
  }, [sites, filter]);

  // Pin top 3 recently active sites as hero cards
  const heroSites = useMemo(() => {
    const active = sites.filter((s) => s.status === "in_progress");
    return active.slice(0, 3);
  }, [sites]);

  const heroIds = useMemo(() => new Set(heroSites.map((s) => s.id)), [heroSites]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const item = {
    hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)" },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl text-white font-medium">Job Sites</h1>
          <p className="text-xs text-white/40 mt-0.5">All your project locations</p>
        </div>
        <motion.button
          onClick={() => onNavigate("new-job-site")}
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl bg-orange text-white hover:bg-orange-light transition-all shadow-lg shadow-orange/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Site
        </motion.button>
      </motion.div>

      {/* Hero cards — pinned recently active */}
      {filter === "active" && heroSites.length > 0 && (
        <motion.div variants={item} className="space-y-3">
          <div className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Recently Active</div>
          {heroSites.map((site) => {
            const progressPct =
              site.estimatedSets && site.estimatedSets > 0
                ? Math.min((site.totalSets / site.estimatedSets) * 100, 100)
                : null;
            return (
              <motion.button
                key={site.id}
                variants={item}
                onClick={() => onViewSite(site.id)}
                whileTap={{ scale: 0.93 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="w-full glass-card result-card-hover p-5 text-left cursor-pointer border-l-2 border-l-orange/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">{site.name}</div>
                    {site.address && (
                      <div className="text-xs text-white/30 truncate mt-0.5">{site.address}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {progressPct !== null && <CompletionRing pct={progressPct} />}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                      Active
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-white/50">
                  <span className="metric-value">{site.totalSets.toFixed(1)} sets</span>
                  <span className="metric-value">{Math.round(site.totalBF).toLocaleString()} BF</span>
                  <span>{site.daysWorked} day{site.daysWorked !== 1 ? "s" : ""}</span>
                </div>
                {progressPct !== null && (
                  <div className="mt-3">
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          progressPct >= 100 ? "bg-green-500" : progressPct >= 75 ? "bg-orange" : "bg-blue"
                        }`}
                      />
                    </div>
                  </div>
                )}
                <div className="flex gap-3 mt-2 text-[10px] text-white/25">
                  {site.foamSystem && <span>{site.foamSystem.manufacturer} {site.foamSystem.product}</span>}
                  {site.jobType && <span>{site.jobType.replace(/_/g, " ")}</span>}
                </div>
              </motion.button>
            );
          })}
          <div className="gradient-divider" />
        </motion.div>
      )}

      {/* Filter tabs */}
      <motion.div variants={item} className="flex gap-1 p-1 rounded-xl bg-white/3">
        {[
          { id: "active", label: "Active" },
          { id: "complete", label: "Completed" },
          { id: "all", label: "All" },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              filter === tab.id
                ? "bg-orange/15 text-orange"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </motion.div>

      {loading ? (
        <div className="text-white/30 text-sm py-12 text-center">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-white/30 text-sm">
            {filter === "active" ? "No active job sites." : filter === "complete" ? "No completed job sites." : "No job sites yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((site) => {
            // Skip hero-pinned sites in the active filter to avoid duplication
            if (filter === "active" && heroIds.has(site.id)) return null;

            const progressPct = site.estimatedSets && site.estimatedSets > 0
              ? Math.min((site.totalSets / site.estimatedSets) * 100, 100)
              : null;

            return (
              <motion.button
                key={site.id}
                variants={item}
                onClick={() => onViewSite(site.id)}
                whileTap={{ scale: 0.93 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="w-full glass-card result-card-hover p-4 text-left cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">{site.name}</div>
                    {site.address && (
                      <div className="text-xs text-white/30 truncate mt-0.5">{site.address}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {progressPct !== null && <CompletionRing pct={progressPct} />}
                    <YieldBadge site={site} />
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                        site.status === "in_progress"
                          ? "bg-green-500/20 text-green-400"
                          : site.status === "on_hold"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {site.status === "in_progress" ? "Active" : site.status === "on_hold" ? "On Hold" : "Complete"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-white/50">
                  <span className="metric-value">{site.totalSets.toFixed(1)} sets</span>
                  <span className="metric-value">{Math.round(site.totalBF).toLocaleString()} BF</span>
                  <span>{site.daysWorked} day{site.daysWorked !== 1 ? "s" : ""}</span>
                </div>
                {progressPct !== null && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          progressPct >= 100 ? "bg-green-500" : progressPct >= 75 ? "bg-orange" : "bg-blue"
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex gap-3 mt-2 text-[10px] text-white/25">
                  {site.foamSystem && <span>{site.foamSystem.manufacturer} {site.foamSystem.product}</span>}
                  {site.jobType && <span>{site.jobType.replace(/_/g, " ")}</span>}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
