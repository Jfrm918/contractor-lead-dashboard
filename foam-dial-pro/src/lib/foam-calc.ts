/**
 * Dew point calculation using Magnus formula.
 * Input: temperature in Fahrenheit, humidity as percentage (0-100).
 * Returns dew point in Fahrenheit.
 */
export function calculateDewPoint(tempF: number, humidity: number): number {
  const tempC = ((tempF - 32) * 5) / 9;
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * tempC) / (b + tempC) + Math.log(humidity / 100);
  const dewC = (b * alpha) / (a - alpha);
  return (dewC * 9) / 5 + 32;
}

/**
 * Foam system TDS specs — sourced from manufacturer documentation.
 *
 * Enverge EasySeal .5: enverge.app/1/spray-settings & TDS
 * Accufoam AF1: accufoam.com blog + partial specs (PSI pending full TDS)
 */
export type FoamSystemKey = "enverge_easyseal" | "accufoam_af1";

interface FoamSystemSpec {
  name: string;
  drumPreHeat: number;           // °F — target drum temp before spraying
  drumStorage: { min: number; max: number }; // °F
  hoseTemp: { min: number; max: number };    // °F — A, B, and hose heat
  pressure: { min: number; max: number } | null; // PSI — null if TDS not available
  pressureBalance: number | null; // max PSI difference between A and B
  ambientRange: { min: number; max: number }; // °F
  maxHumidity: number;           // %
  maxPassBase: number;           // inches — base max pass thickness from TDS
  source: string;                // TDS source for transparency
}

export const FOAM_SYSTEM_SPECS: Record<FoamSystemKey, FoamSystemSpec> = {
  enverge_easyseal: {
    name: "Enverge EasySeal .5",
    drumPreHeat: 95,
    drumStorage: { min: 50, max: 80 },
    hoseTemp: { min: 120, max: 150 },
    pressure: { min: 1000, max: 1400 },
    pressureBalance: 200,
    ambientRange: { min: 40, max: 120 },
    maxHumidity: 85,
    maxPassBase: 5.5,
    source: "Enverge EasySeal Application Guide & enverge.app/1/spray-settings",
  },
  accufoam_af1: {
    name: "Accufoam AF1",
    drumPreHeat: 80,
    drumStorage: { min: 70, max: 90 },
    hoseTemp: { min: 120, max: 140 },
    pressure: { min: 1100, max: 1400 },
    pressureBalance: 200,
    ambientRange: { min: 40, max: 120 },
    maxHumidity: 85,
    maxPassBase: 8,
    source: "Accufoam AF1 TDS — 1100-1400 PSI dynamic fluid pressure per manufacturer spec",
  },
};

/**
 * Interpolate a value within a range based on where ambient falls in the TDS ambient range.
 * Cold ambient → top of range, hot ambient → bottom of range.
 */
function interpolateSetting(
  ambient: number,
  ambientRange: { min: number; max: number },
  settingRange: { min: number; max: number }
): number {
  const clamped = Math.max(ambientRange.min, Math.min(ambientRange.max, ambient));
  // 0 = coldest, 1 = hottest
  const t = (clamped - ambientRange.min) / (ambientRange.max - ambientRange.min);
  // Cold → high setting, hot → low setting (inverted)
  return Math.round(settingRange.max - t * (settingRange.max - settingRange.min));
}

/**
 * Get dial-in recommendations based on site conditions and foam system TDS.
 * Returns dynamic recommended settings (not just static ranges) based on ambient temp.
 */
export function getDialInRecommendation(params: {
  ambient: number;
  substrate: number;
  humidity: number;
  foamSystem: FoamSystemKey;
}) {
  const { ambient, substrate, humidity, foamSystem } = params;
  const spec = FOAM_SYSTEM_SPECS[foamSystem];
  const dewPoint = calculateDewPoint(ambient, humidity);
  const margin = substrate - dewPoint;

  // Dynamic recommended settings based on ambient temp
  const recHoseTemp = interpolateSetting(ambient, spec.ambientRange, spec.hoseTemp);
  const recPressure = spec.pressure
    ? interpolateSetting(ambient, spec.ambientRange, spec.pressure)
    : null;
  // Drum temp: cold conditions → top of storage range, normal → pre-heat target
  const recDrumTemp = ambient < 50 ? spec.drumStorage.max : spec.drumPreHeat;

  // Go/no-go status — based on physics (dew point) and TDS limits
  let status: "green" | "yellow" | "red" = "green";
  if (
    margin < 5 ||
    humidity > 90 ||
    ambient < spec.ambientRange.min ||
    ambient > spec.ambientRange.max
  ) {
    status = "red";
  } else if (margin < 10 || humidity > spec.maxHumidity || ambient < 50) {
    status = "yellow";
  }

  const alerts: string[] = [];

  // Dew point / substrate margin alerts
  if (margin < 5) {
    alerts.push(
      "STOP: Substrate is dangerously close to dew point. Do not spray until margin exceeds 10°F."
    );
  } else if (margin < 10) {
    alerts.push(
      "WARNING: Substrate is within 10°F of dew point. Consider pre-heating substrate or waiting for conditions to improve."
    );
  } else if (margin < 15) {
    alerts.push(
      "Substrate margin is adequate but tight. Monitor conditions throughout the job."
    );
  }

  // Humidity alerts — using TDS max
  if (humidity > 90) {
    alerts.push(
      `Humidity exceeds safe limits. ${spec.name} TDS specifies below ${spec.maxHumidity}% RH.`
    );
  } else if (humidity > spec.maxHumidity) {
    alerts.push(
      `Humidity above ${spec.name} TDS limit of ${spec.maxHumidity}%. Expect slower cure and surface defects.`
    );
  } else if (humidity > 75) {
    alerts.push(
      "Elevated humidity. Watch for tacky surfaces and consider improving ventilation."
    );
  }

  // Ambient temp alerts — using TDS range
  if (ambient > spec.ambientRange.max) {
    alerts.push(
      `Ambient exceeds ${spec.name} TDS max of ${spec.ambientRange.max}°F. Do not spray.`
    );
  } else if (ambient > 90) {
    alerts.push(
      "Extreme heat. Work thinner lifts and consider early morning starts."
    );
  } else if (ambient > 80) {
    alerts.push(
      "High ambient. Foam will react faster. Use thinner passes on verticals."
    );
  }

  if (ambient < spec.ambientRange.min) {
    alerts.push(
      `Ambient below ${spec.name} TDS min of ${spec.ambientRange.min}°F. Do not spray.`
    );
  } else if (ambient < 50) {
    alerts.push(
      "Cold conditions. Recirculate chemicals before spraying to ensure even temp and proper ratio."
    );
  }

  if (alerts.length === 0) {
    alerts.push(
      "Conditions look workable. Verify ratio and spray pattern on a test shot before production."
    );
  }

  // Max pass thickness — base from TDS, reduced by heat/humidity
  let maxPassThickness = spec.maxPassBase;
  if (ambient > 95) {
    maxPassThickness -= 2;
  } else if (ambient > 85) {
    maxPassThickness -= 1;
  }
  if (humidity > 75) {
    maxPassThickness -= 0.5;
  }
  maxPassThickness = Math.max(2, maxPassThickness);

  return {
    dewPoint,
    margin,
    // Dynamic recommendations — single number based on conditions
    recHoseTemp,
    recPressure,
    recDrumTemp,
    maxPassThickness,
    // Static TDS ranges for reference
    drumPreHeat: spec.drumPreHeat,
    hoseTempRange: spec.hoseTemp,
    pressureRange: spec.pressure,
    pressureBalance: spec.pressureBalance,
    drumStorageRange: spec.drumStorage,
    status,
    alerts,
    foamSystemName: spec.name,
    source: spec.source,
  };
}

/**
 * Substrate type offsets from ambient temperature (°F).
 * Metal absorbs/radiates more, concrete holds cold, underfloor is shaded.
 */
export type SubstrateType = "wood" | "metal" | "concrete" | "underfloor";

export const SUBSTRATE_OFFSETS: Record<SubstrateType, number> = {
  wood: -3,
  metal: -10,
  concrete: -7,
  underfloor: -5,
};

/**
 * Estimate substrate temp from ambient and substrate type.
 * Optional shift offset: morning jobs tend to have cooler substrates.
 */
export function estimateSubstrate(
  ambient: number,
  substrateType: SubstrateType,
  shift: "morning" | "afternoon" = "afternoon"
): number {
  const offset = SUBSTRATE_OFFSETS[substrateType];
  const shiftOffset = shift === "morning" ? -3 : 0;
  return ambient + offset + shiftOffset;
}

/**
 * Calculate yield metrics for a job.
 */
export function calculateYield(params: {
  boardFeet: number | null;
  setsUsed: number | null;
  yieldTarget: number | null;
}) {
  const { boardFeet, setsUsed, yieldTarget } = params;

  if (!boardFeet || !setsUsed || setsUsed === 0) {
    return { yieldActual: null, yieldVariance: null };
  }

  const yieldActual = boardFeet / setsUsed;
  const yieldVariance =
    yieldTarget && yieldTarget > 0
      ? ((yieldActual - yieldTarget) / yieldTarget) * 100
      : null;

  return { yieldActual, yieldVariance };
}
