"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

interface DailyLog {
  id: string;
  date: string;
  setsUsed: number | null;
  boardFeet: number | null;
  rating: number | null;
  problems: string[];
  yieldActual: number | null;
  ambientTemp: number | null;
  humidity: number | null;
  notes: string | null;
  photos: string[];
  foamSystem: { product: string } | null;
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
  totalGallons: number | null;
  status: string;
  notes: string | null;
  userId: string;
  user: { name: string } | null;
  dailyLogs: DailyLog[];
  totalSets: number;
  totalBF: number;
  daysWorked: number;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "in_progress", label: "In Progress", color: "green" },
  { value: "on_hold", label: "On Hold", color: "yellow" },
  { value: "complete", label: "Complete", color: "blue" },
];

const DEFAULT_COST_PER_SET = 850;

export default function JobSiteDetail({
  siteId,
  onNavigate,
  onLogWork,
}: {
  siteId: string;
  onNavigate: (page: string) => void;
  onLogWork: (site: JobSite) => void;
}) {
  const [site, setSite] = useState<JobSite | null>(null);
  const [loading, setLoading] = useState(true);
  const { viewMode } = useAuth();
  const showCost = viewMode === "owner";
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [gallonsInput, setGallonsInput] = useState("");
  const [savingGallons, setSavingGallons] = useState(false);

  const loadSite = useCallback(async () => {
    try {
      const res = await fetch(`/api/job-sites/${siteId}`);
      const data = await res.json();
      if (data.success) {
        setSite(data.data);
        if (data.data.totalGallons) {
          setGallonsInput(String(data.data.totalGallons));
        }
      }
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    loadSite();
  }, [loadSite]);

  async function updateStatus(newStatus: string) {
    if (!site || updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/job-sites/${siteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) setSite(data.data);
    } finally {
      setUpdating(false);
    }
  }

  async function saveTotalGallons() {
    if (!site || savingGallons) return;
    setSavingGallons(true);
    try {
      const res = await fetch(`/api/job-sites/${siteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalGallons: gallonsInput || null }),
      });
      const data = await res.json();
      if (data.success) setSite(data.data);
    } finally {
      setSavingGallons(false);
    }
  }

  // Permanently remove the site. Daily logs are preserved (their jobSiteId
  // is set to null server-side) so historical production data stays in DB.
  async function deleteSite() {
    if (!site || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/job-sites/${siteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        onNavigate("job-sites-list");
      } else {
        setDeleting(false);
        alert("Failed to delete site. Try again.");
      }
    } catch {
      setDeleting(false);
      alert("Failed to delete site. Try again.");
    }
  }

  // Computed values
  const computed = useMemo(() => {
    if (!site) return null;

    const progressPct =
      site.estimatedSets && site.estimatedSets > 0
        ? Math.min((site.totalSets / site.estimatedSets) * 100, 100)
        : null;

    // Cost summary: sets × cost per set
    const setsForCost = site.estimatedSets || site.totalSets;
    const estimatedCost = setsForCost > 0 ? setsForCost * DEFAULT_COST_PER_SET : null;

    // Yield calculation — only when complete with totalGallons
    const canCalcYield = site.status === "complete" && site.totalGallons && site.totalGallons > 0 && site.totalSets > 0;
    let actualYieldBF: number | null = null;
    let yieldEfficiency: number | null = null;

    if (canCalcYield && site.foamSystem) {
      // Actual BF from totalBF (sum of daily logs), or estimate from gallons
      actualYieldBF = site.totalBF > 0 ? site.totalBF / site.totalSets : null;
      if (actualYieldBF !== null) {
        yieldEfficiency = (actualYieldBF / site.foamSystem.yieldPerSet) * 100;
      }
    }

    return { progressPct, estimatedCost, actualYieldBF, yieldEfficiency };
  }, [site]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const item = {
    hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)" },
  };

  if (loading) {
    return (
      <div className="text-white/30 text-sm py-20 text-center">Loading job site...</div>
    );
  }

  if (!site || !computed) {
    return (
      <div className="text-red-400 text-sm py-20 text-center">Job site not found.</div>
    );
  }

  const statusColor =
    site.status === "in_progress"
      ? "green"
      : site.status === "on_hold"
      ? "yellow"
      : "blue";

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto space-y-5 pb-8"
    >
      {/* Back button */}
      <motion.div variants={item}>
        <motion.button
          onClick={() => onNavigate("dashboard")}
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Dashboard
        </motion.button>
      </motion.div>

      {/* Site header */}
      <motion.div variants={item} className="glass-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl text-white font-medium">{site.name}</h1>
            {site.address && (
              <p className="text-sm text-white/40 mt-1">{site.address}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-white/50">
              {site.jobType && (
                <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/8">
                  {site.jobType.replace(/_/g, " ")}
                </span>
              )}
              {site.substrate && (
                <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/8">
                  {site.substrate}
                </span>
              )}
              {site.foamSystem && (
                <span className="px-2 py-1 rounded-lg bg-orange/10 border border-orange/20 text-orange/80">
                  {site.foamSystem.manufacturer} {site.foamSystem.product}
                </span>
              )}
            </div>
          </div>
          <span
            className={`shrink-0 text-[10.5px] font-semibold uppercase tracking-[0.12em] px-2.5 py-1 rounded-md border ${
              statusColor === "green"
                ? "bg-green-500/10 text-green-300 border-green-500/30"
                : statusColor === "yellow"
                ? "bg-yellow-500/10 text-yellow-300 border-yellow-500/30"
                : "bg-blue-500/10 text-blue-300 border-blue-500/30"
            }`}
            title="Status changes at end-of-day close-out"
          >
            {site.status.replace(/_/g, " ")}
          </span>
        </div>

        {/* Status badge moved to top-right pill above; status changes happen at end-of-day close-out */}
      </motion.div>

      <div className="gradient-divider" />

      {/* Stats row */}
      <motion.div variants={item} className="grid grid-cols-3 gap-4">
        <div className="glass-card result-card-hover p-4">
          <div className="text-xs text-white/40 uppercase tracking-wider">Sets Sprayed</div>
          <div className="text-2xl font-light text-orange mt-1 metric-value result-glow">{site.totalSets.toFixed(1)}</div>
          {site.estimatedSets && (
            <div className="text-xs text-white/30 mt-0.5">of {site.estimatedSets} est.</div>
          )}
        </div>
        <div className="glass-card result-card-hover p-4">
          <div className="text-xs text-white/40 uppercase tracking-wider">Board Feet</div>
          <div className="text-2xl font-light text-white mt-1 metric-value result-glow">{Math.round(site.totalBF).toLocaleString()}</div>
        </div>
        <div className="glass-card result-card-hover p-4">
          <div className="text-xs text-white/40 uppercase tracking-wider">Days Worked</div>
          <div className="text-2xl font-light text-white mt-1 metric-value result-glow">{site.daysWorked}</div>
        </div>
      </motion.div>

      {/* Progress bar with scale-pop percentage */}
      {computed.progressPct !== null && (
        <motion.div variants={item} className="glass-card p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-white/40 uppercase tracking-wider">Progress</span>
            <motion.span
              key={computed.progressPct.toFixed(0)}
              initial={{ scale: 1.03 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="text-sm text-white font-medium metric-value"
            >
              {computed.progressPct.toFixed(0)}%
            </motion.span>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${computed.progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${
                computed.progressPct >= 100
                  ? "bg-gradient-to-r from-green-500 to-green-400"
                  : computed.progressPct >= 75
                  ? "bg-gradient-to-r from-orange to-orange-light"
                  : "bg-gradient-to-r from-blue to-blue-light"
              }`}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-white/30">
            <span>{site.totalSets.toFixed(1)} sets</span>
            <span>{site.estimatedSets} sets estimated</span>
          </div>
        </motion.div>
      )}

      <div className="gradient-divider" />

      {/* Job Cost Summary — admin/owner-only; installers don't see material cost */}
      {showCost && computed.estimatedCost !== null && (
        <motion.div variants={item} className="glass-card result-card-hover p-5 border-l-2 border-l-orange/40">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Estimated Material Cost</div>
          <div className="text-2xl font-light text-orange metric-value result-glow">
            ${computed.estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-white/30 mt-1">
            {(site.estimatedSets || site.totalSets).toFixed(1)} sets &times; ${DEFAULT_COST_PER_SET.toLocaleString()}/set
          </div>
        </motion.div>
      )}

      {/* Total Gallons input — appears when complete */}
      <AnimatePresence>
        {site.status === "complete" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-5 space-y-3 border-l-2 border-l-blue/40">
              <div className="text-xs text-white/40 uppercase tracking-wider">Completion Data</div>
              <div className="section-divider" />
              <div>
                <label className="block text-[10px] text-white/30 mb-1">Total Gallons Sprayed (entire job)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={gallonsInput}
                    onChange={(e) => setGallonsInput(e.target.value)}
                    placeholder="e.g., 1200"
                    className="input-field input-glow flex-1"
                  />
                  <motion.button
                    onClick={saveTotalGallons}
                    disabled={savingGallons}
                    whileTap={{ scale: 0.93 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-orange text-white hover:bg-orange-light disabled:opacity-50 transition-all"
                  >
                    {savingGallons ? "Saving..." : "Save"}
                  </motion.button>
                </div>
                <p className="text-[10px] text-white/20 mt-1">
                  Enter total gallons to calculate actual BF and yield efficiency.
                </p>
              </div>

              {/* Yield results — shown when totalGallons is saved */}
              {site.totalGallons && site.totalGallons > 0 && (
                <>
                  <div className="gradient-divider" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider">Total Gallons</div>
                      <div className="text-lg font-light text-white mt-1 metric-value result-glow">
                        {site.totalGallons.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider">Total Board Feet</div>
                      <div className="text-lg font-light text-white mt-1 metric-value result-glow">
                        {Math.round(site.totalBF).toLocaleString()}
                      </div>
                    </div>
                    {computed.actualYieldBF !== null && (
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                        <div className="text-[10px] text-white/40 uppercase tracking-wider">Actual Yield</div>
                        <div className="text-lg font-light text-orange mt-1 metric-value result-glow">
                          {Math.round(computed.actualYieldBF).toLocaleString()} bf/set
                        </div>
                      </div>
                    )}
                    {computed.yieldEfficiency !== null && (
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                        <div className="text-[10px] text-white/40 uppercase tracking-wider">Yield Efficiency</div>
                        <div className={`text-lg font-light mt-1 metric-value result-glow ${
                          computed.yieldEfficiency >= 85
                            ? "text-green-400"
                            : computed.yieldEfficiency >= 70
                            ? "text-orange"
                            : "text-red-400"
                        }`}>
                          {Math.round(computed.yieldEfficiency)}%
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="section-divider" />

      {/* Log Today's Work CTA */}
      <motion.div variants={item}>
        <motion.button
          onClick={() => onLogWork(site)}
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="w-full glass-card result-card-hover px-6 py-4 flex items-center gap-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-orange/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-white font-medium">Log Today&apos;s Work</div>
            <div className="text-xs text-white/40">Track sets, gallons, and conditions</div>
          </div>
        </motion.button>
      </motion.div>

      <div className="gradient-divider" />

      {/* Daily Logs */}
      <motion.div variants={item} className="glass-card p-6">
        <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
          Daily Logs ({site.dailyLogs.length})
        </h2>
        {site.dailyLogs.length === 0 ? (
          <div className="text-white/30 text-sm py-6 text-center">
            No daily logs yet. Tap &quot;Log Today&apos;s Work&quot; to start.
          </div>
        ) : (
          <div className="space-y-2">
            {site.dailyLogs.map((log) => {
              const probs = Array.isArray(log.problems) ? log.problems.filter((p: string) => p && p !== "None") : [];
              return (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-white/3 border border-white/5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-white font-medium">
                        {new Date(log.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">
                        {log.setsUsed ? `${log.setsUsed} set(s)` : ""}
                        {log.boardFeet ? ` \u00b7 ${Math.round(log.boardFeet).toLocaleString()} bf` : ""}
                        {log.yieldActual ? ` \u00b7 ${Math.round(log.yieldActual).toLocaleString()} bf/set` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Weather pills */}
                      {log.ambientTemp !== null && log.ambientTemp !== undefined && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan/10 text-cyan/80 whitespace-nowrap">
                          {Math.round(log.ambientTemp)}&deg;F
                        </span>
                      )}
                      {log.humidity !== null && log.humidity !== undefined && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue/10 text-blue/80 whitespace-nowrap">
                          {Math.round(log.humidity)}% RH
                        </span>
                      )}
                      {log.rating && (
                        <div className="text-xs text-orange">
                          {"\u2605".repeat(log.rating)}{"\u2606".repeat(5 - log.rating)}
                        </div>
                      )}
                    </div>
                  </div>
                  {probs.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {probs.map((p: string) => (
                        <span
                          key={p}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Photos */}
                  {Array.isArray(log.photos) && log.photos.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto">
                      {log.photos.map((photo: string, idx: number) => (
                        // eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo from dynamic URL
                        <img
                          key={idx}
                          src={photo}
                          alt={`Job photo ${idx + 1}`}
                          className="w-16 h-16 rounded-lg object-cover border border-white/10 shrink-0 cursor-pointer hover:border-orange/40 transition-all"
                          onClick={() => window.open(photo, "_blank")}
                        />
                      ))}
                    </div>
                  )}
                  {log.notes && (
                    <p className="text-xs text-white/30 mt-1.5 italic">{log.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Notes */}
      {site.notes && (
        <>
          <div className="section-divider" />
          <motion.div variants={item} className="glass-card p-6">
            <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">
              Site Notes
            </h2>
            <p className="text-sm text-white/60 whitespace-pre-wrap">{site.notes}</p>
          </motion.div>
        </>
      )}

      {/* Site actions — manual status overrides + delete */}
      <div className="section-divider" />
      <motion.div variants={item} className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">
          Site actions
        </h2>
        <p className="text-[11px] text-white/40 leading-relaxed">
          Status normally changes when you close out a daily log. Use these only to manually override.
        </p>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateStatus(opt.value)}
              disabled={updating || site.status === opt.value}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium border transition-colors disabled:opacity-50 ${
                site.status === opt.value
                  ? opt.color === "green"
                    ? "border-green-500/30 bg-green-500/10 text-green-300"
                    : opt.color === "yellow"
                    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                    : "border-blue-500/30 bg-blue-500/10 text-blue-300"
                  : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="w-full sm:w-auto px-4 py-2 rounded-md text-[12px] font-medium bg-red-500/[0.08] text-red-400/90 border border-red-500/20 hover:bg-red-500/[0.12] disabled:opacity-50 transition-colors"
          >
            Delete site
          </button>
          <p className="mt-2 text-[11px] text-white/40 leading-relaxed">
            Delete removes the site permanently. Daily log records are preserved (no production data lost).
          </p>
        </div>
      </motion.div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !deleting && setShowDeleteConfirm(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0c1018] p-6"
            >
              <h3 className="text-base font-semibold text-white">Delete this site?</h3>
              <p className="mt-2 text-sm text-white/60 leading-relaxed">
                <strong className="text-white">{site.name}</strong> will be removed.
                {site.daysWorked > 0 ? (
                  <>
                    {" "}The {site.daysWorked} daily log{site.daysWorked === 1 ? "" : "s"} will stay in the database (you&apos;ll find them in dashboard history) but won&apos;t be linked to a site anymore.
                  </>
                ) : (
                  " No daily logs are attached, so nothing else will change."
                )}
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/[0.04] text-white/70 border border-white/10 hover:bg-white/[0.06] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={deleteSite}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/25 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
