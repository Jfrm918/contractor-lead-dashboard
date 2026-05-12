"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Fusion AP Parts Data ──

interface GunPart {
  id: string;
  name: string;
  description: string;
  partNumbers?: string[];
  orings?: { size: string; location: string; qty: number }[];
  tips?: string[];
  category: "front" | "chamber" | "body" | "rear" | "accessory";
}

const FUSION_AP_PARTS: GunPart[] = [
  {
    id: "front-cap",
    name: "Hand Tightened Front Cap",
    description: "Secures the mix chamber and side seals in place. Hand-tighten only — no tools needed for removal during cleaning or seal changes.",
    tips: [
      "If it's hard to remove, soak the front end in solvent",
      "Don't overtighten — hand tight is enough",
      "Check the threads for foam buildup every rebuild",
    ],
    category: "front",
  },
  {
    id: "side-seals",
    name: "Durable Side Seals",
    description: "Rugged stainless steel or PolyCarbolloy construction. These seal the mix chamber from the fluid housing and prevent cross-contamination between A and B sides.",
    partNumbers: ["246453 (standard)", "24W587 (Chrome-X coated)"],
    orings: [
      { size: "O-ring #112", location: "Outer groove on each side seal", qty: 2 },
      { size: "O-ring #012", location: "Inner groove on each side seal", qty: 2 },
    ],
    tips: [
      "Most common rebuild part — check these first if you see off-ratio",
      "Chrome-X coated last 2-3x longer",
      "Replace o-rings every time you pull the seals",
      "Lube o-rings with Graco TSL before installing",
    ],
    category: "front",
  },
  {
    id: "mix-chamber",
    name: "Cyclone-Mix\u2122 Chamber",
    description: "Precision machined, hardened stainless steel. This is where A and B components mix. The cyclone design creates a swirl pattern for thorough mixing.",
    partNumbers: ["246627 (standard)", "24W588 (Chrome-X coated)"],
    tips: [
      "Inspect bore for scoring — even small scratches cause off-ratio",
      "Chrome-X version is worth the upgrade if you spray daily",
      "Clean immediately after use — don't let foam cure inside",
      "If foam cures in it, soak in solvent overnight before trying to clear",
    ],
    category: "chamber",
  },
  {
    id: "check-valves",
    name: "Check Valves with Screens",
    description: "Cartridge-style check valves with built-in screens. They prevent backflow and filter debris. One for A side, one for B side.",
    partNumbers: ["246351 (A side)", "246352 (B side)"],
    orings: [
      { size: "O-ring #014", location: "Check valve body seal", qty: 2 },
    ],
    tips: [
      "Pull and clean screens every 2-3 sets minimum",
      "Clogged screens = pressure imbalance = off-ratio",
      "Cartridge design — push out from the front with a dowel",
      "Keep spare check valves on the truck — they're cheap insurance",
    ],
    category: "body",
  },
  {
    id: "fluid-housing",
    name: "Quick-Release Fluid Housing",
    description: "The main body that holds the check valves and connects to the hose fittings. Quick-release design lets you swap mix chambers without disconnecting hoses.",
    partNumbers: ["246473"],
    orings: [
      { size: "O-ring #116", location: "Housing to air piston seal", qty: 1 },
      { size: "O-ring #214", location: "A-side inlet port", qty: 1 },
      { size: "O-ring #214", location: "B-side inlet port", qty: 1 },
    ],
    tips: [
      "Quick-release lever — lift and pull forward to remove front assembly",
      "Check inlet port o-rings if you see drips at the hose connections",
      "A-side inlet: -5 JIC, 1/2-20 UNF swivel",
      "B-side inlet: -6 JIC, 9/16-18 UNF swivel",
    ],
    category: "body",
  },
  {
    id: "air-piston",
    name: "Air Piston",
    description: "Powerful on/off actuation. When you pull the trigger, air pressure drives the piston forward to open the check valves and start material flow.",
    partNumbers: ["246474"],
    orings: [
      { size: "O-ring #222", location: "Piston head seal", qty: 1 },
      { size: "O-ring #116", location: "Piston rod seal", qty: 1 },
    ],
    tips: [
      "If trigger feels spongy, check piston o-rings for wear",
      "Air inlet: 1/4 NPT quick disconnect",
      "Max air pressure: 130 PSI",
      "Lube piston o-rings with TSL during rebuild",
    ],
    category: "rear",
  },
  {
    id: "safety-stop",
    name: "Safety Stop",
    description: "Manual on/off safety switch. Locks the trigger so the gun can't fire accidentally. Always engage when not actively spraying.",
    tips: [
      "Always engage before setting gun down",
      "Flick forward to unlock, back to lock",
      "If it's loose or sticky, a drop of TSL fixes it",
    ],
    category: "rear",
  },
  {
    id: "handle",
    name: "Ergonomic Handle",
    description: "Smooth curved handle designed to reduce fatigue during long spray sessions. The trigger pull is light to minimize hand strain.",
    tips: [
      "If the trigger spring feels weak, replace it — part of the rebuild kit",
      "Keep the grip clean — foam buildup makes it slippery",
    ],
    category: "rear",
  },
  {
    id: "flow-cap",
    name: "Variable Flow Cap",
    description: "Accessory cap (Part #25D632) that lets you adjust output from full flow to a limited stream without changing the mix chamber. 10 different flow settings.",
    partNumbers: ["25D632"],
    tips: [
      "Not included with gun — sold separately",
      "Great for detail work and touch-ups",
      "Rotate to adjust flow — click stops at each setting",
      "Settings 1-3 for detail, 7-10 for full production",
    ],
    category: "accessory",
  },
];

const REBUILD_STEPS = [
  { step: 1, title: "Relieve pressure", desc: "Turn off reactor, relieve fluid and air pressure. Engage safety stop." },
  { step: 2, title: "Remove front cap", desc: "Unscrew hand-tightened front cap counterclockwise. No tools needed." },
  { step: 3, title: "Pull side seals", desc: "Slide out both side seals. Note orientation — they go back the same way." },
  { step: 4, title: "Remove mix chamber", desc: "Pull the Cyclone-Mix chamber straight out of the fluid housing." },
  { step: 5, title: "Pull check valves", desc: "Push check valve cartridges out from the front with a dowel or punch." },
  { step: 6, title: "Clean everything", desc: "Clean all parts with Graco solvent. Inspect for scoring, wear, or foam buildup." },
  { step: 7, title: "Replace o-rings", desc: "Replace ALL o-rings on side seals, check valves, and piston. Lube with TSL." },
  { step: 8, title: "Reassemble", desc: "Check valves first → mix chamber → side seals → front cap. Hand-tight only." },
  { step: 9, title: "Test", desc: "Pressurize and test spray into waste. Check for leaks and proper ratio." },
];

const CATEGORY_ORDER = ["front", "chamber", "body", "rear", "accessory"] as const;
const CATEGORY_LABELS: Record<string, string> = {
  front: "Front Assembly",
  chamber: "Mix Chamber",
  body: "Gun Body",
  rear: "Rear / Handle",
  accessory: "Accessories",
};

// ── Photorealistic Gun Diagram (image + hotspot overlays) ──

// Hotspot regions mapped to the Graco Fusion AP exploded-view photograph.
// Coordinates are in the native image space (1280 × 618).
const HOTSPOTS: {
  id: string;
  label: string;
  // polygon points OR rect bounds
  rect?: { x: number; y: number; w: number; h: number };
  poly?: string;
  // callout anchor point (center of the part in the image)
  cx: number;
  cy: number;
}[] = [
  { id: "front-cap",     label: "Front Cap",        rect: { x: 380, y: 8,   w: 120, h: 110 }, cx: 440, cy: 60 },
  { id: "side-seals",    label: "Side Seals",       rect: { x: 520, y: 48,  w: 130, h: 110 }, cx: 585, cy: 100 },
  { id: "check-valves",  label: "Check Valves",     rect: { x: 280, y: 255, w: 160, h: 120 }, cx: 360, cy: 310 },
  { id: "mix-chamber",   label: "Mix Chamber",      rect: { x: 460, y: 365, w: 190, h: 110 }, cx: 555, cy: 420 },
  { id: "fluid-housing", label: "Fluid Housing",    rect: { x: 590, y: 140, w: 290, h: 200 }, cx: 735, cy: 240 },
  { id: "air-piston",    label: "Air Piston",       rect: { x: 920, y: 195, w: 110, h: 130 }, cx: 975, cy: 260 },
  { id: "safety-stop",   label: "Safety Stop",      rect: { x: 1040, y: 240, w: 100, h: 60 },  cx: 1090, cy: 270 },
  { id: "handle",        label: "Handle & Trigger",  rect: { x: 940, y: 370, w: 170, h: 170 }, cx: 1025, cy: 455 },
  { id: "flow-cap",      label: "Variable Flow Cap", rect: { x: 1055, y: 5,  w: 165, h: 155 }, cx: 1138, cy: 80 },
];

function ExplodedDiagram({
  selectedPart,
  onSelectPart,
}: {
  selectedPart: string | null;
  onSelectPart: (id: string | null) => void;
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      {/* The actual Graco product image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/fusion-ap-exploded.jpg"
        alt="Graco Fusion AP Exploded View"
        className="w-full h-auto block"
        draggable={false}
        onClick={() => onSelectPart(null)}
      />

      {/* SVG overlay for interactive hotspots */}
      <svg
        viewBox="0 0 1280 618"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        style={{ pointerEvents: "none" }}
      >
        <defs>
          <filter id="hs-glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {HOTSPOTS.map((hs) => {
          const isSelected = selectedPart === hs.id;
          const part = FUSION_AP_PARTS.find((p) => p.id === hs.id);
          const hasOrings = (part?.orings?.length || 0) > 0;

          if (!hs.rect) return null;
          const { x, y, w, h } = hs.rect;

          return (
            <g
              key={hs.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPart(isSelected ? null : hs.id);
              }}
              className="cursor-pointer"
              style={{ pointerEvents: "all" }}
            >
              {/* Hover/tap region — always present but mostly transparent */}
              <rect
                x={x} y={y} width={w} height={h} rx={12}
                fill={isSelected ? "rgba(249,115,22,0.18)" : "transparent"}
                stroke={isSelected ? "#f97316" : "transparent"}
                strokeWidth={isSelected ? 3 : 0}
                filter={isSelected ? "url(#hs-glow)" : undefined}
                className="transition-all duration-300"
              />

              {/* Subtle border on hover (CSS handles this via the group) */}
              {!isSelected && (
                <rect
                  x={x} y={y} width={w} height={h} rx={12}
                  fill="transparent"
                  stroke="rgba(249,115,22,0.0)"
                  strokeWidth={2}
                  className="transition-all duration-200 hover:stroke-[rgba(249,115,22,0.35)] hover:fill-[rgba(249,115,22,0.06)]"
                  style={{ pointerEvents: "all" }}
                />
              )}

              {/* Corner brackets for selected state */}
              {isSelected && (
                <>
                  {/* Top-left */}
                  <path d={`M${x + 4} ${y + 20} L${x + 4} ${y + 4} L${x + 20} ${y + 4}`} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinecap="round" />
                  {/* Top-right */}
                  <path d={`M${x + w - 20} ${y + 4} L${x + w - 4} ${y + 4} L${x + w - 4} ${y + 20}`} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinecap="round" />
                  {/* Bottom-left */}
                  <path d={`M${x + 4} ${y + h - 20} L${x + 4} ${y + h - 4} L${x + 20} ${y + h - 4}`} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinecap="round" />
                  {/* Bottom-right */}
                  <path d={`M${x + w - 20} ${y + h - 4} L${x + w - 4} ${y + h - 4} L${x + w - 4} ${y + h - 20}`} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinecap="round" />
                </>
              )}

              {/* O-ring indicator */}
              {hasOrings && (
                <>
                  <circle cx={x + w - 10} cy={y + 10} r={7} fill="#ef4444" opacity={0.9} />
                  <circle cx={x + w - 10} cy={y + 10} r={10} fill="none" stroke="#ef4444" strokeWidth={1} opacity={0.4} />
                </>
              )}

              {/* Part label pill */}
              <rect
                x={hs.cx - hs.label.length * 4.2}
                y={y + h + 4}
                width={hs.label.length * 8.4 + 12}
                height={22}
                rx={11}
                fill={isSelected ? "rgba(249,115,22,0.9)" : "rgba(0,0,0,0.65)"}
                className="transition-all duration-200"
              />
              <text
                x={hs.cx + 6}
                y={y + h + 19}
                textAnchor="middle"
                fill={isSelected ? "#fff" : "rgba(255,255,255,0.8)"}
                fontSize={12}
                fontWeight={isSelected ? 700 : 500}
                className="select-none"
              >
                {hs.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Main Component ──

const TAB_META = {
  exploded: { label: "Exploded View", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
  rebuild:  { label: "Rebuild Guide", icon: "M11.42 15.17l-5.1-3.19M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" },
  specs:    { label: "Specs",         icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" },
} as const;

export default function GunReference() {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [tab, setTab] = useState<"exploded" | "rebuild" | "specs">("exploded");

  const activePart = FUSION_AP_PARTS.find((p) => p.id === selectedPart);

  const totalOrings = FUSION_AP_PARTS.reduce(
    (sum, p) => sum + (p.orings || []).reduce((s, o) => s + o.qty, 0), 0
  );

  return (
    <div className="space-y-6">
      {/* ── Hero Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fd-command-hero shimmer-edge p-5 sm:p-6 lg:p-8"
      >
        <div className="relative z-10">
          <div className="fd-hero-chip mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-orange shadow-[0_0_12px_rgba(249,115,22,0.9)]" />
            Gun Reference
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.04em] text-white">
            Graco Fusion AP
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/45 leading-relaxed">
            Interactive breakdown, rebuild walkthrough, and full spec sheet.
            Tap any part for o-ring sizes, part numbers, and field tips.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="pill-info">{FUSION_AP_PARTS.length} components</span>
            <span className="pill-caution">{totalOrings} o-rings total</span>
            <span className="pill-go">Rebuild ready</span>
          </div>
        </div>
      </motion.div>

      {/* ── Tab Bar ── */}
      <div className="glass-frosted rounded-2xl p-1.5 flex gap-1">
        {(["exploded", "rebuild", "specs"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              tab === t
                ? "bg-orange/20 text-orange shadow-[inset_0_1px_0_rgba(249,115,22,0.2),0_2px_8px_rgba(249,115,22,0.1)] border border-orange/25"
                : "text-white/40 hover:text-white/60 hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={TAB_META[t].icon} />
            </svg>
            {TAB_META[t].label}
          </button>
        ))}
      </div>

      {/* ── Exploded View Tab ── */}
      {tab === "exploded" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Diagram */}
          <div className="glass-frosted rounded-[22px] overflow-hidden">
            <ExplodedDiagram
              selectedPart={selectedPart}
              onSelectPart={setSelectedPart}
            />
          </div>

          {/* Selected part detail */}
          <AnimatePresence mode="wait">
            {activePart ? (
              <motion.div
                key={activePart.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="glass-elevated inner-glow-orange rounded-[22px] p-6 space-y-5 border border-orange/15"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.28), 0 16px 48px rgba(0,0,0,0.18), 0 0 50px rgba(249,115,22,0.06)" }}
              >
                {/* Part header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg tracking-[-0.02em]">{activePart.name}</h3>
                    <p className="text-sm text-white/50 mt-1.5 leading-relaxed max-w-lg">{activePart.description}</p>
                  </div>
                  {activePart.category && (
                    <span className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-white/[0.06] text-white/35 border border-white/[0.06] uppercase tracking-wider font-semibold">
                      {CATEGORY_LABELS[activePart.category]}
                    </span>
                  )}
                </div>

                {/* Part numbers */}
                {activePart.partNumbers && activePart.partNumbers.length > 0 && (
                  <div>
                    <h4 className="fd-section-title mb-2">Part Numbers</h4>
                    <div className="flex flex-wrap gap-2">
                      {activePart.partNumbers.map((pn, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl bg-white/[0.04] text-xs text-white/70 border border-white/[0.08] font-mono fd-foam-panel">
                          <span className="relative z-10">{pn}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* O-rings */}
                {activePart.orings && activePart.orings.length > 0 && (
                  <div className="p-4 rounded-2xl bg-red-500/[0.04] border border-red-500/10">
                    <h4 className="fd-section-title mb-2.5 flex items-center gap-2">
                      O-Rings
                      <span className="w-2 h-2 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    </h4>
                    <div className="space-y-2">
                      {activePart.orings.map((o, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs">
                          <span className="shrink-0 px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 font-mono font-semibold border border-red-500/10">
                            {o.size}
                          </span>
                          <span className="text-white/55">
                            {o.location}
                          </span>
                          <span className="ml-auto text-white/25 font-mono">x{o.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {activePart.tips && activePart.tips.length > 0 && (
                  <div>
                    <h4 className="fd-section-title mb-2.5">Field Tips</h4>
                    <div className="space-y-1.5">
                      {activePart.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-white/55 leading-relaxed">
                          <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-orange/60" />
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-[22px] p-8 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange/10 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-orange/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                  </svg>
                </div>
                <p className="text-sm text-white/30">Tap any part in the diagram to see details</p>
                <p className="text-xs text-white/20 mt-1">O-ring specs, part numbers, and field tips</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Parts list */}
          <div className="glass-textured rounded-[22px] p-5 space-y-4">
            <div className="glass-grain" />
            <h3 className="relative z-10 fd-section-title">All Components</h3>
            {CATEGORY_ORDER.map((cat) => {
              const parts = FUSION_AP_PARTS.filter((p) => p.category === cat);
              if (!parts.length) return null;
              return (
                <div key={cat} className="relative z-10">
                  <div className="text-[10px] text-white/20 uppercase tracking-[0.14em] font-bold mb-2 pl-1">{CATEGORY_LABELS[cat]}</div>
                  <div className="space-y-1.5">
                    {parts.map((part) => (
                      <button
                        key={part.id}
                        onClick={() => setSelectedPart(selectedPart === part.id ? null : part.id)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm transition-all duration-200 ${
                          selectedPart === part.id
                            ? "bg-orange/12 text-orange border border-orange/20 shadow-[0_0_20px_rgba(249,115,22,0.06)]"
                            : "bg-white/[0.02] text-white/55 border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.08]"
                        }`}
                      >
                        <span className="font-medium">{part.name}</span>
                        <div className="flex items-center gap-2.5">
                          {part.orings && part.orings.length > 0 && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/12 text-red-400 border border-red-500/10 font-semibold">
                              {part.orings.reduce((sum, o) => sum + o.qty, 0)} o-rings
                            </span>
                          )}
                          {part.partNumbers && part.partNumbers.length > 0 && (
                            <span className="text-[9px] text-white/20 font-mono hidden sm:inline">
                              {part.partNumbers[0].split(" ")[0]}
                            </span>
                          )}
                          <svg
                            className={`w-4 h-4 text-white/15 transition-transform duration-200 ${selectedPart === part.id ? "rotate-90 text-orange/50" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Rebuild Guide Tab ── */}
      {tab === "rebuild" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Rebuild header card */}
          <div className="glass-frosted rounded-[22px] p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange/15 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-3.19M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold text-base tracking-[-0.02em]">Full Rebuild — Fusion AP</h3>
                <p className="text-xs text-white/40 mt-0.5">9 steps &middot; 15-20 min &middot; Have solvent, TSL, and o-ring kit ready</p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="glass-textured rounded-[22px] p-5 space-y-3">
            <div className="glass-grain" />
            {REBUILD_STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="relative z-10 flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-orange/12 border border-orange/15 flex items-center justify-center">
                  <span className="text-sm font-bold text-orange fd-mono-readout">{s.step}</span>
                </div>
                <div className="pt-0.5">
                  <h4 className="text-sm text-white font-semibold">{s.title}</h4>
                  <p className="text-xs text-white/45 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* O-ring kit summary */}
          <div className="glass-elevated inner-glow-red rounded-[22px] p-5 border border-red-500/10"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.28), 0 16px 48px rgba(0,0,0,0.18), 0 0 40px rgba(239,68,68,0.04)" }}
          >
            <div className="relative z-10 flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              </div>
              <div>
                <h3 className="fd-section-title">Complete O-Ring Kit</h3>
                <p className="text-[10px] text-white/25 mt-0.5">Everything you need for a full rebuild</p>
              </div>
              <div className="ml-auto text-right">
                <div className="text-lg font-semibold text-red-400 fd-mono-readout">{totalOrings}</div>
                <div className="text-[10px] text-white/25">total</div>
              </div>
            </div>

            <div className="relative z-10 space-y-2">
              {FUSION_AP_PARTS.flatMap((p) =>
                (p.orings || []).map((o) => ({ ...o, partName: p.name }))
              ).map((o, i) => (
                <div key={i} className="flex items-center gap-3 text-xs p-2 rounded-lg bg-white/[0.02]">
                  <span className="shrink-0 w-20 px-2.5 py-1 rounded-lg bg-red-500/12 text-red-400 font-mono font-semibold text-center border border-red-500/10">
                    {o.size}
                  </span>
                  <span className="text-white/45 flex-1">
                    {o.location}
                  </span>
                  <span className="text-white/20 text-[10px] shrink-0">{o.partName}</span>
                  <span className="text-white/30 font-mono font-semibold shrink-0">x{o.qty}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Specs Tab ── */}
      {tab === "specs" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Spec sheet */}
          <div className="glass-frosted rounded-[22px] p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={TAB_META.specs.icon} />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold text-base tracking-[-0.02em]">Fusion AP Specifications</h3>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">Technical Data Sheet</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
              {[
                { label: "Model", value: "Fusion AP", highlight: true },
                { label: "Materials Sprayed", value: "Foam & coatings" },
                { label: "Max Output", value: "50 lb/min (22.7 kg/min)", highlight: true },
                { label: "Min Output", value: "3 lb/min (1.4 kg/min)" },
                { label: "Max Working Pressure", value: "3,500 PSI (240 bar)", highlight: true },
                { label: "Max Air Pressure", value: "130 PSI (9 bar)" },
                { label: "Max Fluid Temp", value: "200\u00b0F (93\u00b0C)" },
                { label: "Weight (w/ manifold)", value: "3.26 lb (1.48 kg)" },
                { label: "Air Inlet", value: "1/4 NPT quick disconnect" },
                { label: "A Inlet (ISO)", value: "-5 JIC; 1/2-20 UNF" },
                { label: "B Inlet (Resin)", value: "-6 JIC; 9/16-18 UNF" },
                { label: "Wetted Parts", value: "Al, SS, carbon steel, brass" },
                { label: "Dimensions", value: "7.5 x 8.1 x 3.3 in" },
                { label: "Instruction Manual", value: "309550" },
              ].map((spec) => (
                <div key={spec.label} className="flex justify-between items-center py-2.5 border-b border-white/[0.04]">
                  <span className="text-xs text-white/35">{spec.label}</span>
                  <span className={`text-xs font-medium text-right fd-mono-readout ${
                    spec.highlight ? "text-orange/80" : "text-white/65"
                  }`}>
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Applications card */}
          <div className="glass-card rounded-[22px] p-5">
            <h4 className="fd-section-title mb-2.5">Applications</h4>
            <div className="flex flex-wrap gap-2">
              {["Residential Insulation", "Roofing", "Concrete Lifting", "Waterproofing", "Polyurethane Foams", "Elastomeric Coatings"].map((app) => (
                <span key={app} className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.04] text-white/50 border border-white/[0.06]">
                  {app}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
