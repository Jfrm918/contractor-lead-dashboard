"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { calculateDewPoint } from "@/lib/foam-calc";

/* ── Types ── */

interface FoamSystem {
  product: string;
  manufacturer: string;
  type: string;
  rValue: number;
  yieldPerSet: number;
}

interface Job {
  id: string;
  date: string;
  location: string;
  substrate: string | null;
  jobType: string | null;
  setsUsed: number | null;
  boardFeet: number | null;
  squareFeet: number | null;
  thickness: number | null;
  gallonsASide: number | null;
  gallonsBSide: number | null;
  gallonsTotal: number | null;
  ambientTemp: number | null;
  substrateTemp: number | null;
  humidity: number | null;
  dewPoint: number | null;
  hoseTempA: number | null;
  hoseTempB: number | null;
  drumTempA: number | null;
  drumTempB: number | null;
  pressureA: number | null;
  pressureB: number | null;
  rating: number | null;
  problems: string[];
  notes: string | null;
  photos: string[];
  yieldActual: number | null;
  yieldTarget: number | null;
  yieldVariance: number | null;
  foamSystem: FoamSystem | null;
  user: { name: string; email: string } | null;
}

/* ── Helpers ── */

const JOB_TYPE_LABELS: Record<string, string> = {
  metal_building: "Metal Building",
  underfloor: "Underfloor/Crawlspace",
  stemwall: "Stemwall",
  new_construction: "New Construction (Wood)",
  retrofit: "Retrofit (Wood)",
  mixed: "Mixed",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function fmtNum(v: number | null | undefined, decimals = 0): string {
  if (v == null) return "\u2014";
  return decimals > 0
    ? v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(v).toLocaleString();
}

function stars(n: number | null): string {
  if (n == null) return "\u2014";
  return "\u2605".repeat(n) + "\u2606".repeat(5 - n);
}

/* ── Print styles injected via <style> tag ── */

const PRINT_STYLES = `
@media print {
  /* Hide everything except the report */
  body > *:not(#qc-report-root) { display: none !important; }
  header, nav, .glass-nav, .sidebar, #print-controls, .no-print { display: none !important; }

  /* Reset background */
  html, body, #qc-report-root, #qc-report-root * {
    background: white !important;
    color: #1a1a1a !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  #qc-report-root {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }

  .print-report {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px 32px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.5;
  }

  .print-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 3px solid #1a1a1a;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }

  .print-logo-area {
    width: 80px;
    height: 80px;
    border: 2px dashed #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8pt;
    color: #999;
    border-radius: 4px;
  }

  .print-company-name {
    font-size: 20pt;
    font-weight: 700;
    color: #1a1a1a !important;
    margin: 0;
  }

  .print-report-title {
    font-size: 15pt;
    font-weight: 600;
    color: #333 !important;
    margin: 0;
  }

  .print-section {
    margin-bottom: 16px;
    page-break-inside: avoid;
  }

  .print-section-title {
    font-size: 11pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1.5px solid #333;
    padding-bottom: 4px;
    margin-bottom: 8px;
    color: #1a1a1a !important;
  }

  .print-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 24px;
  }

  .print-grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 4px 24px;
  }

  .print-row {
    display: flex;
    justify-content: space-between;
    padding: 3px 0;
    border-bottom: 1px dotted #ddd;
  }

  .print-label {
    font-weight: 500;
    color: #555 !important;
    font-size: 10pt;
  }

  .print-value {
    font-weight: 600;
    text-align: right;
    color: #1a1a1a !important;
    font-size: 10pt;
  }

  .print-stars {
    font-size: 14pt;
    letter-spacing: 2px;
    color: #f97316 !important;
  }

  .print-notes {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 10pt;
    white-space: pre-wrap;
    min-height: 40px;
  }

  .print-problems {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .print-problem-chip {
    padding: 2px 10px;
    border: 1px solid #e74c3c;
    border-radius: 12px;
    font-size: 9pt;
    color: #e74c3c !important;
  }

  .print-problem-none {
    border-color: #27ae60;
    color: #27ae60 !important;
  }

  .print-footer {
    margin-top: 32px;
    padding-top: 12px;
    border-top: 2px solid #1a1a1a;
    display: flex;
    justify-content: space-between;
    font-size: 8pt;
    color: #888 !important;
  }

  .print-variance-pos { color: #27ae60 !important; }
  .print-variance-neg { color: #e74c3c !important; }
}
`;

/* ── Component ── */

export default function QCReport({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");

  // Fetch jobs + company name
  useEffect(() => {
    Promise.all([
      fetch("/api/jobs?limit=200").then((r) => r.json()),
      user?.companyId
        ? fetch(`/api/admin/company`).then((r) => r.json()).catch(() => null)
        : Promise.resolve(null),
    ])
      .then(([jobsData, companyData]) => {
        if (jobsData.success) setJobs(jobsData.data);
        if (companyData?.success && companyData.data?.name) {
          setCompanyName(companyData.data.name);
        }
      })
      .finally(() => setLoading(false));
  }, [user?.companyId]);

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedJobId) ?? null,
    [jobs, selectedJobId]
  );

  // Compute dew point if not stored
  const dewPoint = useMemo(() => {
    if (!selectedJob) return null;
    if (selectedJob.dewPoint != null) return selectedJob.dewPoint;
    if (selectedJob.ambientTemp != null && selectedJob.humidity != null) {
      return calculateDewPoint(selectedJob.ambientTemp, selectedJob.humidity);
    }
    return null;
  }, [selectedJob]);

  function handlePrint() {
    window.print();
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-orange/30 border-t-orange rounded-full animate-spin" />
      </div>
    );
  }

  const displayCompany = companyName || user?.name || "Spray Foam Co.";

  return (
    <>
      {/* Inject print CSS */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />

      <div id="qc-report-root" className="max-w-3xl mx-auto pb-8">
        {/* ── Controls (hidden on print) ── */}
        <div id="print-controls" className="no-print space-y-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-xl text-white font-medium">QC Report Generator</h1>
              <p className="text-xs text-white/40 mt-0.5">
                Select a job to generate a printable quality control report
              </p>
            </div>
            <button
              onClick={() => onNavigate("dashboard")}
              className="text-xs text-white/30 hover:text-white/50 transition-colors px-3 py-1.5"
            >
              Back
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-4"
          >
            <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">
              Select Job
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="input-field text-sm"
            >
              <option value="">Choose a job...</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {fmtDate(j.date)} - {j.location}
                  {j.foamSystem ? ` (${j.foamSystem.product})` : ""}
                </option>
              ))}
            </select>
          </motion.div>

          {selectedJob && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-end"
            >
              <button
                onClick={handlePrint}
                className="px-6 py-3 rounded-2xl text-sm font-medium bg-orange text-white hover:bg-orange-light transition-all shadow-lg shadow-orange/20 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.25 7.034V3.375" />
                </svg>
                Print / Save as PDF
              </button>
            </motion.div>
          )}
        </div>

        {/* ── Report Preview ── */}
        {!selectedJob && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12 flex flex-col items-center justify-center text-center"
          >
            <svg className="w-16 h-16 text-white/10 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-white/30 text-sm">Select a job above to preview the report</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {selectedJob && (
            <motion.div
              key={selectedJob.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="print-report"
            >
              {/* ══════════ SCREEN VIEW (glass-card dark) ══════════ */}
              <div className="space-y-4">

                {/* ── Header ── */}
                <div className="glass-card p-6">
                  <div className="print-header" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 0 }}>
                    <div>
                      <div className="print-logo-area hidden" style={{ display: "none" }}>
                        Logo
                      </div>
                      <h2 className="text-2xl font-bold text-white print-company-name">
                        {displayCompany}
                      </h2>
                      <h3 className="text-lg font-semibold text-orange print-report-title mt-1">
                        Quality Control Report
                      </h3>
                    </div>
                    <div className="text-right text-sm text-white/40">
                      <div>Report #{selectedJob.id.slice(0, 8).toUpperCase()}</div>
                      <div className="mt-1">Generated: {new Date().toLocaleDateString("en-US")}</div>
                    </div>
                  </div>
                </div>

                {/* ── Job Details ── */}
                <div className="glass-card p-5 print-section">
                  <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3 font-semibold print-section-title">
                    Job Details
                  </h4>
                  <div className="print-grid">
                    <Row label="Date" value={fmtDate(selectedJob.date)} />
                    <Row label="Location" value={selectedJob.location} />
                    <Row label="Job Type" value={selectedJob.jobType ? (JOB_TYPE_LABELS[selectedJob.jobType] || selectedJob.jobType) : "\u2014"} />
                    <Row label="Substrate" value={selectedJob.substrate || "\u2014"} />
                    <Row label="Technician" value={selectedJob.user?.name || user?.name || "\u2014"} />
                  </div>
                </div>

                {/* ── Foam System Specs ── */}
                <div className="glass-card p-5 print-section">
                  <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3 font-semibold print-section-title">
                    Foam System Specifications
                  </h4>
                  {selectedJob.foamSystem ? (
                    <div className="print-grid">
                      <Row label="Product" value={`${selectedJob.foamSystem.manufacturer} ${selectedJob.foamSystem.product}`} />
                      <Row label="Type" value={selectedJob.foamSystem.type === "closed_cell" ? "Closed Cell" : "Open Cell"} />
                      <Row label="R-Value" value={`R-${selectedJob.foamSystem.rValue}`} />
                      <Row label="Target Yield" value={`${fmtNum(selectedJob.foamSystem.yieldPerSet)} bf/set`} />
                    </div>
                  ) : (
                    <p className="text-sm text-white/30">No foam system recorded</p>
                  )}
                </div>

                {/* ── Weather Conditions ── */}
                <div className="glass-card p-5 print-section">
                  <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3 font-semibold print-section-title">
                    Weather Conditions at Application
                  </h4>
                  <div className="print-grid">
                    <Row label="Ambient Temp" value={selectedJob.ambientTemp != null ? `${fmtNum(selectedJob.ambientTemp)}°F` : "\u2014"} />
                    <Row label="Humidity" value={selectedJob.humidity != null ? `${fmtNum(selectedJob.humidity)}%` : "\u2014"} />
                    <Row label="Dew Point" value={dewPoint != null ? `${fmtNum(dewPoint, 1)}°F` : "\u2014"} />
                    <Row label="Substrate Temp" value={selectedJob.substrateTemp != null ? `${fmtNum(selectedJob.substrateTemp)}°F` : "\u2014"} />
                    {selectedJob.substrateTemp != null && dewPoint != null && (
                      <Row
                        label="Margin above Dew Point"
                        value={`${fmtNum(selectedJob.substrateTemp - dewPoint, 1)}°F`}
                        highlight={selectedJob.substrateTemp - dewPoint < 10 ? "red" : selectedJob.substrateTemp - dewPoint < 15 ? "yellow" : "green"}
                      />
                    )}
                  </div>
                </div>

                {/* ── Equipment Settings ── */}
                {(selectedJob.hoseTempA != null || selectedJob.hoseTempB != null || selectedJob.drumTempA != null || selectedJob.pressureA != null) && (
                  <div className="glass-card p-5 print-section">
                    <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3 font-semibold print-section-title">
                      Equipment Settings
                    </h4>
                    <div className="print-grid-3">
                      <Row label="Hose Temp A" value={selectedJob.hoseTempA != null ? `${fmtNum(selectedJob.hoseTempA)}°F` : "\u2014"} />
                      <Row label="Hose Temp B" value={selectedJob.hoseTempB != null ? `${fmtNum(selectedJob.hoseTempB)}°F` : "\u2014"} />
                      <div />
                      <Row label="Drum Temp A" value={selectedJob.drumTempA != null ? `${fmtNum(selectedJob.drumTempA)}°F` : "\u2014"} />
                      <Row label="Drum Temp B" value={selectedJob.drumTempB != null ? `${fmtNum(selectedJob.drumTempB)}°F` : "\u2014"} />
                      <div />
                      <Row label="Pressure A" value={selectedJob.pressureA != null ? `${fmtNum(selectedJob.pressureA)} psi` : "\u2014"} />
                      <Row label="Pressure B" value={selectedJob.pressureB != null ? `${fmtNum(selectedJob.pressureB)} psi` : "\u2014"} />
                    </div>
                  </div>
                )}

                {/* ── Production Data ── */}
                <div className="glass-card p-5 print-section">
                  <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3 font-semibold print-section-title">
                    Production Data
                  </h4>
                  <div className="print-grid">
                    <Row label="Sets Used" value={selectedJob.setsUsed != null ? fmtNum(selectedJob.setsUsed, 2) : "\u2014"} />
                    <Row label="Total Gallons" value={selectedJob.gallonsTotal != null ? `${fmtNum(selectedJob.gallonsTotal)} gal` : "\u2014"} />
                    <Row label="Board Feet" value={selectedJob.boardFeet != null ? `${fmtNum(selectedJob.boardFeet)} BF` : "\u2014"} />
                    <Row label="Square Feet" value={selectedJob.squareFeet != null ? `${fmtNum(selectedJob.squareFeet)} sq ft` : "\u2014"} />
                    <Row label="Thickness" value={selectedJob.thickness != null ? `${fmtNum(selectedJob.thickness, 1)}"` : "\u2014"} />
                  </div>
                </div>

                {/* ── Yield Data ── */}
                <div className="glass-card p-5 print-section">
                  <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3 font-semibold print-section-title">
                    Yield Analysis
                  </h4>
                  <div className="print-grid">
                    <Row
                      label="Actual Yield"
                      value={selectedJob.yieldActual != null ? `${fmtNum(selectedJob.yieldActual)} bf/set` : "\u2014"}
                    />
                    <Row
                      label="Target Yield"
                      value={selectedJob.yieldTarget != null ? `${fmtNum(selectedJob.yieldTarget)} bf/set` : "\u2014"}
                    />
                    <Row
                      label="Variance"
                      value={selectedJob.yieldVariance != null
                        ? `${selectedJob.yieldVariance >= 0 ? "+" : ""}${fmtNum(selectedJob.yieldVariance, 1)}%`
                        : "\u2014"
                      }
                      highlight={
                        selectedJob.yieldVariance != null
                          ? selectedJob.yieldVariance >= 0 ? "green" : "red"
                          : undefined
                      }
                    />
                  </div>
                </div>

                {/* ── Quality ── */}
                <div className="glass-card p-5 print-section">
                  <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3 font-semibold print-section-title">
                    Quality Assessment
                  </h4>

                  {/* Rating */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-white/40 print-label">Rating</span>
                    <span className="text-2xl tracking-widest text-orange print-stars">
                      {stars(selectedJob.rating)}
                    </span>
                    {selectedJob.rating != null && (
                      <span className="text-sm text-white/40 print-value">
                        ({selectedJob.rating}/5)
                      </span>
                    )}
                  </div>

                  {/* Problems */}
                  <div className="mb-4">
                    <span className="block text-sm text-white/40 mb-2 print-label">Issues / Problems</span>
                    <div className="flex flex-wrap gap-2 print-problems">
                      {selectedJob.problems && selectedJob.problems.length > 0 ? (
                        selectedJob.problems.map((p) => (
                          <span
                            key={p}
                            className={`px-3 py-1 rounded-lg text-xs border ${
                              p === "None"
                                ? "bg-green-500/15 text-green-400 border-green-500/30 print-problem-none"
                                : "bg-red-500/15 text-red-400 border-red-500/30 print-problem-chip"
                            }`}
                          >
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-white/30">No issues reported</span>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <span className="block text-sm text-white/40 mb-2 print-label">Notes</span>
                    <div className="p-3 rounded-xl bg-white/3 border border-white/8 text-sm text-white/70 min-h-[60px] whitespace-pre-wrap print-notes">
                      {selectedJob.notes || "No notes recorded"}
                    </div>
                  </div>
                </div>

                {/* ── Site Photos ── */}
                {selectedJob.photos && selectedJob.photos.length > 0 && (
                  <div>
                    <span className="block text-sm text-white/40 mb-2 print-label">Site Photos</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedJob.photos.map((photo, idx) => (
                        // eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo from dynamic URL
                        <img
                          key={idx}
                          src={photo}
                          alt={`Site photo ${idx + 1}`}
                          className="w-full h-32 rounded-xl object-cover border border-white/10 cursor-pointer hover:border-orange/40 transition-all"
                          onClick={() => window.open(photo, "_blank")}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Footer (visible in print) ── */}
                <div className="print-footer hidden">
                  <span>Generated by FoamDial Pro</span>
                  <span>Report Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                  <span>Page 1 of 1</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ── Row sub-component ── */

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "green" | "red" | "yellow";
}) {
  const colorClass = highlight === "green"
    ? "text-green-400 print-variance-pos"
    : highlight === "red"
    ? "text-red-400 print-variance-neg"
    : highlight === "yellow"
    ? "text-yellow-400"
    : "text-white";

  return (
    <div className="flex justify-between py-1.5 border-b border-white/5 print-row">
      <span className="text-sm text-white/50 print-label">{label}</span>
      <span className={`text-sm font-medium print-value ${colorClass}`}>{value}</span>
    </div>
  );
}
