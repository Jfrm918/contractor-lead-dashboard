"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

const GALLONS_PER_SET = 48;
const DEFAULT_YIELD = 20000;
const GALLONS_PER_DRUM = 48;

type Preset = {
  label: string;
  thickness: number;
  description: string;
  addsInch: boolean; // +1" bid buffer for rooflines & metal buildings
};

const CAVITY_PRESETS: Preset[] = [
  { label: "2x4 Wall", thickness: 3.5, description: '3.5"', addsInch: false },
  { label: "2x6 Wall", thickness: 3.5, description: '3.5"', addsInch: false },
  { label: "2x6 Full", thickness: 5.5, description: '5.5" fullfill', addsInch: false },
  { label: "Roofline", thickness: 5.5, description: '5.5"', addsInch: true },
  { label: "Roof Shallow", thickness: 4, description: '4"', addsInch: true },
  { label: "Roof Deep", thickness: 7, description: '7–10"', addsInch: true },
  { label: "Metal Wall", thickness: 3.5, description: '3.5"', addsInch: true },
  { label: "Metal Roof", thickness: 5.5, description: '5.5"', addsInch: true },
];

/* ── Animated number display ── */
function AnimatedNumber({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()
  );
  const [text, setText] = useState(decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString());

  useEffect(() => {
    spring.set(value);
    const unsub = display.on("change", (v) => setText(v));
    return unsub;
  }, [value, spring, display]);

  return <>{text}{suffix}</>;
}

/* ── Card entrance animation ── */
const cardFade = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

export default function BFCalculator() {
  const { viewMode } = useAuth();
  const showCost = viewMode === "owner";
  const [yieldPerSet, setYieldPerSet] = useState(DEFAULT_YIELD);

  // Primary calculator
  const [sqft, setSqft] = useState("");
  const [thickness, setThickness] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [addsInch, setAddsInch] = useState(false);

  // Material estimator
  const [estSqft, setEstSqft] = useState("");
  const [estThickness, setEstThickness] = useState("");
  const [estCostPerSet, setEstCostPerSet] = useState("");
  const [estAddsInch, setEstAddsInch] = useState(false);

  const handlePreset = useCallback((preset: Preset) => {
    setSelectedPreset(preset.label);
    setThickness(preset.thickness.toString());
    setAddsInch(preset.addsInch);
  }, []);

  // Primary result: sqft × (thickness + 1 for rooflines/metal) ÷ yield
  const primaryResult = useMemo(() => {
    const sf = parseFloat(sqft);
    const th = parseFloat(thickness);
    if (isNaN(sf) || sf <= 0 || isNaN(th) || th <= 0) return null;

    const bidThickness = addsInch ? th + 1 : th;
    const boardFeet = sf * bidThickness;
    const setsNeeded = boardFeet / yieldPerSet;
    const gallonsNeeded = setsNeeded * GALLONS_PER_SET;

    return { boardFeet, setsNeeded, gallonsNeeded, bidThickness, hasBuffer: addsInch };
  }, [sqft, thickness, addsInch, yieldPerSet]);

  // Material estimator — applies +1" buffer for rooflines/metal
  const estimatorResult = useMemo(() => {
    const sf = parseFloat(estSqft);
    const th = parseFloat(estThickness);
    if (isNaN(sf) || sf <= 0 || isNaN(th) || th <= 0) return null;

    const bidThickness = estAddsInch ? th + 1 : th;
    const totalBF = sf * bidThickness;
    const setsNeeded = totalBF / yieldPerSet;
    const totalGallons = setsNeeded * GALLONS_PER_SET;
    const drumsPerSide = totalGallons / 2 / GALLONS_PER_DRUM;
    const costPerSet = parseFloat(estCostPerSet);
    const cost = !isNaN(costPerSet) && costPerSet > 0 ? setsNeeded * costPerSet : null;

    return { totalBF, setsNeeded, totalGallons, drumsPerSide, cost, hasBuffer: estAddsInch };
  }, [estSqft, estThickness, estAddsInch, estCostPerSet, yieldPerSet]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-5 pb-8">

      {/* ── Header ── */}
      <motion.div variants={cardFade}>
        <h1 className="text-xl text-white font-medium">Board Footage Calculator</h1>
        <p className="text-sm text-white/40 mt-1">Estimate spray foam coverage, material, and cost</p>
      </motion.div>

      {/* ── Yield Setting ── */}
      <motion.div variants={cardFade} className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-white/50 font-medium uppercase tracking-wider">System Yield</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={yieldPerSet}
              onChange={(e) => setYieldPerSet(parseInt(e.target.value) || DEFAULT_YIELD)}
              className="input-field w-28 text-right text-sm"
            />
            <span className="text-xs text-white/30">BF / set</span>
          </div>
        </div>
      </motion.div>

      {/* ── Primary Calculator: Sqft + Thickness → BF ── */}
      <motion.div variants={cardFade} className="glass-card p-5 space-y-4">
        <h2 className="text-sm text-white font-medium">Coverage Calculator</h2>

        {/* Presets */}
        <div>
          <span className="text-[10px] text-white/35 uppercase tracking-wider">Quick-fill thickness</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {CAVITY_PRESETS.map((p) => (
              <motion.button
                key={p.label}
                onClick={() => handlePreset(p)}
                whileTap={{ scale: 0.93 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={`relative px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  selectedPreset === p.label
                    ? "bg-orange/20 ring-1 ring-orange/50 text-orange"
                    : "bg-white/5 text-white/50 hover:bg-white/8 hover:text-white/70"
                }`}
              >
                {p.label}
                {selectedPreset === p.label && (
                  <motion.span
                    layoutId="preset-dot"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* +1" Buffer Toggle */}
        <div className="flex items-center justify-between px-1">
          <div>
            <span className="text-[10px] text-white/35 uppercase tracking-wider">+1&quot; Bid Buffer</span>
            <span className="text-[10px] text-white/25 ml-1.5">(rooflines &amp; metal)</span>
          </div>
          <motion.button
            onClick={() => setAddsInch(!addsInch)}
            whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              addsInch
                ? "bg-orange/20 ring-1 ring-orange/50 text-orange"
                : "bg-white/5 text-white/30 hover:bg-white/8"
            }`}
          >
            {addsInch ? "ON" : "OFF"}
          </motion.button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-wider">Square Feet</label>
            <input
              type="number"
              inputMode="numeric"
              value={sqft}
              onChange={(e) => setSqft(e.target.value)}
              placeholder="e.g. 2,500"
              className="input-field input-glow text-lg"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-wider">Thickness (inches)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.25"
              value={thickness}
              onChange={(e) => {
                setThickness(e.target.value);
                setSelectedPreset(null);
                setAddsInch(false);
              }}
              placeholder="e.g. 3.5"
              className="input-field input-glow text-lg"
            />
          </div>
        </div>

        {/* Result */}
        <AnimatePresence>
          {primaryResult && (
            <motion.div
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              className="pt-4"
            >
              <div className="gradient-divider mb-4" />
              {primaryResult.hasBuffer && (
                <div className="text-[10px] text-orange/60 mb-2">
                  +1&quot; buffer applied &mdash; calculating at {primaryResult.bidThickness}&quot; instead of {thickness}&quot;
                </div>
              )}
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-sm text-white/50">Board Feet</span>
                <motion.span
                  key={primaryResult.boardFeet}
                  initial={{ scale: 1.03 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="text-2xl font-semibold text-orange metric-value result-glow inline-block"
                >
                  <AnimatedNumber value={primaryResult.boardFeet} />
                  <span className="text-sm font-normal text-orange/60 ml-1">BF</span>
                </motion.span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ResultCard label="Sets Needed" value={primaryResult.setsNeeded} decimals={2} />
                <ResultCard label="Total Gallons (A+B)" value={primaryResult.gallonsNeeded} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Section Divider ── */}
      <motion.div variants={cardFade} className="px-8">
        <div className="section-divider" />
      </motion.div>

      {/* ── Material Estimator ── */}
      <motion.div variants={cardFade} className="glass-card p-5 space-y-4">
        <div>
          <h2 className="text-sm text-white font-medium">Job Material Estimator</h2>
          <p className="text-[10px] text-white/30 mt-0.5">
            Uses +1&quot; bid buffer for rooflines &amp; metal buildings
          </p>
        </div>

        <div className="flex items-center justify-between px-1 mb-1">
          <div>
            <span className="text-[10px] text-white/35 uppercase tracking-wider">+1&quot; Bid Buffer</span>
            <span className="text-[10px] text-white/25 ml-1.5">(rooflines &amp; metal)</span>
          </div>
          <motion.button
            onClick={() => setEstAddsInch(!estAddsInch)}
            whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              estAddsInch
                ? "bg-orange/20 ring-1 ring-orange/50 text-orange"
                : "bg-white/5 text-white/30 hover:bg-white/8"
            }`}
          >
            {estAddsInch ? "ON" : "OFF"}
          </motion.button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-wider">Sq Ft</label>
            <input
              type="number"
              inputMode="numeric"
              value={estSqft}
              onChange={(e) => setEstSqft(e.target.value)}
              placeholder="3,000"
              className="input-field input-glow"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-wider">Thickness</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.25"
              value={estThickness}
              onChange={(e) => setEstThickness(e.target.value)}
              placeholder='3.5"'
              className="input-field input-glow"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-wider">$/Set <span className="normal-case text-white/25">(optional)</span></label>
            <input
              type="number"
              inputMode="decimal"
              value={estCostPerSet}
              onChange={(e) => setEstCostPerSet(e.target.value)}
              placeholder="850"
              className="input-field input-glow"
            />
          </div>
        </div>

        <AnimatePresence>
          {estimatorResult && (
            <motion.div
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              className="pt-4 space-y-3"
            >
              <div className="gradient-divider mb-3" />
              <div className="grid grid-cols-2 gap-3">
                <ResultCard label="Total Board Feet" value={estimatorResult.totalBF} accent />
                <ResultCard label="Sets Needed" value={estimatorResult.setsNeeded} decimals={2} accent />
                <ResultCard label="Total Gallons (A+B)" value={estimatorResult.totalGallons} />
                <ResultCard label="Drums per Side" value={estimatorResult.drumsPerSide} decimals={1} />
              </div>

              {showCost && estimatorResult.cost !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-xl bg-orange/5 border border-orange/10"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/50">Estimated Material Cost</span>
                    <span className="text-lg font-semibold text-orange metric-value result-glow">
                      $<AnimatedNumber value={estimatorResult.cost} decimals={2} />
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Quick Reference ── */}
      <motion.div variants={cardFade} className="glass-card p-4">
        <h3 className="text-[10px] text-white/35 uppercase tracking-wider mb-2.5">Quick Reference</h3>
        <div className="grid grid-cols-4 gap-2 text-sm">
          <RefCell label="1 Set" value="96 gal" />
          <RefCell label="1 Drum" value="48 gal" />
          <RefCell label="A:B Ratio" value="1 : 1" />
          <RefCell label="Yield" value={`${yieldPerSet.toLocaleString()} BF`} accent />
        </div>
      </motion.div>

      {/* ── Disclaimer / How It Works ── */}
      <motion.div variants={cardFade} className="px-1">
        <p className="text-[11px] leading-relaxed text-white/25">
          <span className="text-white/35 font-medium">How board footage is calculated.</span>{" "}
          One board foot (BF) equals one square foot of coverage at one inch thick.
          Total board footage is calculated by multiplying the area in square feet by the
          target thickness in inches (BF = sq ft &times; inches). For rooflines and metal
          buildings, an extra inch is added to the thickness to account for purlins, ridges,
          and uneven surfaces. Sets needed are derived by dividing total board feet by the
          system&rsquo;s rated yield per set. Drum counts assume a
          1:1 A-to-B ratio by volume. All figures are estimates; actual yield depends on
          foam system, substrate temperature, humidity, equipment calibration, and application
          method. Always consult your chemical supplier&rsquo;s technical data sheet for
          rated yield and coverage specifications.
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ── Small result card with animated numbers ── */
function ResultCard({ label, value, decimals = 0, accent }: { label: string; value: number; decimals?: number; accent?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="result-card-hover p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]"
    >
      <div className="text-[10px] text-white/30 mb-0.5">{label}</div>
      <div className={`text-sm font-medium metric-value ${accent ? "text-orange result-glow" : "text-white/80"}`}>
        <AnimatedNumber value={value} decimals={decimals} />
      </div>
    </motion.div>
  );
}

/* ── Reference cell ── */
function RefCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-2 rounded-lg bg-white/[0.03] result-card-hover">
      <div className="text-[10px] text-white/25">{label}</div>
      <div className={`text-sm ${accent ? "text-orange result-glow" : "text-white/80"}`}>{value}</div>
    </div>
  );
}
