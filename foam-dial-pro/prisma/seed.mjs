import dotenv from "dotenv";
dotenv.config({ override: true });

import pg from "pg";
const { Pool } = pg;

// Dynamic import of the generated Prisma client
const { PrismaClient } = await import("../src/generated/prisma/client.ts");

const connStr = process.env.DATABASE_URL.replace("&channel_binding=require", "");
console.log("Connecting to:", connStr.substring(0, 40) + "...");

// Use pg adapter for seeding
const { PrismaPg } = await import("@prisma/adapter-pg");
const pool = new Pool({ connectionString: connStr });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// PBKDF2 password hashing
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"]
  );
  const hash = await crypto.subtle.exportKey("raw", key);
  const toHex = (bytes) =>
    Array.from(new Uint8Array(bytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  return `${toHex(salt)}:${toHex(new Uint8Array(hash))}`;
}

function calcDewPoint(tempF, humidity) {
  const tempC = ((tempF - 32) * 5) / 9;
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * tempC) / (b + tempC) + Math.log(humidity / 100);
  const dewC = (b * alpha) / (a - alpha);
  return (dewC * 9) / 5 + 32;
}

async function main() {
  console.log("Seeding FoamDial Pro...");

  // Clean existing foam data
  await prisma.foamJob.deleteMany();
  await prisma.foamEquipment.deleteMany();
  await prisma.foamUser.deleteMany();
  await prisma.foamCompany.deleteMany();
  await prisma.foamSystem.deleteMany();
  await prisma.foamDiagnostic.deleteMany();

  // Create company
  const company = await prisma.foamCompany.create({
    data: { name: "Hadrava Insulation", status: "active" },
  });

  // Create admin user
  const passwordHash = await hashPassword("foamdial2026");
  const adminUser = await prisma.foamUser.create({
    data: {
      email: "hadrava.business@gmail.com",
      passwordHash,
      name: "Jason Hadrava",
      role: "admin",
      location: "Tulsa, OK",
      companyId: company.id,
    },
  });

  // Create foam systems — only active products
  const foamSystems = await Promise.all([
    prisma.foamSystem.create({
      data: {
        manufacturer: "Enverge", product: "EasySeal .5", type: "open_cell",
        rValue: 3.8, yieldPerSet: 20000, ratio: "1:1", minTemp: 60, maxTemp: 95,
        substrates: ["Walls", "Rooflines", "Metal buildings"],
        notes: "PRIMARY. Targets: 2x4=4in (R15) | 2x6=4-6in (R15-23) | Rooflines=5-6in | Metal=3.5-5in. +25% yield vs Ambit.",
        isDefault: true,
      },
    }),
    prisma.foamSystem.create({
      data: {
        manufacturer: "AccuFoam", product: "AF1", type: "open_cell",
        rValue: 3.7, yieldPerSet: 20000, ratio: "1:1", minTemp: 30, maxTemp: 120,
        substrates: ["Walls", "Rooflines", "Metal buildings", "Attics", "Underfloors"],
        notes: "Solution-based OC, no mixing. 100% water blown. 0.40-0.45 pcf density. Max 6in/pass (up to 8in w/ ignition barrier). Hose heat 120-140F. Pre-heater A/B 120-140F. Dynamic pressure 1100-1400 psi. Substrate moisture <19%. GREENGUARD Gold. Re-entry 1hr w/10 ACH. STC 38, NRC 0.55. Storage 60-90F, 6mo shelf life. Flame spread <25, smoke <450. Class-1 surface burning. Year-round formula.",
        isDefault: true,
      },
    }),
  ]);

  // Create all 12 diagnostics
  const diagnosticData = [
    { problem: "Fisheyes / Pinhole Voids", category: "surface", severity: "high",
      causes: ["B-heavy off-ratio", "Substrate contamination", "Cold substrate <50F", "Gun too fast", "High humidity/dew point"],
      fixes: ["Balance A/B within 10%", "Clean and dry substrate", "Pre-heat to 55F+", "Slow gun", "Keep substrate 10F above dew point"] },
    { problem: "Delamination / Pulling Away", category: "adhesion", severity: "high",
      causes: ["Substrate below 45F", "Oil/dust/frost on substrate", "First pass too thin", "Smooth ICF or concrete", "Over vapor barrier"],
      fixes: ["Pre-heat to 60F+", "Acetone on metal or dry brush on wood", "1in+ tack coat", "Profile smooth surfaces", "Remove vapor barriers"] },
    { problem: "Off-Ratio - B-Heavy", category: "ratio", severity: "high",
      causes: ["B pressure too high", "B too hot", "A filter clogged", "A drum running low"],
      fixes: ["Balance pressures at gun", "Lower B hose temp 5-10F", "Purge and clean A strainer", "Switch A drum before empty"] },
    { problem: "Off-Ratio - A-Heavy", category: "ratio", severity: "high",
      causes: ["A pressure too high", "A overheated", "B filter clogged", "B drum running low"],
      fixes: ["Reduce A pressure", "Lower A hose temp", "Purge and clean B filter", "Switch B drum immediately"] },
    { problem: "Tacky / Sticky Foam", category: "surface", severity: "medium",
      causes: ["B-heavy ratio", "Pass too thick", "Material too warm", "RH above 80%"],
      fixes: ["Check ratio first", "Reduce pass thickness", "Drop hose temp 5F", "Improve ventilation"] },
    { problem: "Low Yield / Burning Through Sets", category: "yield", severity: "medium",
      causes: ["Drums too cold", "Ambient too hot", "Partial blockage", "Drum stratification"],
      fixes: ["Heat drums to 65-70F", "Work early morning in summer", "Purge and check filters", "Roll drums before use"] },
    { problem: "Foam Sagging Off Walls", category: "application", severity: "medium",
      causes: ["Pass too thick per lift", "Material too hot", "High ambient temp"],
      fixes: ["Max 3in per lift on verticals", "Wait between passes", "Lower hose temp 5-10F"] },
    { problem: "Cold Weather Problems (<40F)", category: "weather", severity: "high",
      causes: ["Drums too cold", "Substrate below 50F", "Hose temp dropping", "Slow reaction"],
      fixes: ["Heat drums overnight to 70F", "Pre-heat substrate", "Increase hose temp 5-10F", "Insulate hose runs"] },
    { problem: "Poor Cell Structure / Rough Texture", category: "application", severity: "medium",
      causes: ["Gun too fast", "Pressures too low", "Temp out of spec", "Nozzle clogged"],
      fixes: ["Slow gun movement", "Increase pressures to spec", "Check temps", "Change mix chamber or nozzle"] },
    { problem: "Pressure Fluctuation / Surging", category: "equipment", severity: "high",
      causes: ["Pump cavitation", "Air in supply lines", "Filter restriction", "Check valve failure"],
      fixes: ["Switch drum before empty", "Bleed air from lines", "Clean all filters", "Inspect check valves"] },
    { problem: "Hot Weather / Summer Issues", category: "weather", severity: "medium",
      causes: ["Foam reacts too fast", "Shorter cream time", "Sags more on verticals"],
      fixes: ["Work early morning", "Lower hose temps 5-10F", "Thinner passes on verticals", "Shade drum truck"] },
    { problem: "Discoloration / Uneven Color", category: "yield", severity: "low",
      causes: ["Ratio drift", "B-drum past shelf life", "UV exposure", "Contamination"],
      fixes: ["Run cup test, weigh each side", "Check B-drum date", "Cosmetic only if old foam", "Suspect ratio if fresh foam discolors"] },
  ];

  for (const d of diagnosticData) {
    await prisma.foamDiagnostic.create({ data: d });
  }

  // Create equipment
  await prisma.foamEquipment.create({
    data: {
      companyId: company.id,
      name: "Graco E-30",
      serialNum: "E30-2024-4821",
      notes: "Primary rig. Fusion AP gun.",
    },
  });

  // Create 2 sample jobs from April 16 Tulsa data
  const easySeal = foamSystems[0];

  await prisma.foamJob.create({
    data: {
      companyId: company.id, userId: adminUser.id, foamSystemId: easySeal.id,
      date: new Date("2026-04-16T08:00:00"),
      location: "Tulsa Hills common wall, sheetrock substrate",
      substrate: "Sheetrock", setsUsed: 13, ambientTemp: 56, humidity: 67,
      dewPoint: calcDewPoint(56, 67), hoseTempA: 145, hoseTempB: 146,
      pressureA: 1065, pressureB: 1080, rating: 4,
      problems: ["Rolled in certain cavities"],
      notes: "Flat spray against sheetrock on common wall. Tulsa Hills weather at start roughly 56F, 67% RH, light SSE wind, mist early. Rig start settings: hose target 145F, A 145F, B 146F, A pressure 1065 psi, B pressure 1080 psi. Foam sprayed good from the start, stayed consistent on growth time, and had no shrinking or peel back. Finished around 11:30 AM.",
      yieldTarget: 20000,
    },
  });

  await prisma.foamJob.create({
    data: {
      companyId: company.id, userId: adminUser.id, foamSystemId: easySeal.id,
      date: new Date("2026-04-16T12:00:00"),
      location: "Tulsa, 51st and Mingo, wood substrate",
      substrate: "Wood", setsUsed: 12, ambientTemp: 70, humidity: 84,
      dewPoint: calcDewPoint(70, 84), hoseTempA: 138, pressureA: 81, pressureB: 67,
      rating: 3,
      problems: ["Foam felt too hot", "Dropped setting to 143F with little change"],
      notes: "Spraying wood substrate. Weather roughly 70F, 84% RH, overcast, south wind about 11 mph. Rig screen at 12:13 showed hose target 145F, A 124F, B 121F, hose actual 138F, transfer pressures A 81 psi and B 67 psi, main pressure 1120 psi. Foam still laid down nice overall.",
      yieldTarget: 20000,
    },
  });

  console.log("Seed complete!");
  console.log(`  Company: ${company.name} (${company.id})`);
  console.log(`  Admin: ${adminUser.email}`);
  console.log(`  Foam systems: ${foamSystems.length} (EasySeal .5 + AF1)`);
  console.log(`  Diagnostics: 12`);
  console.log(`  Sample jobs: 2`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
