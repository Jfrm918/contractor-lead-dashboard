"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SpecsTab,
  ApplicationRulesTab,
  TroubleshootingTab,
  SeasonalTab,
  type FoamSystem as KBFoamSystem,
} from "./knowledge-base";

interface FoamSystem {
  id: string;
  manufacturer: string;
  product: string;
  type: string;
  rValue: number;
  yieldPerSet: number;
  ratio: string;
  minTemp: number;
  maxTemp: number;
  substrates: string[];
  notes: string | null;
}

// Map DB foam systems to knowledge base keys
function toKBSystem(system: FoamSystem): KBFoamSystem | null {
  const name = `${system.manufacturer} ${system.product}`.toLowerCase();
  if (name.includes("easyseal") || name.includes("enverge")) return "easyseal";
  if (name.includes("accufoam") || name.includes("af1")) return "af1";
  return null;
}

const KNOWLEDGE_TABS = [
  { id: "specs", label: "Quick Specs" },
  { id: "rules", label: "Spray Rules" },
  { id: "troubleshoot", label: "Fix Problems" },
  { id: "seasonal", label: "Weather" },
];

function FieldStartCard({ system }: { system: FoamSystem }) {
  const isOpenCell = system.type === "open_cell";
  const firstChecks = isOpenCell
    ? ["Confirm substrate is dry and warm enough", "Watch rise speed before filling cavities", "Keep passes controlled in hot buildings"]
    : ["Check substrate temp and moisture first", "Spray thinner lifts until the foam proves stable", "Watch pressure balance before chasing heat"];

  return (
    <div className="glass-card fd-foam-panel p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="fd-section-title">Start Here In The Field</div>
          <p className="text-sm text-white/55 mt-1 max-w-2xl">
            This foam guide replaces the old Knowledge tab. Use it when you are standing at the rig and need the fastest safe dial-in path.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 min-w-full lg:min-w-[420px]">
          <div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Temp Window</div>
            <div className="fd-mono-readout text-sm text-white mt-1">{system.minTemp}–{system.maxTemp}°F</div>
          </div>
          <div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Yield Target</div>
            <div className="fd-mono-readout text-sm text-white mt-1">{system.yieldPerSet.toLocaleString()} bf</div>
          </div>
          <div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Type</div>
            <div className="text-sm text-white mt-1">{isOpenCell ? "Open Cell" : "Closed Cell"}</div>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-3 mt-4">
        {firstChecks.map((check) => (
          <div key={check} className="rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-white/55">
            <span className="text-orange mr-1.5">●</span>{check}
          </div>
        ))}
      </div>
    </div>
  );
}

function GenericFieldGuideTab({ system, tab }: { system: FoamSystem; tab: string }) {
  const isOpenCell = system.type === "open_cell";
  const substrates = system.substrates?.length ? system.substrates.join(", ") : "wood, metal, masonry, and approved clean/dry substrates";
  const commonFixes = isOpenCell
    ? [
        { symptom: "Foam not sticking", action: "Stop and check substrate temp/moisture before changing machine settings." },
        { symptom: "Foam rising too fast", action: "Reduce lift thickness, watch hose heat, and spray a small test area first." },
        { symptom: "Low yield", action: "Tighten spray distance, inspect gun tip, and check for drift/overspray." },
      ]
    : [
        { symptom: "Poor adhesion", action: "Verify substrate is dry, above minimum temp, and not near dew point." },
        { symptom: "Scorching or shrinkage", action: "Cut lift thickness and let heat leave between passes." },
        { symptom: "Off-ratio look", action: "Check A/B pressure balance and do not chase the problem with random temp changes." },
      ];

  if (tab === "rules") {
    return (
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="fd-section-title">Spray Rules</div>
          <div className="space-y-3 mt-4">
            {[
              `Stay inside the listed ${system.minTemp}–${system.maxTemp}°F application window unless the manufacturer says otherwise.`,
              "Spray a small test patch first; judge adhesion, rise, color, and cell structure before production speed.",
              "Make one change at a time: substrate prep, then pressure balance, then heat, then technique.",
              isOpenCell ? "Avoid overfilling cavities; open cell can expand fast when conditions are hot." : "Build closed cell in controlled lifts; heat buildup causes callbacks.",
            ].map((rule) => (
              <div key={rule} className="flex gap-3 text-sm text-white/60">
                <span className="text-orange mt-0.5">●</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="fd-section-title">Substrate Checklist</div>
          <div className="mt-4 text-sm text-white/55">Approved/common substrates: {substrates}</div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {["Dry", "Warm enough", "Clean", "No condensation"].map((check) => (
              <div key={check} className="rounded-xl bg-green-500/10 border border-green-500/15 p-3 text-xs text-green-400">✓ {check}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tab === "troubleshoot") {
    return (
      <div className="space-y-3">
        {commonFixes.map((fix) => (
          <div key={fix.symptom} className="glass-card p-5">
            <div className="text-sm font-medium text-white">{fix.symptom}</div>
            <div className="text-sm text-white/55 mt-2">{fix.action}</div>
          </div>
        ))}
        <div className="glass-card p-5 border-orange/20">
          <div className="fd-section-title">New Installer Rule</div>
          <p className="text-sm text-white/55 mt-2">
            If the foam changes suddenly, stop production and diagnose before burying bad foam. Log the condition so FoamDial can learn the pattern.
          </p>
        </div>
      </div>
    );
  }

  if (tab === "seasonal") {
    return (
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Cold Start", text: `Pre-warm material and confirm substrate is above ${system.minTemp}°F before spraying.` },
          { label: "Hot Building", text: "Watch rise speed, reduce pass thickness, and avoid trapping heat in tight spaces." },
          { label: "Humidity / Dew", text: "Check condensation. If the surface feels damp or cold, adhesion risk is high." },
        ].map((card) => (
          <div key={card.label} className="glass-card p-5">
            <div className="fd-section-title">{card.label}</div>
            <p className="text-sm text-white/55 mt-3">{card.text}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><div className="text-[10px] text-white/30 uppercase">R-Value</div><div className="text-sm text-white">R-{system.rValue}/in</div></div>
        <div><div className="text-[10px] text-white/30 uppercase">Yield</div><div className="text-sm text-white">{system.yieldPerSet.toLocaleString()} bf/set</div></div>
        <div><div className="text-[10px] text-white/30 uppercase">Temp Range</div><div className="text-sm text-white">{system.minTemp}–{system.maxTemp}°F</div></div>
        <div><div className="text-[10px] text-white/30 uppercase">Ratio</div><div className="text-sm text-white">{system.ratio}</div></div>
      </div>
      <div className="mt-5"><div className="text-[10px] text-white/30 uppercase">Substrates</div><div className="text-sm text-white/60 mt-1">{substrates}</div></div>
      {system.notes && <p className="text-xs text-white/40 mt-4">{system.notes}</p>}
    </div>
  );
}

export default function FoamDatabase() {
  const [systems, setSystems] = useState<FoamSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedSystem, setSelectedSystem] = useState<FoamSystem | null>(null);
  const [activeTab, setActiveTab] = useState("specs");
  const [troubleshootSearch, setTroubleshootSearch] = useState("");

  useEffect(() => {
    fetch("/api/foam-systems")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSystems(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = systems.filter((s) => {
    const matchesSearch = `${s.manufacturer} ${s.product} ${s.notes || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesType =
      typeFilter === "all" || s.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Detail view — knowledge tabs for the selected foam system
  if (selectedSystem) {
    const kbSystem = toKBSystem(selectedSystem);
    const isAF1 = kbSystem === "af1";
    const accentBg = isAF1 ? "bg-cyan-500/15" : "bg-orange/15";
    const accentText = isAF1 ? "text-cyan-400" : "text-orange";
    const accentBorder = isAF1 ? "border-cyan-500/20" : "border-orange/20";
    const activeStyle = isAF1
      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
      : "bg-orange/15 text-orange border border-orange/20";

    return (
      <div className="space-y-6">
        {/* Back + Header */}
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => { setSelectedSystem(null); setActiveTab("specs"); setTroubleshootSearch(""); }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/50 border border-white/10 hover:bg-white/5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            All Foams
          </motion.button>
          <div className="flex-1">
            <h2 className="text-lg text-white font-medium">
              {selectedSystem.manufacturer} {selectedSystem.product}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${accentBg} ${accentText} border ${accentBorder}`}>
                {selectedSystem.type === "open_cell" ? "Open Cell" : "Closed Cell"}
              </span>
              <span className="text-xs text-white/30">
                R-{selectedSystem.rValue}/in · {selectedSystem.yieldPerSet.toLocaleString()} bf/set
              </span>
            </div>
          </div>
        </div>

        {/* Knowledge tabs */}
        <FieldStartCard system={selectedSystem} />

        {/* Quick problem picker */}
        <div className="space-y-2">
          <div className="text-[10px] text-white/30 uppercase tracking-wider">
            Having a problem right now?
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "Won't Stick", search: "adhesion", icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" },
              { label: "Rising Too Fast", search: "rising OR fast OR hot", icon: "M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" },
              { label: "Bad Yield", search: "yield", icon: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22" },
              { label: "Off-Ratio", search: "ratio OR cells OR opening", icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" },
            ].map((problem) => (
              <motion.button
                key={problem.label}
                onClick={() => {
                  setTroubleshootSearch(problem.search.replace(/ OR /g, ' '));
                  setActiveTab("troubleshoot");
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/8 border border-red-500/15 text-red-400 hover:bg-red-500/15 transition-colors text-left"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={problem.icon} />
                </svg>
                <span className="text-sm font-medium">{problem.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-white/5 overflow-x-auto">
          {KNOWLEDGE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? activeStyle
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedSystem.id}-${activeTab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {kbSystem ? (
              <>
                {activeTab === "specs" && <SpecsTab system={kbSystem} />}
                {activeTab === "rules" && <ApplicationRulesTab system={kbSystem} />}
                {activeTab === "troubleshoot" && <TroubleshootingTab system={kbSystem} initialSearch={troubleshootSearch} />}
                {activeTab === "seasonal" && <SeasonalTab system={kbSystem} />}
              </>
            ) : (
              <GenericFieldGuideTab system={selectedSystem} tab={activeTab} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Card list view
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg text-white font-medium">Foam Guides</h2>
        <p className="text-sm text-white/40 mt-1">
          Tap the foam you are spraying for quick specs, settings, troubleshooting, and weather notes
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search manufacturer, product..."
          className="input-field flex-1 min-w-[200px]"
        />
        <div className="flex gap-2">
          {["all", "open_cell", "closed_cell"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-xl text-sm transition-all ${
                typeFilter === t
                  ? "bg-orange/20 text-orange border border-orange/30"
                  : "bg-white/5 text-white/40 border border-white/10"
              }`}
            >
              {t === "all" ? "All" : t === "open_cell" ? "Open Cell" : "Closed Cell"}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="text-white/30 text-sm py-12 text-center">Loading foam systems...</div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 gap-4"
        >
          {filtered.map((s) => {
            return (
              <motion.div
                key={s.id}
                variants={item}
                className="glass-card p-5 cursor-pointer transition-all hover:bg-white/8"
                onClick={() => setSelectedSystem(s)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-white font-medium">
                      {s.manufacturer} {s.product}
                    </div>
                    <div className="text-xs text-white/40 mt-0.5">
                      {s.type === "open_cell" ? "Open Cell" : "Closed Cell"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/20 uppercase tracking-wider">
                      Field Guide
                    </span>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider ${
                        s.type === "open_cell"
                          ? "bg-orange/20 text-orange"
                          : "bg-blue/20 text-blue"
                      }`}
                    >
                      {s.type === "open_cell" ? "OC" : "CC"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div>
                    <div className="text-[10px] text-white/30 uppercase">R-Value</div>
                    <div className="text-sm text-white">R-{s.rValue}/in</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase">Yield</div>
                    <div className="text-sm text-white">{s.yieldPerSet.toLocaleString()} bf</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase">Temp</div>
                    <div className="text-sm text-white">{s.minTemp}–{s.maxTemp}°F</div>
                  </div>
                </div>

                {s.notes && (
                  <p className="text-xs text-white/40 mt-3 line-clamp-2">{s.notes}</p>
                )}

                {/* Tap hint */}
                <div className="flex items-center gap-1.5 mt-3 text-[10px] text-white/20">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                  Tap for the field guide
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
