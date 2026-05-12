"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getDialInRecommendation,
  SUBSTRATE_OFFSETS,
  estimateSubstrate,
  type FoamSystemKey,
  type SubstrateType,
} from "@/lib/foam-calc";

// --- Types ---

interface ActiveJobSite {
  id: string;
  name: string;
  address: string | null;
  foamSystemId: string | null;
  foamSystemType: string | null;
}

type ShiftTime = "morning" | "afternoon";

interface HistoricalMatch {
  date: string;
  rating: number;
  yieldActual: number;
}

// --- Main Component ---

export default function DialInCalculator() {
  const [ambient, setAmbient] = useState(68);
  const [substrate, setSubstrate] = useState(62);
  const [humidity, setHumidity] = useState(50);
  const [foamSystem, setFoamSystem] = useState<FoamSystemKey>("enverge_easyseal");
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [activeJobs, setActiveJobs] = useState<ActiveJobSite[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [activeSource, setActiveSource] = useState<string | null>(null);

  // Feature 1: Substrate type selector
  const [substrateType, setSubstrateType] = useState<SubstrateType | null>(null);

  // Feature 4: Weather conditions badge
  const [weatherConditions, setWeatherConditions] = useState<string | null>(null);
  const [weatherWind, setWeatherWind] = useState<number | null>(null);

  // Feature 5: Historical match
  const [historicalMatch, setHistoricalMatch] = useState<HistoricalMatch | null>(null);
  const [allJobs, setAllJobs] = useState<Array<{
    date: string;
    ambientTemp: number | null;
    humidity: number | null;
    rating: number | null;
    yieldActual: number | null;
    foamSystem: { type: string } | null;
  }>>([]);

  // Feature 6: Shift/time-of-day toggle
  const [shift, setShift] = useState<ShiftTime>(
    new Date().getHours() < 12 ? "morning" : "afternoon"
  );

  // Feature 3: Save & share copied state
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => getDialInRecommendation({ ambient, substrate, humidity, foamSystem }),
    [ambient, substrate, humidity, foamSystem]
  );

  // Feature 1+6: Auto-calc substrate from ambient when substrate type is selected.
  // The user can manually override the calculated value, so this isn't pure
  // derivation (useMemo wouldn't fit) — it's an auto-fill-then-allow-override pattern.
  useEffect(() => {
    if (substrateType) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSubstrate(estimateSubstrate(ambient, substrateType, shift));
    }
  }, [ambient, substrateType, shift]);

  // Persist live conditions to localStorage for diagnostics cross-reference
  useEffect(() => {
    try {
      localStorage.setItem(
        "fd-live-conditions",
        JSON.stringify({
          ambient,
          substrate,
          humidity,
          foamSystem,
          substrateType,
          shift,
          recHoseTemp: result.recHoseTemp,
          recDrumTemp: result.recDrumTemp,
          recPressure: result.recPressure,
          timestamp: Date.now(),
        })
      );
    } catch {}
  }, [ambient, substrate, humidity, foamSystem, substrateType, shift, result.recHoseTemp, result.recDrumTemp, result.recPressure]);

  // Fetch active job sites on mount
  useEffect(() => {
    fetch("/api/job-sites?status=in_progress")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setActiveJobs(
            d.data
              .filter((s: Record<string, unknown>) => s.address)
              .map((s: Record<string, unknown>) => ({
                id: s.id,
                name: s.name,
                address: s.address,
                foamSystemId: s.foamSystemId,
                foamSystemType: (s.foamSystem as Record<string, unknown> | null)?.type ?? null,
              }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setJobsLoading(false));
  }, []);

  // Feature 5: Fetch jobs for historical match
  useEffect(() => {
    fetch("/api/jobs?limit=200")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setAllJobs(d.data);
        }
      })
      .catch(() => {});
  }, []);

  // Feature 5: Find closest historical match when conditions or foam system change
  useEffect(() => {
    const foamType = foamSystem === "accufoam_af1" ? "open_cell" : "closed_cell";
    const match = allJobs.find((job) => {
      if (!job.ambientTemp || !job.humidity || !job.rating || !job.yieldActual) return false;
      if (job.foamSystem?.type !== foamType) return false;
      return (
        Math.abs(job.ambientTemp - ambient) <= 5 &&
        Math.abs(job.humidity - humidity) <= 10
      );
    });
    if (match && match.rating && match.yieldActual) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHistoricalMatch({
        date: new Date(match.date).toLocaleDateString(),
        rating: match.rating,
        yieldActual: Math.round(match.yieldActual),
      });
    } else {
       
      setHistoricalMatch(null);
    }
  }, [ambient, humidity, foamSystem, allJobs]);

  const autoFillWeather = useCallback(async () => {
    setWeatherLoading(true);
    setActiveSource(null);
    setWeatherConditions(null);
    setWeatherWind(null);
    try {
      const res = await fetch("/api/weather");
      const data = await res.json();
      if (data.success) {
        setAmbient(Math.round(data.data.temp));
        setHumidity(Math.round(data.data.humidity));
        setActiveSource(data.data.location || "Current location");
        setWeatherConditions(data.data.conditions || null);
        setWeatherWind(data.data.windSpeed ?? null);
      }
    } catch {
      // Silently fail
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  const dialInFromJob = useCallback(async (job: ActiveJobSite) => {
    setWeatherLoading(true);
    setActiveSource(null);
    setWeatherConditions(null);
    setWeatherWind(null);
    try {
      const res = await fetch(`/api/weather?location=${encodeURIComponent(job.address || "")}`);
      const data = await res.json();
      if (data.success) {
        setAmbient(Math.round(data.data.temp));
        setHumidity(Math.round(data.data.humidity));
        setActiveSource(job.name);
        setWeatherConditions(data.data.conditions || null);
        setWeatherWind(data.data.windSpeed ?? null);
        if (job.foamSystemType === "open_cell") {
          setFoamSystem("accufoam_af1");
        } else if (job.foamSystemType === "closed_cell") {
          setFoamSystem("enverge_easyseal");
        }
      }
    } catch {
      // Silently fail
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  // Feature 3: Copy summary to clipboard
  const copyToClipboard = useCallback(() => {
    const statusLabel =
      result.status === "red" ? "DO NOT SPRAY" : result.status === "yellow" ? "USE CAUTION" : "CONDITIONS OK";
    const date = new Date().toLocaleDateString();
    const summary = `FoamDial Pro - Dial-In Summary
${result.foamSystemName} | ${date}
Conditions: ${ambient}°F / ${humidity}% RH
Substrate: ${substrate}°F (margin: ${result.margin.toFixed(1)}°F)
Status: ${statusLabel}
---
Recommended Settings:
Hose Temp: ${result.recHoseTemp}°F
Drum Temp: ${result.recDrumTemp}°F
Pressure: ${result.recPressure != null ? `${result.recPressure} PSI` : "N/A"}
Max Pass: ${result.maxPassThickness} in
---
Source: ${result.source}`;
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [ambient, humidity, substrate, result]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const item = {
    hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid lg:grid-cols-2 gap-6"
    >
      {/* Controls */}
      <motion.div variants={item} className="glass-card p-6 space-y-6">
        <div>
          <h2 className="text-lg text-white font-medium">
            Dial-In Calculator
          </h2>
          <p className="text-sm text-white/40 mt-1">
            Set site conditions to get recommended baseline settings
          </p>
        </div>

        {/* Foam system toggle */}
        <div className="flex gap-2">
          <motion.button
            onClick={() => setFoamSystem("enverge_easyseal")}
            whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              foamSystem === "enverge_easyseal"
                ? "bg-orange/20 text-orange border border-orange/30"
                : "bg-white/5 text-white/40 border border-white/10"
            }`}
          >
            Enverge EasySeal
          </motion.button>
          <motion.button
            onClick={() => setFoamSystem("accufoam_af1")}
            whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              foamSystem === "accufoam_af1"
                ? "bg-orange/20 text-orange border border-orange/30"
                : "bg-white/5 text-white/40 border border-white/10"
            }`}
          >
            Accufoam AF1
          </motion.button>
        </div>

        {/* Feature 1: Substrate Type Selector */}
        <div className="space-y-2">
          <div className="text-[10px] text-white/30 uppercase tracking-wider">
            Substrate Type
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {(["metal", "wood", "concrete", "underfloor"] as const satisfies SubstrateType[]).map((type) => (
              <motion.button
                key={type}
                onClick={() => setSubstrateType(substrateType === type ? null : type)}
                whileTap={{ scale: 0.93 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={`py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                  substrateType === type
                    ? "bg-orange/20 text-orange border border-orange/30"
                    : "bg-white/5 text-white/40 border border-white/10"
                }`}
              >
                {type}
              </motion.button>
            ))}
          </div>
          {substrateType && (
            <div className="text-[10px] text-white/25">
              {substrateType.charAt(0).toUpperCase() + substrateType.slice(1)}: ambient {SUBSTRATE_OFFSETS[substrateType]}°F
              {shift === "morning" ? " (−3°F morning)" : ""}
            </div>
          )}
        </div>

        {/* Feature 6: Shift/Time-of-Day Toggle */}
        <div className="space-y-2">
          <div className="text-[10px] text-white/30 uppercase tracking-wider">
            Time of Day
          </div>
          <div className="flex gap-2">
            <motion.button
              onClick={() => setShift("morning")}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                shift === "morning"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-white/5 text-white/40 border border-white/10"
              }`}
            >
              Morning
            </motion.button>
            <motion.button
              onClick={() => setShift("afternoon")}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                shift === "afternoon"
                  ? "bg-orange/20 text-orange border border-orange/30"
                  : "bg-white/5 text-white/40 border border-white/10"
              }`}
            >
              Afternoon
            </motion.button>
          </div>
        </div>

        {/* Active job sites — dial in from job */}
        {!jobsLoading && activeJobs.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] text-white/30 uppercase tracking-wider">
              Active Job Sites
            </div>
            {activeJobs.map((job) => (
              <motion.button
                key={job.id}
                onClick={() => dialInFromJob(job)}
                disabled={weatherLoading}
                whileTap={{ scale: 0.93 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={`w-full py-2.5 px-3 rounded-xl text-sm font-medium text-left transition-colors disabled:opacity-50 ${
                  activeSource === job.name
                    ? "bg-green-500/15 text-green-400 border border-green-500/30"
                    : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/8"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{job.name}</span>
                  <span className="text-[10px] text-white/30">
                    {activeSource === job.name ? "Active" : "Dial in"}
                  </span>
                </div>
                {job.address && (
                  <div className="text-[10px] text-white/25 mt-0.5">{job.address}</div>
                )}
              </motion.button>
            ))}
          </div>
        )}

        {/* Manual weather auto-fill */}
        <motion.button
          onClick={autoFillWeather}
          disabled={weatherLoading}
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="w-full py-2 rounded-xl text-xs font-medium bg-blue/10 text-blue/80 border border-blue/20 hover:bg-blue/20 transition-colors disabled:opacity-50"
        >
          {weatherLoading ? "Loading..." : "Auto-fill from current weather"}
        </motion.button>

        {/* Active source indicator */}
        {activeSource && (
          <div className="text-[10px] text-green-400/60 text-center">
            Conditions loaded from: {activeSource}
          </div>
        )}

        {/* Sliders */}
        <div className="space-y-5">
          <SliderField
            label="Ambient Temperature"
            value={ambient}
            min={20}
            max={110}
            unit="F"
            gradient="temp"
            onChange={(v) => { setAmbient(v); setActiveSource(null); }}
          />
          <SliderField
            label="Substrate Temperature"
            value={substrate}
            min={20}
            max={120}
            unit="F"
            gradient="temp"
            onChange={(v) => { setSubstrate(v); setSubstrateType(null); setActiveSource(null); }}
          />
          <SliderField
            label="Relative Humidity"
            value={humidity}
            min={10}
            max={100}
            unit="%"
            gradient="humidity"
            onChange={(v) => { setHumidity(v); setActiveSource(null); }}
          />
        </div>

        {/* Alerts — under sliders */}
        <div className="space-y-2">
          {result.alerts.map((alert, i) => (
            <motion.div
              key={`${result.status}-${i}`}
              initial={{ opacity: 0, x: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ delay: i * 0.12 }}
              className={`text-sm p-3 rounded-lg ${
                alert.includes("STOP")
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : alert.includes("WARNING") || alert.includes("Elevated") || alert.includes("High") || alert.includes("Cold") || alert.includes("Cool")
                  ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              }`}
            >
              {alert}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Results */}
      <motion.div variants={item} className="space-y-4">
        {/* Feature 4: Weather Conditions Badge */}
        <AnimatePresence>
          {activeSource && weatherConditions && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex justify-center"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                <span>{weatherConditions}</span>
                <span className="text-white/80 font-medium">{ambient}°F</span>
                <span>{humidity}% RH</span>
                {weatherWind != null && (
                  <span className="text-white/40">{weatherWind} mph</span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature 8: Go/No-Go Radial Gauge */}
        <div
          className={`glass-card p-6 text-center ${
            result.status === "red"
              ? "border-red-500/30"
              : result.status === "yellow"
              ? "border-yellow-500/30"
              : "border-green-500/30"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <RadialGauge status={result.status} margin={result.margin} />
            <motion.div
              key={result.status}
              initial={{ scale: 1.03 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className={`text-lg font-light ${
                result.status === "red"
                  ? "text-red-400"
                  : result.status === "yellow"
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              {result.status === "red"
                ? "DO NOT SPRAY"
                : result.status === "yellow"
                ? "USE CAUTION"
                : "CONDITIONS OK"}
            </motion.div>
          </div>
        </div>

        {/* Readings */}
        <div className="grid grid-cols-2 gap-4">
          <ResultCard label="Dew Point" value={`${result.dewPoint.toFixed(1)}F`} />
          <ResultCard
            label="Substrate Margin"
            value={`${result.margin.toFixed(1)}F`}
            alert={result.margin < 10}
            good={result.margin >= 15}
          />
        </div>

        <div className="gradient-divider" />

        {/* Recommended Settings + Alerts — all in one card */}
        <div className="glass-card p-5 space-y-4">
          <div>
            <h3 className="text-sm text-white/60 uppercase tracking-wider">
              {result.foamSystemName} &mdash; Recommended Settings
            </h3>
            <p className="text-[10px] text-white/25 mt-0.5">
              Based on TDS + current conditions &mdash; verify at the gun
            </p>
          </div>
          {/* Feature 9: Pulse animation on settings cards + Feature 2: Max Pass */}
          <div className="grid grid-cols-4 gap-3">
            <PulseResultCard
              label="Hose Temp"
              value={`${result.recHoseTemp}°F`}
              accent
            />
            <PulseResultCard
              label="Drum Temp"
              value={`${result.recDrumTemp}°F`}
              accent
            />
            {result.recPressure != null ? (
              <PulseResultCard
                label="Pressure"
                value={`${result.recPressure} PSI`}
                accent
              />
            ) : (
              <ResultCard
                label="Pressure"
                value="N/A"
              />
            )}
            <ResultCard
              label="Max Pass"
              value={`${result.maxPassThickness} in`}
              accent
            />
          </div>

          {/* TDS ranges inline */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-white/30 pt-1 border-t border-white/5">
            <div>Hose range: {result.hoseTempRange.min}–{result.hoseTempRange.max}°F</div>
            <div>Drums: {result.drumStorageRange.min}–{result.drumStorageRange.max}°F</div>
            {result.pressureRange && (
              <div>Pressure: {result.pressureRange.min}–{result.pressureRange.max} PSI</div>
            )}
            {result.pressureBalance != null && (
              <div>A/B Balance: ±{result.pressureBalance} PSI</div>
            )}
          </div>

          {/* Feature 5: Historical Match */}
          <AnimatePresence>
            {historicalMatch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="text-xs p-3 rounded-lg bg-white/5 border border-white/10 text-white/50">
                  Similar conditions on {historicalMatch.date}: rated {historicalMatch.rating}/5, yield {historicalMatch.yieldActual} bf/set
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-[9px] text-white/15">
            Source: {result.source}
          </p>
        </div>

        {/* Feature 3: Save & Share Button */}
        <motion.button
          onClick={copyToClipboard}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="w-full py-2.5 rounded-xl text-sm font-medium bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 transition-colors"
        >
          {copied ? "Copied!" : "Copy Dial-In Summary"}
        </motion.button>

        {/* Substrate disclaimer */}
        <p className="text-[10px] text-white/20 px-1">
          Substrate temp must be verified with a temp gun before spraying. The value entered here is for planning only.
        </p>
      </motion.div>
    </motion.div>
  );
}

// --- Feature 7: Color-Gradient Slider Tracks ---

function SliderField({
  label,
  value,
  min,
  max,
  unit,
  gradient,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  gradient?: "temp" | "humidity";
  onChange: (v: number) => void;
}) {
  const gradientBg = gradient === "temp"
    ? "linear-gradient(to right, #3B82F6, #F97316)"
    : gradient === "humidity"
    ? "linear-gradient(to right, #22C55E, #3B82F6)"
    : undefined;

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-white/50">{label}</span>
        <span className="text-white font-medium">
          {value}
          {unit}
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        {gradientBg && (
          <div
            className="absolute inset-x-0 h-2 rounded-full opacity-30"
            style={{ background: gradientBg }}
          />
        )}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full relative z-10 slider-gradient"
          style={
            gradientBg
              ? {
                  background: `linear-gradient(to right, ${
                    gradient === "temp" ? "#3B82F6" : "#22C55E"
                  } 0%, ${
                    gradient === "temp" ? "#F97316" : "#3B82F6"
                  } 100%)`,
                  WebkitAppearance: "none",
                  height: "6px",
                  borderRadius: "3px",
                  outline: "none",
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}

// --- Feature 8: Radial Gauge SVG ---

function RadialGauge({
  status,
  margin,
}: {
  status: "green" | "yellow" | "red";
  margin: number;
}) {
  // Map margin 0-30°F → 0-100%
  const pct = Math.min(100, Math.max(0, (margin / 30) * 100));
  const radius = 40;
  const stroke = 6;
  const cx = 50;
  const cy = 50;
  // Arc from -135° to +135° (270° total)
  const startAngle = -225;
  const totalArc = 270;
  const endAngle = startAngle + (totalArc * pct) / 100;

  const polarToCart = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const bgStart = polarToCart(startAngle);
  const bgEnd = polarToCart(startAngle + totalArc);
  const arcEnd = polarToCart(endAngle);
  const largeArcBg = totalArc > 180 ? 1 : 0;
  const largeArc = (totalArc * pct) / 100 > 180 ? 1 : 0;

  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 ${largeArcBg} 1 ${bgEnd.x} ${bgEnd.y}`;
  const arcPath =
    pct > 0
      ? `M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y}`
      : "";

  const color =
    status === "green" ? "#22C55E" : status === "yellow" ? "#EAB308" : "#EF4444";

  return (
    <div className="w-[100px] h-[80px]">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background arc */}
        <path
          d={bgPath}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Animated value arc */}
        {arcPath && (
          <motion.path
            d={arcPath}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.5 }}
            animate={{
              pathLength: 1,
              opacity: 1,
              filter: status === "red" ? [
                "drop-shadow(0 0 4px rgba(239,68,68,0.6))",
                "drop-shadow(0 0 8px rgba(239,68,68,0.3))",
                "drop-shadow(0 0 4px rgba(239,68,68,0.6))",
              ] : undefined,
            }}
            transition={
              status === "red"
                ? { pathLength: { duration: 0.6 }, filter: { repeat: Infinity, duration: 1.5 } }
                : { duration: 0.6 }
            }
          />
        )}
        {/* Center text */}
        <text
          x={cx}
          y={cy + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize="14"
          fontWeight="300"
        >
          {margin.toFixed(0)}°F
        </text>
      </svg>
    </div>
  );
}

// --- Base ResultCard ---

function ResultCard({
  label,
  value,
  alert,
  good,
  accent,
}: {
  label: string;
  value: string;
  alert?: boolean;
  good?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="glass-card result-card-hover p-4">
      <div className="text-xs text-white/40 uppercase tracking-wider">
        {label}
      </div>
      <motion.div
        key={value}
        initial={{ scale: 1.03 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        className={`text-2xl font-light mt-1 metric-value ${
          alert
            ? "text-red-400 result-glow"
            : good
            ? "text-green-400 result-glow"
            : accent
            ? "text-orange result-glow"
            : "text-white"
        }`}
      >
        {value}
      </motion.div>
    </div>
  );
}

// --- Feature 9: PulseResultCard with glow on value change ---

function PulseResultCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  const prevValue = useRef(value);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (prevValue.current !== value) {
      setPulse(true);
      prevValue.current = value;
    }
  }, [value]);

  return (
    <motion.div
      className="glass-card result-card-hover p-4"
      animate={
        pulse
          ? {
              boxShadow: [
                "0 0 20px rgba(249,115,22,0.4)",
                "0 0 0px rgba(249,115,22,0)",
              ],
            }
          : {}
      }
      transition={{ duration: 0.6 }}
      onAnimationComplete={() => setPulse(false)}
    >
      <div className="text-xs text-white/40 uppercase tracking-wider">
        {label}
      </div>
      <motion.div
        key={value}
        initial={{ scale: 1.03 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        className={`text-2xl font-light mt-1 metric-value ${
          accent ? "text-orange result-glow" : "text-white"
        }`}
      >
        {value}
      </motion.div>
    </motion.div>
  );
}
