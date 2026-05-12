"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateDewPoint } from "@/lib/foam-calc";

interface FoamSystem {
  id: string;
  manufacturer: string;
  product: string;
  type: string;
  yieldPerSet: number;
}

interface JobSiteOption {
  id: string;
  name: string;
  address: string | null;
  jobType: string | null;
  substrate: string | null;
  foamSystemId: string | null;
  foamSystem: { id: string; product: string; manufacturer: string } | null;
  status: string;
}

export interface JobLoggerPreFill {
  jobSiteId: string;
  location: string;
  substrate: string;
  jobType: string;
  foamSystemId: string;
}

// Resume mode: passed when "Close out day" is tapped on an in-progress job.
// Carries every value already on file so Jason only edits what changed.
// Submission PATCHes the existing job rather than creating a new one.
export interface JobLoggerResume {
  jobId: string;
  jobSiteId: string;
  location: string;
  substrate: string;
  jobType: string;
  foamSystemId: string;
  chamberSize: string;
  ambientTemp: string;
  substrateTemp: string;
  humidity: string;
  hoseTempA: string;
  hoseTempB: string;
  drumTempA: string;
  drumTempB: string;
  pressureA: string;
  pressureB: string;
  notes: string;
}

const JOB_TYPES = [
  { id: "metal_building", label: "Metal Building" },
  { id: "underfloor", label: "Underfloor/Crawlspace" },
  { id: "stemwall", label: "Stemwall" },
  { id: "new_construction", label: "New Construction (Wood)" },
  { id: "retrofit", label: "Retrofit (Wood)" },
  { id: "mixed", label: "Mixed" },
];

const PROBLEM_OPTIONS = [
  "Tacky/Sticky",
  "Low Yield",
  "Fisheyes",
  "Delamination",
  "Off-Ratio",
  "Sagging",
  "Slow Rise",
  "Shrinkage",
  "None",
];

const GALLONS_PER_SET = 48; // 1 set = 48 gallons (one side consumed)

export default function JobLogger({
  onNavigate,
  preFill,
  resume,
}: {
  onNavigate: (page: string) => void;
  preFill?: JobLoggerPreFill | null;
  resume?: JobLoggerResume | null;
}) {
  const isResume = !!resume;
  const [foamSystems, setFoamSystems] = useState<FoamSystem[]>([]);
  const [activeSites, setActiveSites] = useState<JobSiteOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  // Resume mode: how the site's overall status should be updated when this
  // EOD log saves. Default = "in_progress" (returning tomorrow).
  const [siteEndStatus, setSiteEndStatus] = useState<"in_progress" | "on_hold" | "complete">("in_progress");
  // Phase: morning / midday / eod. Defaults based on entry context — fresh
  // log = morning, "Close out day" resume = eod. User can manually switch.
  const [phase, setPhase] = useState<"morning" | "midday" | "eod">(isResume ? "eod" : "morning");
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [showSitePicker, setShowSitePicker] = useState(!preFill);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recommendation, setRecommendation] = useState<any>(null);
  const [recLoading, setRecLoading] = useState(false);
  const [recFetched, setRecFetched] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [weatherSource, setWeatherSource] = useState<{ source: string; location: string } | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    location: resume?.location || preFill?.location || "",
    foamSystemId: resume?.foamSystemId || preFill?.foamSystemId || "",
    jobType: resume?.jobType || preFill?.jobType || "",
    jobSiteId: resume?.jobSiteId || preFill?.jobSiteId || "",
    substrate: resume?.substrate || preFill?.substrate || "",
    // Production (resume mode = EOD, user fills these in now)
    setsUsed: "",
    gallonsOneSide: "",
    // Conditions — pre-fill from morning if resuming
    ambientTemp: resume?.ambientTemp || "",
    substrateTemp: resume?.substrateTemp || "",
    humidity: resume?.humidity || "",
    // Equipment — pre-fill from morning if resuming, user updates final values
    chamberSize: resume?.chamberSize || "",
    hoseTempA: resume?.hoseTempA || "",
    hoseTempB: resume?.hoseTempB || "",
    drumTempA: resume?.drumTempA || "",
    drumTempB: resume?.drumTempB || "",
    pressureA: resume?.pressureA || "",
    pressureB: resume?.pressureB || "",
    // Quality
    rating: 0,
    problems: [] as string[],
    notes: resume?.notes || "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/foam-systems").then((r) => r.json()),
      fetch("/api/job-sites?status=in_progress").then((r) => r.json()).catch(() => ({ success: false, data: [] })),
    ]).then(([foamData, sitesData]) => {
      if (foamData.success) setFoamSystems(foamData.data);
      if (sitesData.success) setActiveSites(sitesData.data);
    });
  }, []);

  const update = useCallback(
    (field: string, value: string | number | string[]) => {
      setForm((f) => ({ ...f, [field]: value }));
    },
    []
  );

  function selectSite(site: JobSiteOption) {
    setForm((f) => ({
      ...f,
      jobSiteId: site.id,
      location: site.name + (site.address ? ` - ${site.address}` : ""),
      jobType: site.jobType || f.jobType,
      substrate: site.substrate || f.substrate,
      foamSystemId: site.foamSystemId || f.foamSystemId,
    }));
    setShowSitePicker(false);
  }

  function clearSite() {
    setForm((f) => ({ ...f, jobSiteId: "" }));
    setShowSitePicker(true);
  }

  function toggleProblem(p: string) {
    setForm((f) => {
      if (p === "None") return { ...f, problems: f.problems.includes("None") ? [] : ["None"] };
      const without = f.problems.filter((x) => x !== "None");
      return {
        ...f,
        problems: without.includes(p)
          ? without.filter((x) => x !== p)
          : [...without, p],
      };
    });
  }

  // Photo handling
  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const remaining = 5 - photos.length;
    const toProcess = Array.from(files).slice(0, remaining);
    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotos((prev) => (prev.length < 5 ? [...prev, base64] : prev));
      };
      reader.readAsDataURL(file);
    });
    // Reset input so re-selecting the same file triggers onChange
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  // Real-time calculations — sets ↔ gallons conversion only
  // Gallons-only since the sets-vs-gallons toggle was removed; user enters
  // gallons sprayed (one drum side) and we compute sets behind the scenes.
  const calcs = useMemo(() => {
    const gallonsOne = parseFloat(form.gallonsOneSide);
    let effectiveSets: number | null = null;
    let totalGallons: number | null = null;
    if (!isNaN(gallonsOne) && gallonsOne > 0) {
      totalGallons = gallonsOne * 2;
      effectiveSets = gallonsOne / GALLONS_PER_SET;
    }
    return { effectiveSets, totalGallons };
  }, [form.gallonsOneSide]);

  // Dew point
  const dewPoint = useMemo(() => {
    const amb = parseFloat(form.ambientTemp);
    const rh = parseFloat(form.humidity);
    if (isNaN(amb) || isNaN(rh)) return null;
    return calculateDewPoint(amb, rh);
  }, [form.ambientTemp, form.humidity]);

  const substrateMargin = useMemo(() => {
    const sub = parseFloat(form.substrateTemp);
    if (isNaN(sub) || dewPoint === null) return null;
    return sub - dewPoint;
  }, [form.substrateTemp, dewPoint]);

  // Auto-fetch recommendations when conditions are filled
  useEffect(() => {
    if (recFetched || recLoading) return;
    const amb = parseFloat(form.ambientTemp);
    const rh = parseFloat(form.humidity);
    if (isNaN(amb) || isNaN(rh)) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecLoading(true);
    setRecFetched(true);
    fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ambientTemp: amb,
        humidity: rh,
        substrate: form.substrate || undefined,
        jobType: form.jobType || undefined,
        foamSystemId: form.foamSystemId || undefined,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setRecommendation(data.data);
      })
      .catch(() => {})
      .finally(() => setRecLoading(false));
  }, [form.ambientTemp, form.humidity, form.substrate, form.jobType, form.foamSystemId, recFetched, recLoading]);

  // Reset recommendation when conditions change significantly
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecFetched(false);
    setRecommendation(null);
  }, [form.ambientTemp, form.humidity]);

  function applyRecommendation() {
    if (!recommendation) return;
    setForm((f) => ({
      ...f,
      hoseTempA: recommendation.hoseTempA != null ? String(Math.round(recommendation.hoseTempA)) : f.hoseTempA,
      hoseTempB: recommendation.hoseTempB != null ? String(Math.round(recommendation.hoseTempB)) : f.hoseTempB,
      drumTempA: recommendation.drumTempA != null ? String(Math.round(recommendation.drumTempA)) : f.drumTempA,
      drumTempB: recommendation.drumTempB != null ? String(Math.round(recommendation.drumTempB)) : f.drumTempB,
      pressureA: recommendation.pressureA != null ? String(Math.round(recommendation.pressureA)) : f.pressureA,
      pressureB: recommendation.pressureB != null ? String(Math.round(recommendation.pressureB)) : f.pressureB,
    }));
  }

  const linkedSite = activeSites.find((s) => s.id === form.jobSiteId);

  // Auto-fill weather
  async function autoFillWeather() {
    setWeatherLoading(true);
    try {
      // If linked site has an address, use it for location-specific weather
      const siteAddress = linkedSite?.address;
      const url = siteAddress
        ? `/api/weather?location=${encodeURIComponent(siteAddress)}`
        : "/api/weather";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        const w = data.data;
        setForm((f) => ({
          ...f,
          ambientTemp: String(w.temp),
          humidity: String(w.humidity),
        }));
        setWeatherSource({ source: w.source, location: w.location });
      }
    } catch {
      // Silently fail
    } finally {
      setWeatherLoading(false);
    }
  }

  async function handleSubmit(phase: "morning" | "complete" = "complete") {
    setSaving(true);
    try {
      const setsVal = calcs.effectiveSets;

      // Resume mode: PATCH the existing in-progress job to close it out.
      // Otherwise: POST a new job (morning or complete).
      const url = isResume && resume ? `/api/jobs/${resume.jobId}` : "/api/jobs";
      const method = isResume ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase,
          // Only sent in resume mode; the API uses it to update site status too
          siteEndStatus: isResume ? siteEndStatus : undefined,
          date: form.date,
          location: form.location,
          foamSystemId: form.foamSystemId || null,
          foamBrand: null,
          jobType: form.jobType || null,
          jobSiteId: form.jobSiteId || null,
          chamberSize: form.chamberSize || null,
          setsUsed: setsVal ?? null,
          gallonsASide: calcs.totalGallons ? calcs.totalGallons / 2 : null,
          gallonsBSide: calcs.totalGallons ? calcs.totalGallons / 2 : null,
          gallonsTotal: calcs.totalGallons ?? null,
          ambientTemp: form.ambientTemp || null,
          substrateTemp: form.substrateTemp || null,
          humidity: form.humidity || null,
          hoseTempA: form.hoseTempA || null,
          hoseTempB: form.hoseTempB || null,
          drumTempA: form.drumTempA || null,
          drumTempB: form.drumTempB || null,
          pressureA: form.pressureA || null,
          pressureB: form.pressureB || null,
          rating: form.rating || null,
          problems: form.problems.filter((p) => p !== "None"),
          notes: form.notes || null,
          photos: photos.length > 0 ? photos : [],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => {
          if (form.jobSiteId) {
            onNavigate("site-detail:" + form.jobSiteId);
          } else {
            onNavigate("dashboard");
          }
        }, 1500);
      }
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl text-white font-medium">Job Logged</h2>
        <p className="text-sm text-white/40 mt-1">
          {form.jobSiteId ? "Returning to job site..." : "Redirecting to dashboard..."}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { staggerChildren: 0.12 } }}
      className="max-w-2xl mx-auto space-y-4 pb-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl text-white font-medium">Log Job</h1>
          <p className="text-xs text-white/40 mt-0.5">
            {linkedSite ? `Logging to: ${linkedSite.name}` : "Pick a job site below"}
          </p>
        </div>
        <input
          type="date"
          value={form.date}
          onChange={(e) => update("date", e.target.value)}
          className="input-field w-auto text-sm"
        />
      </div>

      {/* Phase toggle — Morning / Midday / EOD */}
      <div className="glass-card p-1.5">
        <div className="grid grid-cols-3 gap-1">
          {(
            [
              { value: "morning", label: "Morning log", hint: "Start of day" },
              { value: "midday", label: "Midday update", hint: "Mid-day events" },
              { value: "eod", label: "End of day", hint: "Close out + production" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPhase(opt.value)}
              className={`py-2.5 rounded-xl text-[12px] font-medium transition-all ${
                phase === opt.value
                  ? "bg-orange/15 text-orange-light border border-orange/30"
                  : "text-white/50 hover:text-white border border-transparent"
              }`}
            >
              <div className="font-semibold">{opt.label}</div>
              <div className="text-[10px] opacity-70 mt-0.5">{opt.hint}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Job Site Picker (when launched fresh) */}
      {!preFill && showSitePicker && activeSites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="glass-card p-4"
        >
          <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Link to Job Site</label>
          <div className="space-y-2">
            {activeSites.map((site) => (
              <button
                key={site.id}
                onClick={() => selectSite(site)}
                className="w-full p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/8 transition-all text-left flex items-center justify-between"
              >
                <div>
                  <div className="text-sm text-white font-medium">{site.name}</div>
                  {site.address && (
                    <div className="text-xs text-white/30">{site.address}</div>
                  )}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                  Active
                </span>
              </button>
            ))}
            <button
              onClick={() => setShowSitePicker(false)}
              className="w-full p-2 text-xs text-white/30 hover:text-white/50 transition-colors text-center"
            >
              Skip - log without a site
            </button>
          </div>
        </motion.div>
      )}

      {/* Linked site badge */}
      {linkedSite && !showSitePicker && (
        <div className="glass-card p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-white/70">{linkedSite.name}</span>
          </div>
          <button
            onClick={clearSite}
            className="text-[10px] text-white/30 hover:text-white/50 transition-colors"
          >
            Change
          </button>
        </div>
      )}

      {/* Location — read-only when site is linked, editable only when no site */}
      {!linkedSite && (
        <div className="glass-card p-4">
          <label className="block text-[10px] text-white/30 mb-1 uppercase tracking-wider">
            Location
          </label>
          <input
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="Job location (e.g., Tulsa Hills common wall)"
            className="input-field"
          />
        </div>
      )}

      {/* Job Type Chips — visible in morning + EOD; not midday */}
      {phase !== "midday" && (
        <div className="glass-card p-4">
          <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Job Type</label>
          <div className="flex flex-wrap gap-2">
            {JOB_TYPES.map((jt) => (
              <button
                key={jt.id}
                onClick={() => update("jobType", form.jobType === jt.id ? "" : jt.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  form.jobType === jt.id
                    ? "bg-orange/20 text-orange border border-orange/30"
                    : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                }`}
              >
                {jt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Foam System — always visible in morning + EOD */}
      {phase !== "midday" && (
        <div className="glass-card p-4">
          <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Foam System</label>
          <select
            value={form.foamSystemId}
            onChange={(e) => update("foamSystemId", e.target.value)}
            className="input-field text-sm"
          >
            <option value="">Select foam system</option>
            {foamSystems.map((f) => (
              <option key={f.id} value={f.id}>
                {f.manufacturer} {f.product} ({f.type === "closed_cell" ? "CC" : "OC"})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Production — EOD only, gallons-only input (system converts to sets) */}
      {phase === "eod" && (
        <div className="glass-card p-4 space-y-3">
          <label className="text-xs text-white/40 uppercase tracking-wider">Production</label>
          <div>
            <label className="block text-[10px] text-white/30 mb-1">Gallons Sprayed (one side)</label>
            <input
              type="number"
              inputMode="decimal"
              value={form.gallonsOneSide}
              onChange={(e) => update("gallonsOneSide", e.target.value)}
              placeholder="48"
              className="input-field input-glow text-lg"
            />
            <p className="text-[10px] text-white/30 mt-1">A+B combined and sets calculated automatically</p>
          </div>

          {/* Auto-calc readout */}
          <AnimatePresence>
            {(calcs.totalGallons || calcs.effectiveSets) && (
              <motion.div
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                className="p-3 rounded-xl bg-white/3 border border-white/8 space-y-1.5 text-sm"
              >
                {calcs.totalGallons != null && (
                  <div className="flex justify-between">
                    <span className="text-white/40">Total A+B Combined</span>
                    <span className="text-white font-medium metric-value">{calcs.totalGallons.toFixed(0)} gal</span>
                  </div>
                )}
                {calcs.effectiveSets != null && (
                  <div className="flex justify-between">
                    <span className="text-white/40">Sets</span>
                    <span className="text-white font-medium metric-value">{calcs.effectiveSets.toFixed(2)}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="gradient-divider" />

      {/* Conditions — visible in morning + EOD; not midday */}
      {phase !== "midday" && (
      <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-white/40 uppercase tracking-wider">Conditions</label>
            <button
              onClick={autoFillWeather}
              disabled={weatherLoading}
              className="text-[10px] px-3 py-1.5 rounded-lg bg-blue/15 text-blue border border-blue/20 hover:bg-blue/25 transition-all disabled:opacity-50"
            >
              {weatherLoading ? "Loading..." : "Auto-fill from weather"}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-white/30 mb-1">Ambient (F)</label>
              <input
                type="number"
                inputMode="numeric"
                value={form.ambientTemp}
                onChange={(e) => update("ambientTemp", e.target.value)}
                placeholder="70"
                className="input-field input-glow"
              />
            </div>
            <div>
              <label className="block text-[10px] text-white/30 mb-1">Substrate (F)</label>
              <input
                type="number"
                inputMode="numeric"
                value={form.substrateTemp}
                onChange={(e) => update("substrateTemp", e.target.value)}
                placeholder="65"
                className="input-field input-glow"
              />
            </div>
            <div>
              <label className="block text-[10px] text-white/30 mb-1">Humidity (%)</label>
              <input
                type="number"
                inputMode="numeric"
                value={form.humidity}
                onChange={(e) => update("humidity", e.target.value)}
                placeholder="50"
                className="input-field input-glow"
              />
            </div>
          </div>

          {/* Weather source info */}
          {weatherSource && (
            <div className="text-[10px] text-white/30">
              Weather from {weatherSource.source === "open-meteo" ? "Open-Meteo" : "estimated data"} for {weatherSource.location}
            </div>
          )}

          {/* Dew point readout */}
          {dewPoint != null && (
            <div className="flex items-center gap-4 p-2.5 rounded-lg bg-white/3 text-sm">
              <div className="flex-1 flex justify-between">
                <span className="text-white/40">Dew Point</span>
                <span className="text-white">{dewPoint.toFixed(1)}F</span>
              </div>
              {substrateMargin != null && (
                <div className="flex-1 flex justify-between">
                  <span className="text-white/40">Margin</span>
                  <span className={`font-medium ${
                    substrateMargin < 10 ? "text-red-400" : substrateMargin < 15 ? "text-yellow-400" : "text-green-400"
                  }`}>
                    {substrateMargin.toFixed(1)}F {substrateMargin < 10 ? "RISK" : substrateMargin < 15 ? "TIGHT" : "OK"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recommended Settings — visible in morning + EOD when conditions known */}
      {phase !== "midday" && (recommendation || recLoading) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 border-l-4 border-l-blue"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              <label className="text-xs text-blue uppercase tracking-wider font-medium">Recommended Settings</label>
            </div>
            {recommendation && (
              <button
                onClick={applyRecommendation}
                className="text-[10px] px-3 py-1.5 rounded-lg bg-blue/15 text-blue border border-blue/20 hover:bg-blue/25 transition-all font-medium"
              >
                Apply
              </button>
            )}
          </div>
          {recLoading ? (
            <div className="text-sm text-white/30 py-2">Analyzing conditions...</div>
          ) : recommendation ? (
            <>
              <p className="text-xs text-white/40 mb-3">{recommendation.context}</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="p-2 rounded-lg bg-white/3">
                  <div className="text-[10px] text-white/30">Hose A</div>
                  <div className="text-white font-medium">{recommendation.hoseTempA != null ? `${Math.round(recommendation.hoseTempA)}F` : "-"}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/3">
                  <div className="text-[10px] text-white/30">Hose B</div>
                  <div className="text-white font-medium">{recommendation.hoseTempB != null ? `${Math.round(recommendation.hoseTempB)}F` : "-"}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/3">
                  <div className="text-[10px] text-white/30">Drum A</div>
                  <div className="text-white font-medium">{recommendation.drumTempA != null ? `${Math.round(recommendation.drumTempA)}F` : "-"}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/3">
                  <div className="text-[10px] text-white/30">Drum B</div>
                  <div className="text-white font-medium">{recommendation.drumTempB != null ? `${Math.round(recommendation.drumTempB)}F` : "-"}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/3">
                  <div className="text-[10px] text-white/30">PSI A</div>
                  <div className="text-white font-medium">{recommendation.pressureA != null ? `${Math.round(recommendation.pressureA)}` : "-"}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/3">
                  <div className="text-[10px] text-white/30">PSI B</div>
                  <div className="text-white font-medium">{recommendation.pressureB != null ? `${Math.round(recommendation.pressureB)}` : "-"}</div>
                </div>
              </div>
              {recommendation.source === "historical" && recommendation.matchedYield != null && (
                <div className="mt-2 text-[10px] text-white/30">
                  That job yielded {Math.round(recommendation.matchedYield).toLocaleString()} bf/set
                </div>
              )}
            </>
          ) : null}
        </motion.div>
      )}

      {/* Equipment readings — REQUIRED in morning + EOD, always visible (no collapse) */}
      {phase !== "midday" && (
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-white/40 uppercase tracking-wider">Equipment Readings</label>
            <span className="text-[10px] text-orange/80">Required</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[10px] text-white/30 mb-1">Probler Chamber Size</label>
              <input
                type="number"
                inputMode="numeric"
                value={form.chamberSize}
                onChange={(e) => update("chamberSize", e.target.value)}
                placeholder="4747"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-[10px] text-white/30 mb-1">Hose Temp A (F)</label>
              <input type="number" inputMode="numeric" value={form.hoseTempA} onChange={(e) => update("hoseTempA", e.target.value)} placeholder="145" className="input-field" />
            </div>
            <div>
              <label className="block text-[10px] text-white/30 mb-1">Hose Temp B (F)</label>
              <input type="number" inputMode="numeric" value={form.hoseTempB} onChange={(e) => update("hoseTempB", e.target.value)} placeholder="145" className="input-field" />
            </div>
            <div>
              <label className="block text-[10px] text-white/30 mb-1">Drum Temp A (F)</label>
              <input type="number" inputMode="numeric" value={form.drumTempA} onChange={(e) => update("drumTempA", e.target.value)} placeholder="70" className="input-field" />
            </div>
            <div>
              <label className="block text-[10px] text-white/30 mb-1">Drum Temp B (F)</label>
              <input type="number" inputMode="numeric" value={form.drumTempB} onChange={(e) => update("drumTempB", e.target.value)} placeholder="70" className="input-field" />
            </div>
            <div>
              <label className="block text-[10px] text-white/30 mb-1">Pressure A (psi)</label>
              <input type="number" inputMode="numeric" value={form.pressureA} onChange={(e) => update("pressureA", e.target.value)} placeholder="1100" className="input-field" />
            </div>
            <div>
              <label className="block text-[10px] text-white/30 mb-1">Pressure B (psi)</label>
              <input type="number" inputMode="numeric" value={form.pressureB} onChange={(e) => update("pressureB", e.target.value)} placeholder="1100" className="input-field" />
            </div>
          </div>
        </div>
      )}

      {phase !== "midday" && <div className="gradient-divider" />}

      {/* Photos — visible in morning + EOD */}
      {phase !== "midday" && (
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs text-white/40 uppercase tracking-wider">Photos</label>
          <span className="text-[10px] text-white/20">{photos.length}/5</span>
        </div>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoSelect}
          className="hidden"
        />
        {photos.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo from dynamic URL */}
                <img
                  src={photo}
                  alt={`Photo ${idx + 1}`}
                  className="w-16 h-16 rounded-lg object-cover border border-white/10"
                />
                <button
                  onClick={() => removePhoto(idx)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
        {photos.length < 5 && (
          <button
            onClick={() => photoInputRef.current?.click()}
            className="w-full py-2.5 rounded-xl border border-dashed border-white/15 text-sm text-white/40 hover:bg-white/5 hover:text-white/60 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            Add Photo
          </button>
        )}
      </div>
      )}

      {/* Quality \u2014 END OF DAY ONLY */}
      {phase === "eod" && (
      <>
        <div className="section-divider" />
        <div className="glass-card p-4 space-y-3">
          <label className="block text-xs text-white/40 uppercase tracking-wider">Quality</label>

          {/* Star rating */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-white/30 mr-2">Rating</span>
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => update("rating", form.rating === v ? 0 : v)}
                className={`star-button text-2xl transition-all ${
                  v <= form.rating ? "text-orange" : "text-white/20"
                }`}
              >
                {v <= form.rating ? "\u2605" : "\u2606"}
              </button>
            ))}
          </div>

          {/* Problem chips */}
          <div>
            <span className="block text-[10px] text-white/30 mb-1.5">Problems</span>
            <div className="flex flex-wrap gap-1.5">
              {PROBLEM_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => toggleProblem(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                    form.problems.includes(p)
                      ? p === "None"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </>
      )}

      {/* Notes \u2014 visible in morning + EOD */}
      {phase !== "midday" && (
      <div className="glass-card p-4">
        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
          className="input-field resize-none text-sm"
        />
      </div>
      )}

      {/* Midday phase content \u2014 pointer to dashboard event flow */}
      {phase === "midday" && (
        <div className="glass-card p-6 text-center space-y-3">
          <div className="text-base text-white/80 font-medium">Midday updates happen on the dashboard</div>
          <p className="text-[13px] text-white/50 leading-relaxed max-w-md mx-auto">
            Open the dashboard. The active job shows an orange &quot;In progress&quot; card with an{" "}
            <strong className="text-white">+ Add event</strong> button \u2014 log temp changes, pressure changes, problems, or quick notes there. Each event is timestamped and rolls up to this job&apos;s history.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-orange/15 text-orange-light border border-orange/30 hover:bg-orange/20 transition-colors"
          >
            Go to dashboard
          </button>
        </div>
      )}

      {/* Save Buttons — context-aware */}
      {phase === "eod" ? (
        <div className="space-y-3">
          {/* Day-end picker — what's the SITE status after this log? */}
          <div className="glass-card p-4 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
              How did the day end?
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: "in_progress", label: "Returning tomorrow", color: "green", hint: "Day done, coming back" },
                  { value: "on_hold", label: "Pausing for a while", color: "yellow", hint: "Not back tomorrow, will return" },
                  { value: "complete", label: "Project finished", color: "blue", hint: "Whole job done, not returning" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSiteEndStatus(opt.value)}
                  className={`py-2.5 px-2 rounded-xl text-[11.5px] font-medium border transition-colors ${
                    siteEndStatus === opt.value
                      ? opt.color === "green"
                        ? "border-green-500/40 bg-green-500/10 text-green-300"
                        : opt.color === "yellow"
                        ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-300"
                        : "border-blue-500/40 bg-blue-500/10 text-blue-300"
                      : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="font-semibold">{opt.label}</div>
                  <div className="mt-0.5 text-[10px] opacity-70">{opt.hint}</div>
                </button>
              ))}
            </div>
          </div>
          <motion.button
            onClick={() => handleSubmit("complete")}
            disabled={saving || !form.location || !form.date}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="w-full py-4 rounded-2xl text-base font-medium bg-orange text-white hover:bg-orange-light disabled:opacity-50 transition-all shadow-lg shadow-orange/20"
            title="Save EOD data and update site status."
          >
            {saving ? "Closing out..." : "Close out day"}
          </motion.button>
        </div>
      ) : phase === "morning" ? (
        <motion.button
          onClick={() => handleSubmit("morning")}
          disabled={saving || !form.location || !form.date}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="w-full py-4 rounded-2xl text-base font-medium bg-orange text-white hover:bg-orange-light disabled:opacity-50 transition-all shadow-lg shadow-orange/20"
          title="Save morning conditions. Add events through the day, close out at EOD."
        >
          {saving ? "Saving..." : "Save morning"}
        </motion.button>
      ) : null /* midday phase has no save button — events save through the dashboard event form */}
    </motion.div>
  );
}
