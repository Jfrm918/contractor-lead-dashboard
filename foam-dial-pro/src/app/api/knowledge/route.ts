import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const easysealKnowledgeBase = {
  product: {
    name: "Enverge EasySeal .5",
    overview: {
      type: "Open cell, 0.5 lb/ft³ density",
      rValuePerInch: 3.8,
      openCellContent: ">90%",
      mixRatio: "1:1 by volume",
      chemistry: "Two-component polyurethane (MDI + polyol resin blend with fire retardants + blowing agents)",
      certifications: ["IAPMO QCC", "UL Certified", "ENERGY STAR", "MasterSpec", "DrJ"],
    },
    processingParameters: {
      ambientTempRange: { min: 40, max: 120, unit: "°F" },
      maxRelativeHumidity: 85,
      maxSubstrateMoisture: 18,
      drumPreheatTemp: 95,
      proportionerHoseTempRange: { min: 120, max: 150, unit: "°F" },
      dynamicPressureRange: { min: 1000, max: 1400, unit: "PSI" },
      abPressureBalance: "within 100-200 PSI of each other",
    },
    jasonSettings: {
      hoseA: 145,
      hoseB: 145,
      drumA: 95,
      drumB: 100,
      notes: [
        "Proven starting points for Tulsa, OK spring conditions (April-May)",
        "145°F is within Enverge's 120-150°F range",
        "Drum temps match recommended pre-heat",
      ],
    },
    compatibleEquipment: [
      "Graco Reactor A-25",
      "Graco Reactor E-20",
      "Graco Reactor E-30",
      "Graco Reactor H-30",
      "Graco Reactor H-40",
      "Graco Reactor H-50",
    ],
    rValueTable: [
      { thickness: 2, rValue: 7.6 },
      { thickness: 3.5, rValue: 13.3 },
      { thickness: 3.625, rValue: 13.8 },
      { thickness: 5.5, rValue: 20.9 },
      { thickness: 6, rValue: 22.8 },
      { thickness: 7.25, rValue: 27.6 },
    ],
  },
  applicationRules: {
    green: {
      label: "GO",
      conditions: [
        { name: "Ambient temp", value: "60-90°F (ideal range)" },
        { name: "Substrate temp", value: "60-90°F" },
        { name: "Humidity", value: "40-70% RH" },
        { name: "Substrate moisture", value: "<15% (safe margin below 18% limit)" },
        { name: "Dew margin", value: "15°F+ above dew point" },
      ],
    },
    amber: {
      label: "CAUTION",
      conditions: [
        { name: "Ambient temp", value: "40-60°F or 90-100°F" },
        { name: "Humidity", value: "70-85% RH" },
        { name: "Dew margin", value: "10-15°F" },
        { name: "Substrate moisture", value: "15-18%" },
      ],
    },
    red: {
      label: "STOP",
      conditions: [
        { name: "Ambient temp", value: "below 40°F or above 120°F" },
        { name: "Humidity", value: "above 85%" },
        { name: "Substrate moisture", value: "above 18%" },
        { name: "Dew margin", value: "below 10°F" },
      ],
    },
    substratePrep: [
      "Surface must be clean, dry, and free of oil/grease/dust",
      "Metal: remove rust, scale, or mill scale — clean bare metal required",
      "Wood: max 18% moisture content — check with moisture meter",
      "Concrete/masonry: must be dry, no efflorescence or active moisture",
      "Temperature: substrate must be at least 50°F (warmer is better)",
    ],
    liftThickness: [
      "Open cell: can spray thick in one pass (less exothermic than closed cell)",
      "Typical single pass: up to full cavity depth",
      "Watch for high ambient temp + thick lift = potential overheating in tight spaces",
    ],
  },
  troubleshootingExtra: [
    {
      problem: "Foam feels too hot / scorching in tight spaces",
      causes: ["High ambient temp", "Thick lift", "Poor ventilation"],
      fixes: ["Reduce lift thickness", "Improve air circulation", "Spray in cooler part of day"],
      context: "Less concern than closed cell, but can still occur in metal buildings during summer",
    },
    {
      problem: "Foam not sticking to cold metal",
      causes: ["Metal below 50°F", "Condensation on substrate"],
      fixes: ["Warm substrate with propane heater", "Verify no moisture", "Spray test pass first"],
      jasonTip: "Metal buildings in early morning — always check substrate temp before you pull trigger",
    },
    {
      problem: "Foam rising too fast / out of control",
      causes: ["Over-temperature (hose too hot)", "High ambient heat"],
      fixes: ["Drop hose temp 5-10°F", "Spray in cooler conditions", "Check drum temps"],
    },
    {
      problem: "Foam looks good but yield is low",
      causes: ["Spray technique (too far from substrate, excessive drift)", "Gun tip worn"],
      fixes: ["12-18\" spray distance", "Replace tip", "Check for air leaks in system"],
    },
  ],
  seasonal: {
    spring: {
      label: "Spring (March-May)",
      avgAmbient: "55-80°F",
      issues: ["Humidity spikes before storms", "Morning dew on metal"],
      settings: { hose: "145°F", drumA: "95°F", drumB: "100°F" },
      watch: "Thunderstorm season = humidity can spike to 80%+ rapidly. Check conditions before each job.",
    },
    summer: {
      label: "Summer (June-August)",
      avgAmbient: "85-105°F",
      challenges: ["Foam overheating", "Fast set", "Substrate temps on metal buildings can hit 140°F+"],
      adjustments: ["Drop hose temp to 125-130°F", "Spray early morning before 10am"],
      metalBuildings: "Spray west walls in morning, east walls in afternoon",
      avoid: "Avoid spraying when ambient >100°F if possible",
    },
    fall: {
      label: "Fall (September-November)",
      notes: "Good season for spray foam — temp and humidity in ideal range",
      watch: ["Cold fronts: temps can drop 30°F overnight", "Bump drum temps up as fall progresses"],
    },
    winter: {
      label: "Winter (December-February)",
      below40: "Must preheat building and substrate",
      drumStorage: "Keep at 50-80°F minimum, don't let them sit in a cold trailer",
      hoseTemp: "May need to push to 145-150°F to compensate",
      dewPoint: "Dew point risk is lower but substrate condensation from heating is a real issue",
    },
  },
};

const af1KnowledgeBase = {
  product: {
    name: "AccuFoam AF1",
    overview: {
      type: "Open cell, 0.40-0.45 lb/ft³ density (ultra low)",
      rValuePerInch: 3.7,
      openCellContent: ">90%",
      mixRatio: "1:1 by volume",
      chemistry: "Solution-based polyurethane — no mixing required, just heat and spray. 100% water blown, zero ODP blowing agents.",
      formulation: "One year-round formula (no seasonal formulation changes)",
      manufacturer: "Creative Polymer Solutions (Accufoam brand), Birmingham AL",
      yieldPerSet: "20,000 BF/set",
      certifications: ["GREENGUARD GOLD (UL)", "A.I.R. Seal of Excellence", "ESR-5255", "ER-0842", "CCRR-0487"],
    },
    processingParameters: {
      ambientTempRange: { min: 30, max: 120, unit: "°F" },
      maxRelativeHumidity: 85,
      maxSubstrateMoisture: 19,
      drumPreheatTemp: "70-90°F",
      proportionerHoseTempRange: { min: 120, max: 140, unit: "°F" },
      preHeaterRange: { min: 120, max: 140, unit: "°F" },
      dynamicPressureRange: { min: 1100, max: 1400, unit: "PSI" },
      abPressureBalance: "within 100 PSI of each other",
      maxThickness: "6in/pass (up to 8in with ignition barrier)",
    },
    jasonSettings: {
      hoseA: 130,
      hoseB: 130,
      drumA: 80,
      drumB: 80,
      notes: [
        "AF1 runs cooler than EasySeal — 120-140°F hose range",
        "Drums at 70-90°F, no pre-heat to 95°F needed",
        "One formula year-round — no seasonal product swaps",
      ],
    },
    compatibleEquipment: [
      "Graco Reactor E-30",
      "Graco Reactor E-20",
      "Graco Reactor H-30",
      "Graco Reactor H-40",
      "Graco Reactor H-50",
      "Other proportioners",
    ],
    rValueTable: [
      { thickness: 2, rValue: 7.4 },
      { thickness: 3, rValue: 11.1 },
      { thickness: 3.5, rValue: 13.0 },
      { thickness: 4, rValue: 14.8 },
      { thickness: 5, rValue: 18.5 },
      { thickness: 5.5, rValue: 20.4 },
      { thickness: 6, rValue: 22.2 },
      { thickness: 7.25, rValue: 26.8 },
    ],
    performance: {
      stc: 38,
      nrc: 0.55,
      flameSpread: "<25",
      smokeDeveloped: "<450",
      fireClass: "Class-1 surface burning",
      reEntry: "1hr with 10 ACH (unprotected workers), 2hr (general public) — ASTM D8445-2022a",
      storage: "60-90°F, 6-month shelf life",
      substrates: ["Walls", "Rooflines", "Metal buildings", "Attics", "Underfloors"],
    },
  },
  applicationRules: {
    green: {
      label: "GO",
      conditions: [
        { name: "Ambient temp", value: "50-100°F (ideal range)" },
        { name: "Substrate temp", value: "50-100°F" },
        { name: "Humidity", value: "<70% RH" },
        { name: "Substrate moisture", value: "<15%" },
        { name: "Dew margin", value: "15°F+ above dew point" },
      ],
    },
    amber: {
      label: "CAUTION",
      conditions: [
        { name: "Ambient temp", value: "30-50°F or 100-110°F" },
        { name: "Humidity", value: "70-85% RH" },
        { name: "Dew margin", value: "10-15°F" },
        { name: "Substrate moisture", value: "15-19%" },
      ],
    },
    red: {
      label: "STOP",
      conditions: [
        { name: "Ambient temp", value: "below 30°F or above 120°F" },
        { name: "Humidity", value: "above 85%" },
        { name: "Substrate moisture", value: "above 19%" },
        { name: "Dew margin", value: "below 10°F" },
      ],
    },
    substratePrep: [
      "Surface must be clean, dry, and free of oil/grease/dust",
      "Metal: remove rust, scale, or mill scale — clean bare metal required",
      "Wood: max 19% moisture content — check with moisture meter",
      "Concrete/masonry: must be dry, no efflorescence or active moisture",
      "Temperature: substrate must be at least 40°F (warmer is better)",
    ],
    liftThickness: [
      "Max 6in per pass (standard application)",
      "Up to 8in per pass with ignition barrier installed",
      "Ultra low density (0.40-0.45 pcf) = less exothermic than higher density OC foams",
    ],
  },
  troubleshootingExtra: [
    {
      problem: "AF1 foam rising too fast in warm conditions",
      causes: ["Drum temps too high (above 90°F)", "Ambient temperature above 100°F"],
      fixes: ["Lower drum temps to 70-80°F", "Spray earlier in day before heat builds", "Reduce hose temps to 120-125°F"],
    },
    {
      problem: "AF1 poor adhesion on cold substrates",
      causes: ["Substrate below 40°F", "Moisture or condensation on surface"],
      fixes: ["Pre-heat substrate with propane heater", "Check moisture meter reading", "Wait for dew point clearance"],
      jasonTip: "AF1 can spray down to 30°F ambient, but substrate still needs to be 40°F+ for good adhesion",
    },
    {
      problem: "AF1 cells not opening properly",
      causes: ["Hose temps too low (below 120°F)", "A/B pressure imbalance"],
      fixes: ["Raise hose temps to 130-140°F", "Balance A/B pressures within 100 PSI", "Check for blockages in lines"],
    },
    {
      problem: "AF1 yield lower than expected",
      causes: ["Off-ratio at gun", "Drum temps uneven between A and B", "Hose heat time too short"],
      fixes: ["Check ratio at gun with cup test", "Verify both drums at 70-90°F", "Extend hose heat time before spraying"],
    },
  ],
  seasonal: {
    spring: {
      label: "Spring (March-May)",
      avgAmbient: "55-80°F",
      issues: ["Thunderstorm humidity spikes"],
      settings: { hose: "125-135°F", drums: "70-85°F" },
      watch: "Sweet spot season. Watch thunderstorm humidity spikes — can jump 20%+ in an hour.",
      advantage: "Year-round formula means no seasonal product swaps needed.",
    },
    summer: {
      label: "Summer (June-August)",
      avgAmbient: "85-105°F",
      challenges: ["Metal substrates can hit 140°F+", "Foam rising too fast"],
      adjustments: ["Drop hose to 120-125°F", "Spray before 10am on hot days"],
      watch: "Metal substrates in direct sun can exceed 140°F. Touch-test before spraying.",
      advantage: "Same formula year-round — no summer blend needed.",
    },
    fall: {
      label: "Fall (September-November)",
      avgAmbient: "50-75°F",
      notes: "Best season for spray foam — ideal conditions across the board",
      watch: "Watch cold fronts — can drop 30°F overnight. Standard settings work well.",
      advantage: "No seasonal formulation concerns. Standard settings all season.",
    },
    winter: {
      label: "Winter (December-February)",
      avgAmbient: "20-50°F",
      challenges: ["Wider temp range (30°F min) = spray when competitors can't"],
      adjustments: ["Heat drums overnight to 70°F min", "Hose 135-140°F", "Pre-heat building if substrate <40°F"],
      storage: "Storage must stay 60-90°F — critical for AF1",
      watch: "AF1's 30°F ambient minimum gives you a competitive edge in winter. EasySeal stops at 40°F.",
      advantage: "30°F minimum ambient vs 40°F for most OC foams — more spray days in winter.",
    },
  },
};

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const system = searchParams.get("system") || "easyseal";

  const data = system === "af1" ? af1KnowledgeBase : easysealKnowledgeBase;

  return NextResponse.json({ success: true, data });
}
