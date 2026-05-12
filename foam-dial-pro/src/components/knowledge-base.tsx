"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type FoamSystem = "easyseal" | "af1";

interface Diagnostic {
  id: string;
  problem: string;
  category: string;
  severity: string;
  causes: string[];
  fixes: string[];
}

function getTabs(system: FoamSystem) {
  return [
    { id: "specs", label: system === "af1" ? "AF1 Specs" : "EasySeal .5 Specs" },
    { id: "rules", label: "Application Rules" },
    { id: "troubleshoot", label: "Troubleshooting" },
    { id: "seasonal", label: "Seasonal Guide" },
  ];
}

const EASYSEAL_DIAGNOSTICS = [
  {
    id: "extra-1",
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
    context: "Less concern than closed cell, but can still occur in metal buildings during summer.",
  },
  {
    id: "extra-2",
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
    jasonTip:
      "Metal buildings in early morning — always check substrate temp before you pull trigger",
  },
  {
    id: "extra-3",
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
    id: "extra-4",
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

const AF1_DIAGNOSTICS = [
  {
    id: "af1-1",
    problem: "AF1 foam rising too fast in warm conditions",
    category: "application",
    severity: "high",
    causes: [
      "Drum temps too high (above 90°F)",
      "Ambient temperature above 100°F",
    ],
    fixes: [
      "Lower drum temps to 70-80°F",
      "Spray earlier in day before heat builds",
      "Reduce hose temps to 120-125°F",
    ],
  },
  {
    id: "af1-2",
    problem: "AF1 poor adhesion on cold substrates",
    category: "adhesion",
    severity: "high",
    causes: [
      "Substrate below 40°F",
      "Moisture or condensation on surface",
    ],
    fixes: [
      "Pre-heat substrate with propane heater",
      "Check moisture meter reading",
      "Wait for dew point clearance",
    ],
    jasonTip: "AF1 can spray down to 30°F ambient, but substrate still needs to be 40°F+ for good adhesion",
  },
  {
    id: "af1-3",
    problem: "AF1 cells not opening properly",
    category: "quality",
    severity: "high",
    causes: [
      "Hose temps too low (below 120°F)",
      "A/B pressure imbalance",
    ],
    fixes: [
      "Raise hose temps to 130-140°F",
      "Balance A/B pressures within 100 PSI",
      "Check for blockages in lines",
    ],
  },
  {
    id: "af1-4",
    problem: "AF1 yield lower than expected",
    category: "yield",
    severity: "medium",
    causes: [
      "Off-ratio at gun",
      "Drum temps uneven between A and B",
      "Hose heat time too short",
    ],
    fixes: [
      "Check ratio at gun with cup test",
      "Verify both drums at 70-90°F",
      "Extend hose heat time before spraying",
    ],
  },
];

const EASYSEAL_R_VALUES = [
  { thickness: '2"', rValue: "R-7.6" },
  { thickness: '3.5"', rValue: "R-13.3" },
  { thickness: '3.625"', rValue: "R-13.8" },
  { thickness: '5.5"', rValue: "R-20.9" },
  { thickness: '6"', rValue: "R-22.8" },
  { thickness: '7.25"', rValue: "R-27.6" },
];

const AF1_R_VALUES = [
  { thickness: '2"', rValue: "R-7.4" },
  { thickness: '3"', rValue: "R-11.1" },
  { thickness: '3.5"', rValue: "R-13.0" },
  { thickness: '4"', rValue: "R-14.8" },
  { thickness: '5"', rValue: "R-18.5" },
  { thickness: '5.5"', rValue: "R-20.4" },
  { thickness: '6"', rValue: "R-22.2" },
  { thickness: '7.25"', rValue: "R-26.8" },
];

const EASYSEAL_CERTIFICATIONS = ["IAPMO QCC", "UL Certified", "ENERGY STAR", "MasterSpec", "DrJ"];
const AF1_CERTIFICATIONS = ["GREENGUARD GOLD (UL)", "A.I.R. Seal of Excellence", "ESR-5255", "ER-0842", "CCRR-0487"];

const EASYSEAL_EQUIPMENT = [
  "Graco Reactor A-25",
  "Graco Reactor E-20",
  "Graco Reactor E-30",
  "Graco Reactor H-30",
  "Graco Reactor H-40",
  "Graco Reactor H-50",
];

const AF1_EQUIPMENT = [
  "Graco Reactor E-30",
  "Graco Reactor E-20",
  "Graco Reactor H-30",
  "Graco Reactor H-40",
  "Graco Reactor H-50",
  "Other proportioners",
];

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/40 uppercase tracking-wider flex-shrink-0 mr-4 pt-0.5">{label}</span>
      <span className="text-sm text-white text-right">{value}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] text-white/30 uppercase tracking-widest mb-3 font-medium">
      {children}
    </div>
  );
}

function FoamSystemToggle({
  system,
  onToggle,
}: {
  system: FoamSystem;
  onToggle: (s: FoamSystem) => void;
}) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/3 border border-white/10">
      <button
        onClick={() => onToggle("easyseal")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          system === "easyseal"
            ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
            : "text-white/40 hover:text-white/60"
        }`}
      >
        Enverge EasySeal .5
      </button>
      <button
        onClick={() => onToggle("af1")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          system === "af1"
            ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25"
            : "text-white/40 hover:text-white/60"
        }`}
      >
        AccuFoam AF1
      </button>
    </div>
  );
}

export function SpecsTab({ system }: { system: FoamSystem }) {
  const isAF1 = system === "af1";
  const accentText = isAF1 ? "text-cyan-400" : "text-blue";
  const accentBg = isAF1 ? "bg-cyan-500/10" : "bg-blue/10";
  const accentBorder = isAF1 ? "border-cyan-500/20" : "border-blue/20";
  const accentDot = isAF1 ? "bg-cyan-500" : "bg-blue";
  const certifications = isAF1 ? AF1_CERTIFICATIONS : EASYSEAL_CERTIFICATIONS;
  const equipment = isAF1 ? AF1_EQUIPMENT : EASYSEAL_EQUIPMENT;
  const rValues = isAF1 ? AF1_R_VALUES : EASYSEAL_R_VALUES;

  return (
    <div className="space-y-6">
      {/* Two-column header */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Official Specs */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${accentDot}`} />
            <SectionLabel>{isAF1 ? "Official AccuFoam Specs" : "Official Enverge Specs"}</SectionLabel>
          </div>
          <div className="mb-1">
            <div className="text-base font-semibold text-white">
              {isAF1 ? "AccuFoam Formula 1 (AF1)" : "Enverge EasySeal .5"}
            </div>
            <div className="text-xs text-white/40 mt-0.5">
              {isAF1
                ? "Open Cell SPF — Highest-yielding OC foam · Creative Polymer Solutions, Birmingham AL"
                : "Open Cell Spray Polyurethane Foam"}
            </div>
          </div>
          <div className="mt-4 space-y-0">
            {isAF1 ? (
              <>
                <SpecRow label="Type" value="Open cell, 0.40-0.45 lb/ft³ (ultra low density)" />
                <SpecRow label="R-Value" value="R-3.7 per inch" />
                <SpecRow label="Mix Ratio" value="1:1 by volume" />
                <SpecRow label="Chemistry" value="Solution-based — no mixing, just heat and spray" />
                <SpecRow label="Blowing Agent" value="100% water blown, zero ODP" />
                <SpecRow label="Formula" value="One year-round formula (no seasonal changes)" />
                <SpecRow label="Yield" value="20,000 BF/set" />
                <SpecRow label="Max Thickness" value="6in/pass (8in with ignition barrier)" />
                <SpecRow label="STC / NRC" value="STC 38 / NRC 0.55" />
                <SpecRow label="Fire Rating" value="Flame spread <25, smoke <450, Class-1" />
                <SpecRow label="Re-Entry" value="1hr (10 ACH workers), 2hr (public) — ASTM D8445" />
                <SpecRow label="Storage" value="60-90°F, 6-month shelf life" />
              </>
            ) : (
              <>
                <SpecRow label="Type" value="Open cell, 0.5 lb/ft³ density" />
                <SpecRow label="R-Value" value="R-3.8 per inch" />
                <SpecRow label="Open Cell Content" value=">90%" />
                <SpecRow label="Mix Ratio" value="1:1 by volume" />
                <SpecRow label="Chemistry" value="Two-component polyurethane (MDI + polyol resin blend)" />
              </>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {certifications.map((cert) => (
              <span
                key={cert}
                className={`text-[10px] px-2 py-1 rounded-md ${accentBg} ${accentText} border ${accentBorder}`}
              >
                {cert}
              </span>
            ))}
          </div>
        </div>

        {/* Jason's Settings — highlighted card */}
        <div className="glass-card p-5 border border-orange/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-orange/10 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-orange" />
            <SectionLabel>Your Proven Settings</SectionLabel>
          </div>
          <div className="text-sm font-medium text-orange mb-1">
            {isAF1 ? "Tulsa, OK — Year-Round Starting Point" : "Tulsa, OK — Spring (April-May)"}
          </div>
          <div className="text-xs text-white/40 mb-4">
            Graco E-30 · {isAF1 ? "AccuFoam AF1" : "EasySeal .5"}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {(isAF1
              ? [
                  { label: "Hose A", value: "130°F" },
                  { label: "Hose B", value: "130°F" },
                  { label: "Drum A", value: "80°F" },
                  { label: "Drum B", value: "80°F" },
                ]
              : [
                  { label: "Hose A", value: "145°F" },
                  { label: "Hose B", value: "145°F" },
                  { label: "Drum A", value: "95°F" },
                  { label: "Drum B", value: "100°F" },
                ]
            ).map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-orange/10 border border-orange/15 p-3 text-center"
              >
                <div className="text-[10px] text-orange/60 uppercase tracking-wider">{s.label}</div>
                <div className="text-xl font-bold text-orange mt-1">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            {(isAF1
              ? [
                  "AF1 runs cooler than EasySeal — 120-140°F hose range",
                  "Drums at 70-90°F, no pre-heat to 95°F needed",
                  "One formula year-round — no seasonal product swaps",
                ]
              : [
                  "145°F is within Enverge\u2019s 120-150°F approved range",
                  "Drum temps match Enverge recommended pre-heat of 95°F",
                  "These are proven starting points — adjust for conditions",
                ]
            ).map((note, i) => (
              <div key={i} className="text-xs text-white/40 flex items-start gap-2">
                <span className="text-orange mt-0.5 text-xs flex-shrink-0">&#9679;</span>
                {note}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Processing Parameters */}
      <div className="glass-card p-5">
        <SectionLabel>Official Processing Parameters</SectionLabel>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(isAF1
            ? [
                { label: "Ambient Temp Range", value: "30 – 120°F", note: "AccuFoam spec (wider than EasySeal)" },
                { label: "Max Relative Humidity", value: "85%", note: "AccuFoam spec" },
                { label: "Max Substrate Moisture", value: "19%", note: "AccuFoam spec" },
                { label: "Drum Pre-heat Temp", value: "70 – 90°F", note: "AccuFoam spec" },
                { label: "Hose / Pre-heater Temp", value: "120 – 140°F", note: "AccuFoam spec" },
                { label: "Dynamic Pressure", value: "1,100 – 1,400 PSI", note: "AccuFoam spec" },
                { label: "A/B Pressure Balance", value: "Within 100 PSI", note: "Of each other" },
                { label: "Max Lift Thickness", value: "6in (8in w/ barrier)", note: "Per pass" },
              ]
            : [
                { label: "Ambient Temp Range", value: "40 – 120°F", note: "Enverge spec" },
                { label: "Max Relative Humidity", value: "85%", note: "Enverge spec" },
                { label: "Max Substrate Moisture", value: "18%", note: "Enverge spec" },
                { label: "Drum Pre-heat Temp", value: "95°F", note: "Enverge spec" },
                { label: "Proportioner / Hose Temp", value: "120 – 150°F", note: "Enverge spec" },
                { label: "Dynamic Pressure", value: "1,000 – 1,400 PSI", note: "Enverge spec" },
                { label: "A/B Pressure Balance", value: "Within 100-200 PSI", note: "Of each other" },
              ]
          ).map((p) => (
            <div key={p.label} className="rounded-xl bg-white/3 border border-white/5 p-4">
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{p.label}</div>
              <div className="text-base font-semibold text-white">{p.value}</div>
              <div className="text-[10px] text-white/20 mt-1">{p.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* R-Value Table + Equipment side by side */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* R-Value Reference */}
        <div className="glass-card p-5">
          <SectionLabel>R-Value Reference</SectionLabel>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-[10px] text-white/30 uppercase tracking-wider pb-2">Thickness</th>
                <th className="text-right text-[10px] text-white/30 uppercase tracking-wider pb-2">R-Value</th>
                <th className="text-right text-[10px] text-white/30 uppercase tracking-wider pb-2">Visual</th>
              </tr>
            </thead>
            <tbody>
              {rValues.map((row) => {
                const num = parseFloat(row.rValue.replace("R-", ""));
                const pct = Math.round((num / 28) * 100);
                const barColor = isAF1 ? "bg-cyan-400/60" : "bg-orange/60";
                const valueColor = isAF1 ? "text-cyan-400" : "text-orange";
                return (
                  <tr key={row.thickness} className="border-b border-white/5">
                    <td className="py-2.5 text-white font-medium">{row.thickness}</td>
                    <td className={`py-2.5 text-right font-semibold ${valueColor}`}>{row.rValue}</td>
                    <td className="py-2.5 pl-4">
                      <div className="h-1.5 rounded-full bg-white/5 w-20 ml-auto overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Compatible Equipment */}
        <div className="glass-card p-5">
          <SectionLabel>Compatible Equipment</SectionLabel>
          <div className="space-y-2 mb-4">
            {equipment.map((eq) => {
              const isJasons = eq === "Graco Reactor E-30";
              return (
                <div
                  key={eq}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                    isJasons ? "bg-orange/10 border border-orange/20" : "bg-white/3 border border-white/5"
                  }`}
                >
                  <span className={`text-sm ${isJasons ? "text-orange" : "text-white/70"}`}>{eq}</span>
                  {isJasons && (
                    <span className="text-[10px] text-orange/70 uppercase tracking-wider">Your Unit</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="rounded-xl bg-white/3 border border-white/5 p-3">
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Your Machine</div>
            <div className="text-sm text-white font-medium">Graco Reactor E-30</div>
            <div className="text-xs text-white/40 mt-0.5">
              Electric heat · Proportioner · Graco approved for {isAF1 ? "AccuFoam AF1" : "EasySeal .5"}
            </div>
          </div>

          {/* AF1 extra info cards */}
          {isAF1 && (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-cyan-500/8 border border-cyan-500/15 p-3">
                <div className="text-[10px] text-cyan-400/60 uppercase tracking-wider mb-1">AF1 Substrates</div>
                <div className="text-xs text-white/60">Walls, Rooflines, Metal buildings, Attics, Underfloors</div>
              </div>
              <div className="rounded-xl bg-cyan-500/8 border border-cyan-500/15 p-3">
                <div className="text-[10px] text-cyan-400/60 uppercase tracking-wider mb-1">Year-Round Advantage</div>
                <div className="text-xs text-white/60">One formula all seasons — no winter/summer blend swaps. Just heat and spray.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ color }: { color: "green" | "amber" | "red" }) {
  const config = {
    green: {
      bg: "bg-green-500/15",
      border: "border-green-500/25",
      dot: "bg-green-500",
      text: "text-green-400",
      label: "GO",
    },
    amber: {
      bg: "bg-yellow-500/15",
      border: "border-yellow-500/25",
      dot: "bg-yellow-500",
      text: "text-yellow-400",
      label: "CAUTION",
    },
    red: {
      bg: "bg-red-500/15",
      border: "border-red-500/25",
      dot: "bg-red-500",
      text: "text-red-400",
      label: "STOP",
    },
  }[color];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${config.bg} ${config.border} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function ApplicationRulesTab({ system }: { system: FoamSystem }) {
  const isAF1 = system === "af1";

  const conditions = isAF1
    ? [
        {
          color: "green" as const,
          title: "GO Conditions",
          items: [
            { name: "Ambient Temp", value: "50-100°F (ideal)" },
            { name: "Substrate Temp", value: "50-100°F" },
            { name: "Humidity", value: "< 70% RH" },
            { name: "Substrate Moisture", value: "< 15%" },
            { name: "Dew Margin", value: "15°F+ above dew point" },
          ],
        },
        {
          color: "amber" as const,
          title: "CAUTION Conditions",
          items: [
            { name: "Ambient Temp", value: "30-50°F or 100-110°F" },
            { name: "Humidity", value: "70-85% RH" },
            { name: "Dew Margin", value: "10-15°F" },
            { name: "Substrate Moisture", value: "15-19%" },
          ],
        },
        {
          color: "red" as const,
          title: "STOP Conditions",
          items: [
            { name: "Ambient Temp", value: "< 30°F or > 120°F" },
            { name: "Humidity", value: "> 85%" },
            { name: "Substrate Moisture", value: "> 19%" },
            { name: "Dew Margin", value: "< 10°F" },
          ],
        },
      ]
    : [
        {
          color: "green" as const,
          title: "GO Conditions",
          items: [
            { name: "Ambient Temp", value: "60-90°F (ideal)" },
            { name: "Substrate Temp", value: "60-90°F" },
            { name: "Humidity", value: "40-70% RH" },
            { name: "Substrate Moisture", value: "< 15%" },
            { name: "Dew Margin", value: "15°F+ above dew point" },
          ],
        },
        {
          color: "amber" as const,
          title: "CAUTION Conditions",
          items: [
            { name: "Ambient Temp", value: "40-60°F or 90-100°F" },
            { name: "Humidity", value: "70-85% RH" },
            { name: "Dew Margin", value: "10-15°F" },
            { name: "Substrate Moisture", value: "15-18%" },
          ],
        },
        {
          color: "red" as const,
          title: "STOP Conditions",
          items: [
            { name: "Ambient Temp", value: "< 40°F or > 120°F" },
            { name: "Humidity", value: "> 85%" },
            { name: "Substrate Moisture", value: "> 18%" },
            { name: "Dew Margin", value: "< 10°F" },
          ],
        },
      ];

  const borderMap = {
    green: "border-green-500/20",
    amber: "border-yellow-500/20",
    red: "border-red-500/20",
  };

  const bgMap = {
    green: "bg-green-500/5",
    amber: "bg-yellow-500/5",
    red: "bg-red-500/5",
  };

  const valueBg = {
    green: "bg-green-500/10 text-green-300",
    amber: "bg-yellow-500/10 text-yellow-300",
    red: "bg-red-500/10 text-red-300",
  };

  const substratePrep = isAF1
    ? [
        "Surface must be clean, dry, and free of oil, grease, and dust",
        "Metal: remove rust, scale, or mill scale — clean bare metal required",
        "Wood: max 19% moisture content — check with moisture meter",
        "Concrete/masonry: must be dry, no efflorescence or active moisture",
        "Temperature: substrate must be at least 40°F (warmer is better)",
      ]
    : [
        "Surface must be clean, dry, and free of oil, grease, and dust",
        "Metal: remove rust, scale, or mill scale — clean bare metal required",
        "Wood: max 18% moisture content — check with moisture meter",
        "Concrete/masonry: must be dry, no efflorescence or active moisture",
        "Temperature: substrate must be at least 50°F (warmer is better)",
      ];

  const liftGuidelines = isAF1
    ? [
        "Max 6in per pass (standard application)",
        "Up to 8in per pass with ignition barrier installed",
        "Ultra low density (0.40-0.45 pcf) = less exothermic than higher density OC foams",
      ]
    : [
        "Open cell: can spray thick in one pass (less exothermic than closed cell)",
        "Typical single pass: up to full cavity depth",
        "Watch for high ambient temp + thick lift = potential overheating in tight spaces",
      ];

  const accentText = isAF1 ? "text-cyan-400" : "text-blue";
  const accentBg = isAF1 ? "bg-cyan-500/10" : "bg-blue/10";
  const accentBorder = isAF1 ? "border-cyan-500/20" : "border-blue/20";
  const brandName = isAF1 ? "AccuFoam" : "Enverge";

  return (
    <div className="space-y-6">
      {/* AF1 wider range callout */}
      {isAF1 && (
        <div className="glass-card p-4 border border-cyan-500/20 bg-cyan-500/5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-white">Wider Operating Range</div>
            <div className="text-xs text-white/40 mt-0.5">
              AF1 sprays down to 30°F ambient (vs 40°F for EasySeal). More spray days in cold weather = more revenue.
            </div>
          </div>
        </div>
      )}

      {/* Conditions grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {conditions.map((c) => (
          <div
            key={c.color}
            className={`glass-card p-5 border ${borderMap[c.color]} ${bgMap[c.color]}`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-white">{c.title}</span>
              <StatusBadge color={c.color} />
            </div>
            <div className="space-y-2">
              {c.items.map((item) => (
                <div key={item.name} className="flex justify-between items-center gap-2">
                  <span className="text-xs text-white/40">{item.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${valueBg[c.color]}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Substrate Prep + Lift Thickness */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <SectionLabel>Substrate Prep Rules</SectionLabel>
          <p className="text-xs text-white/30 mb-3">From {brandName} documentation</p>
          <ul className="space-y-2.5">
            {substratePrep.map((rule, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-white/70">
                <span className={`w-5 h-5 rounded-full ${accentBg} border ${accentBorder} ${accentText} text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold`}>
                  {i + 1}
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-5">
          <SectionLabel>Lift Thickness Guidelines</SectionLabel>
          <p className="text-xs text-white/30 mb-3">{isAF1 ? "AF1 specific — max 6in/pass" : "Open cell specific"}</p>
          <ul className="space-y-3">
            {liftGuidelines.map((g, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-white/70">
                <span className="text-orange mt-0.5 text-xs flex-shrink-0">&#9679;</span>
                {g}
              </li>
            ))}
          </ul>

          <div className={`mt-4 rounded-xl ${isAF1 ? "bg-cyan-500/8 border-cyan-500/15" : "bg-orange/8 border-orange/15"} border p-3`}>
            <div className={`text-[10px] ${isAF1 ? "text-cyan-400/70" : "text-orange/70"} uppercase tracking-wider mb-1`}>
              {isAF1 ? "AF1 Advantage" : "Open Cell Advantage"}
            </div>
            <div className="text-xs text-white/60">
              {isAF1
                ? "AF1's ultra-low density (0.40-0.45 pcf) produces less heat per pass than standard 0.5 pcf OC foams. Up to 8in with ignition barrier."
                : "EasySeal .5 can typically fill an entire cavity in one pass without the overheating concerns of closed cell foam. Less monitoring needed compared to 2lb closed cell in thick applications."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TroubleshootingTab({ system, initialSearch }: { system: FoamSystem; initialSearch?: string }) {
  const isAF1 = system === "af1";
  const EXTRA_DIAGNOSTICS = isAF1 ? AF1_DIAGNOSTICS : EASYSEAL_DIAGNOSTICS;
  const systemLabel = isAF1 ? "AF1" : "EasySeal";

  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch || "");
  const [source, setSource] = useState<"all" | "db" | "system">("all");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initialSearch) setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    fetch("/api/diagnostics")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setDiagnostics(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  type DiagItem = {
    id: string;
    problem: string;
    category: string;
    severity: string;
    causes: string[];
    fixes: string[];
    isExtra: boolean;
    context?: string;
    jasonTip?: string;
  };

  const allItems: DiagItem[] = [
    ...diagnostics.map((d) => ({ ...d, isExtra: false, context: undefined, jasonTip: undefined })),
    ...EXTRA_DIAGNOSTICS.map((d) => ({ ...d, isExtra: true })),
  ];

  const filtered = allItems.filter((d) => {
    const matchesSearch = `${d.problem} ${(d.causes || []).join(" ")} ${(d.fixes || []).join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesSource =
      source === "all" ||
      (source === "db" && !d.isExtra) ||
      (source === "system" && d.isExtra);
    return matchesSearch && matchesSource;
  });

  const severityConfig: Record<string, { bg: string; text: string }> = {
    high: { bg: "bg-red-500/15", text: "text-red-400" },
    medium: { bg: "bg-yellow-500/15", text: "text-yellow-400" },
    med: { bg: "bg-yellow-500/15", text: "text-yellow-400" },
    low: { bg: "bg-blue/15", text: "text-blue" },
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  const extraBorder = isAF1 ? "border border-cyan-500/15" : "border border-orange/15";
  const extraBadgeBg = isAF1 ? "bg-cyan-500/15" : "bg-orange/15";
  const extraBadgeText = isAF1 ? "text-cyan-400" : "text-orange";
  const extraBadgeBorder = isAF1 ? "border-cyan-500/20" : "border-orange/20";
  const activeFilterBg = isAF1 ? "bg-cyan-500/20" : "bg-orange/20";
  const activeFilterText = isAF1 ? "text-cyan-400" : "text-orange";
  const activeFilterBorder = isAF1 ? "border-cyan-500/30" : "border-orange/30";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search problems, causes, fixes..."
          className="input-field flex-1 min-w-[200px]"
        />
        <div className="flex gap-2">
          {[
            { id: "all" as const, label: "All" },
            { id: "db" as const, label: "General DB" },
            { id: "system" as const, label: `${systemLabel}-Specific` },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSource(opt.id)}
              className={`px-3 py-2 rounded-xl text-xs transition-all whitespace-nowrap ${
                source === opt.id
                  ? `${activeFilterBg} ${activeFilterText} border ${activeFilterBorder}`
                  : "bg-white/5 text-white/40 border border-white/10"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-white/30">
        {filtered.length} diagnostic{filtered.length !== 1 ? "s" : ""} · {EXTRA_DIAGNOSTICS.length} {systemLabel}-specific
      </div>

      {loading ? (
        <div className="text-white/30 text-sm py-12 text-center">Loading diagnostics...</div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2.5"
        >
          {filtered.map((d) => {
            const sevConfig = severityConfig[d.severity] || { bg: "bg-white/10", text: "text-white/50" };
            const isExpanded = expanded === d.id;
            return (
              <motion.div
                key={d.id}
                variants={item}
                className={`glass-card overflow-hidden ${d.isExtra ? extraBorder : ""}`}
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : d.id)}
                  className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-white/3 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="text-white text-sm font-medium">{d.problem}</span>
                      {d.isExtra && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${extraBadgeBg} ${extraBadgeText} border ${extraBadgeBorder} flex-shrink-0`}>
                          {systemLabel}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/40 capitalize">
                        {d.category}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${sevConfig.bg} ${sevConfig.text}`}>
                        {d.severity}
                      </span>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-white/30 transition-transform flex-shrink-0 mt-1 ${isExpanded ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                        <div>
                          <h4 className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Causes</h4>
                          <ul className="space-y-1.5">
                            {(Array.isArray(d.causes) ? d.causes : [d.causes]).map((cause, i) => (
                              <li key={i} className="text-sm text-white/65 flex items-start gap-2">
                                <span className="text-orange mt-1 text-[10px] flex-shrink-0">&#9679;</span>
                                {cause}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Fixes</h4>
                          <ul className="space-y-1.5">
                            {(Array.isArray(d.fixes) ? d.fixes : [d.fixes]).map((fix, i) => (
                              <li key={i} className="text-sm text-white/65 flex items-start gap-2">
                                <span className="text-green-400 mt-1 text-[10px] flex-shrink-0">&#9679;</span>
                                {fix}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {d.context && (
                          <div className={`rounded-xl ${isAF1 ? "bg-cyan-500/8 border-cyan-500/15" : "bg-blue/8 border-blue/15"} border p-3`}>
                            <div className={`text-[10px] ${isAF1 ? "text-cyan-400/60" : "text-blue/60"} uppercase tracking-wider mb-1`}>
                              {systemLabel} Context
                            </div>
                            <div className="text-xs text-white/60">{d.context}</div>
                          </div>
                        )}

                        {d.jasonTip && (
                          <div className="rounded-xl bg-orange/8 border border-orange/15 p-3">
                            <div className="text-[10px] text-orange/60 uppercase tracking-wider mb-1">Jason&apos;s Tip</div>
                            <div className="text-xs text-white/60">&ldquo;{d.jasonTip}&rdquo;</div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

function SeasonCard({
  season,
  isActive,
  system,
}: {
  season: {
    label: string;
    badge?: string;
    desc: string;
    ambientRange: string;
    items: { label: string; value: string }[];
    tip?: string;
    tipLabel?: string;
    tipColor?: "orange" | "blue" | "green" | "yellow" | "cyan";
    advantage?: string;
  };
  isActive?: boolean;
  system: FoamSystem;
}) {
  const isAF1 = system === "af1";
  const tipColorMap = {
    orange: { bg: "bg-orange/8", border: "border-orange/15", label: "text-orange/60" },
    blue: { bg: "bg-blue/8", border: "border-blue/15", label: "text-blue/60" },
    green: { bg: "bg-green-500/8", border: "border-green-500/15", label: "text-green-400/70" },
    yellow: { bg: "bg-yellow-500/8", border: "border-yellow-500/15", label: "text-yellow-400/70" },
    cyan: { bg: "bg-cyan-500/8", border: "border-cyan-500/15", label: "text-cyan-400/70" },
  };
  const tc = tipColorMap[season.tipColor || "blue"];
  const activeBorder = isAF1 ? "border border-cyan-500/30" : "border border-orange/30";
  const activeBadgeBg = isAF1 ? "bg-cyan-500/20" : "bg-orange/20";
  const activeBadgeText = isAF1 ? "text-cyan-400" : "text-orange";
  const activeBadgeBorder = isAF1 ? "border-cyan-500/30" : "border-orange/30";

  return (
    <div className={`glass-card p-5 ${isActive ? activeBorder : ""}`}>
      {isActive && (
        <div className="absolute top-3 right-3">
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeBadgeBg} ${activeBadgeText} border ${activeBadgeBorder} uppercase tracking-wider`}>
            Current
          </span>
        </div>
      )}
      <div className="mb-4">
        <div className="text-base font-semibold text-white mb-1">{season.label}</div>
        <div className="text-xs text-white/40">{season.desc}</div>
      </div>

      <div className="rounded-xl bg-white/3 border border-white/5 px-3 py-2.5 mb-4 flex justify-between items-center">
        <span className="text-[10px] text-white/30 uppercase tracking-wider">Avg Ambient</span>
        <span className="text-sm font-semibold text-white">{season.ambientRange}</span>
      </div>

      <div className="space-y-2 mb-4">
        {season.items.map((item) => (
          <div key={item.label} className="flex justify-between items-start gap-2">
            <span className="text-xs text-white/40">{item.label}</span>
            <span className="text-xs text-white/70 text-right max-w-[60%]">{item.value}</span>
          </div>
        ))}
      </div>

      {season.tip && (
        <div className={`rounded-xl ${tc.bg} border ${tc.border} p-3 ${season.advantage ? "mb-3" : ""}`}>
          <div className={`text-[10px] uppercase tracking-wider mb-1 ${tc.label}`}>{season.tipLabel || "Watch"}</div>
          <div className="text-xs text-white/60">{season.tip}</div>
        </div>
      )}

      {season.advantage && (
        <div className="rounded-xl bg-cyan-500/8 border border-cyan-500/15 p-3">
          <div className="text-[10px] text-cyan-400/70 uppercase tracking-wider mb-1">AF1 Advantage</div>
          <div className="text-xs text-white/60">{season.advantage}</div>
        </div>
      )}
    </div>
  );
}

export function SeasonalTab({ system }: { system: FoamSystem }) {
  const isAF1 = system === "af1";

  const easysealSeasons = [
    {
      label: "Spring (March-May)",
      desc: "Current season · Tulsa, OK",
      ambientRange: "55-80°F",
      items: [
        { label: "Starting Hose Temp", value: "145°F" },
        { label: "Drum A", value: "95°F" },
        { label: "Drum B", value: "100°F" },
        { label: "Common Issues", value: "Humidity spikes, morning dew on metal" },
      ],
      tip: "Thunderstorm season = humidity can spike to 80%+ rapidly. Check conditions before each job.",
      tipLabel: "Watch",
      tipColor: "orange" as const,
    },
    {
      label: "Summer (June-August)",
      desc: "Hardest season · Heat management critical",
      ambientRange: "85-105°F",
      items: [
        { label: "Hose Temp Adjustment", value: "Drop to 125-130°F" },
        { label: "Spray Window", value: "Early morning before 10am" },
        { label: "Metal Buildings", value: "West walls AM · East walls PM" },
        { label: "Hard Stop", value: "Avoid ambient > 100°F if possible" },
      ],
      tip: "Metal building substrate temps can hit 140°F+. Always touch metal before you spray — if it burns, it's too hot.",
      tipLabel: "Danger",
      tipColor: "yellow" as const,
    },
    {
      label: "Fall (September-November)",
      desc: "Best season · Ideal conditions",
      ambientRange: "50-75°F",
      items: [
        { label: "Season Quality", value: "Ideal temp and humidity range" },
        { label: "Cold Front Risk", value: "Temps can drop 30°F overnight" },
        { label: "Adjustment", value: "Bump drum temps up as fall progresses" },
        { label: "Productivity", value: "Best spray days of the year" },
      ],
      tip: "Cold fronts in October can drop temps fast. Check the 3-day forecast before staging a job.",
      tipLabel: "Cold Front Watch",
      tipColor: "blue" as const,
    },
    {
      label: "Winter (December-February)",
      desc: "Challenging · Pre-heating required",
      ambientRange: "20-50°F",
      items: [
        { label: "Below 40°F Rule", value: "Must preheat building and substrate" },
        { label: "Drum Storage", value: "Keep at 50-80°F minimum" },
        { label: "Hose Temp", value: "May need 145-150°F to compensate" },
        { label: "Drum Risk", value: "Never leave drums in cold trailer overnight" },
      ],
      tip: "Substrate condensation from heating a cold building is a real issue. Heat slowly and check dew point carefully.",
      tipLabel: "Watch",
      tipColor: "blue" as const,
    },
  ];

  const af1Seasons = [
    {
      label: "Spring (March-May)",
      desc: "Sweet spot · Tulsa, OK",
      ambientRange: "55-80°F",
      items: [
        { label: "Hose Temp", value: "125-135°F" },
        { label: "Drum Temps", value: "70-85°F" },
        { label: "Common Issues", value: "Thunderstorm humidity spikes" },
        { label: "Productivity", value: "Excellent spray conditions" },
      ],
      tip: "Watch thunderstorm humidity spikes — can jump 20%+ in an hour. Check conditions before each job.",
      tipLabel: "Watch",
      tipColor: "cyan" as const,
      advantage: "Year-round formula means no seasonal product swaps needed.",
    },
    {
      label: "Summer (June-August)",
      desc: "Heat management · Drop hose temps",
      ambientRange: "85-105°F",
      items: [
        { label: "Hose Temp Adjustment", value: "Drop to 120-125°F" },
        { label: "Spray Window", value: "Before 10am on hot days" },
        { label: "Metal Substrates", value: "Can hit 140°F+ in sun" },
        { label: "Drum Temps", value: "Keep 70-80°F, don't overheat" },
      ],
      tip: "Metal substrates in direct sun can exceed 140°F. Touch-test before spraying.",
      tipLabel: "Danger",
      tipColor: "yellow" as const,
      advantage: "Same formula year-round — no summer blend needed.",
    },
    {
      label: "Fall (September-November)",
      desc: "Best season · Standard settings",
      ambientRange: "50-75°F",
      items: [
        { label: "Season Quality", value: "Best conditions of the year" },
        { label: "Settings", value: "Standard — hose 125-135°F" },
        { label: "Cold Front Risk", value: "Temps can drop 30°F overnight" },
        { label: "Productivity", value: "Peak spray days" },
      ],
      tip: "Watch cold fronts. Standard settings work well all season.",
      tipLabel: "Cold Front Watch",
      tipColor: "blue" as const,
      advantage: "No seasonal formulation concerns. Standard settings all season.",
    },
    {
      label: "Winter (December-February)",
      desc: "Competitive edge · 30°F minimum",
      ambientRange: "20-50°F",
      items: [
        { label: "Min Ambient", value: "30°F (vs 40°F for EasySeal)" },
        { label: "Drum Storage", value: "Must stay 60-90°F" },
        { label: "Hose Temp", value: "135-140°F" },
        { label: "Pre-heat Rule", value: "Heat building if substrate < 40°F" },
      ],
      tip: "AF1's 30°F ambient minimum gives you a competitive edge in winter. You can spray when EasySeal crews can't.",
      tipLabel: "Competitive Edge",
      tipColor: "cyan" as const,
      advantage: "30°F minimum ambient vs 40°F for most OC foams — more spray days in winter.",
    },
  ];

  const seasons = isAF1 ? af1Seasons : easysealSeasons;

  return (
    <div className="space-y-6">
      <div className={`glass-card p-4 ${isAF1 ? "border-cyan-500/15" : "border-orange/15"} border flex items-start gap-3`}>
        <div className={`w-8 h-8 rounded-lg ${isAF1 ? "bg-cyan-500/15" : "bg-orange/15"} flex items-center justify-center flex-shrink-0`}>
          <svg className={`w-4 h-4 ${isAF1 ? "text-cyan-400" : "text-orange"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-medium text-white">
            Tulsa, OK Market Guide {isAF1 ? "— AF1 Year-Round Formula" : ""}
          </div>
          <div className="text-xs text-white/40 mt-0.5">
            {isAF1
              ? "AF1 uses one formula year-round — no seasonal product changes needed. Adjust temps only."
              : "Seasonal conditions specific to Tulsa, Oklahoma. Adjust for job sites outside this region."}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {seasons.map((s, i) => (
          <div key={s.label} className="relative">
            <SeasonCard season={s} isActive={i === 0} system={system} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState("specs");
  const [system, setSystem] = useState<FoamSystem>("easyseal");

  const isAF1 = system === "af1";
  const tabs = getTabs(system);

  const container = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-medium text-white">Knowledge Base</h2>
          <p className="text-sm text-white/40 mt-1">
            {isAF1
              ? "AccuFoam AF1 reference · Creative Polymer Solutions specs · Tulsa field guide"
              : "EasySeal .5 reference manual · Enverge specs · Tulsa field guide"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-1 rounded-full ${isAF1 ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-blue/10 text-blue border-blue/20"} border uppercase tracking-wider`}>
            {isAF1 ? "AccuFoam AF1" : "Enverge EasySeal .5"}
          </span>
          <span className="text-[10px] px-2 py-1 rounded-full bg-orange/10 text-orange border border-orange/20 uppercase tracking-wider">
            Graco E-30
          </span>
        </div>
      </div>

      {/* Foam System Toggle */}
      <FoamSystemToggle system={system} onToggle={setSystem} />

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-white/5 overflow-x-auto">
        {tabs.map((tab) => {
          const activeStyle = isAF1
            ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
            : "bg-orange/15 text-orange border border-orange/20";
          return (
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
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${system}-${activeTab}`}
          variants={container}
          initial="hidden"
          animate="show"
        >
          {activeTab === "specs" && <SpecsTab system={system} />}
          {activeTab === "rules" && <ApplicationRulesTab system={system} />}
          {activeTab === "troubleshoot" && <TroubleshootingTab system={system} />}
          {activeTab === "seasonal" && <SeasonalTab system={system} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
