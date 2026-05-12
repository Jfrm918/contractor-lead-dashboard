"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface FoamSystem {
  id: string;
  manufacturer: string;
  product: string;
  type: string;
  yieldPerSet: number;
}

const JOB_TYPES = [
  { id: "metal_building", label: "Metal Building" },
  { id: "underfloor", label: "Underfloor/Crawlspace" },
  { id: "stemwall", label: "Stemwall" },
  { id: "new_construction", label: "New Construction (Wood)" },
  { id: "retrofit", label: "Retrofit (Wood)" },
  { id: "mixed", label: "Mixed" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export default function NewJobSite({
  onNavigate,
  onCreated,
}: {
  onNavigate: (page: string) => void;
  onCreated: (siteId: string) => void;
}) {
  const [foamSystems, setFoamSystems] = useState<FoamSystem[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    jobType: "",
    substrate: "",
    foamSystemId: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/foam-systems")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setFoamSystems(d.data);
      });
  }, []);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/job-sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          address: form.address || null,
          jobType: form.jobType || null,
          substrate: form.substrate || null,
          foamSystemId: form.foamSystemId || null,
          notes: form.notes || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onCreated(data.data.id);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-2xl mx-auto space-y-4 pb-8"
    >
      <motion.div variants={item}>
        <motion.button
          onClick={() => onNavigate("dashboard")}
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </motion.button>
        <h1 className="text-xl text-white font-medium">New Job Site</h1>
        <p className="text-xs text-white/40 mt-0.5">Create a multi-day project site</p>
      </motion.div>

      {/* Name & Address */}
      <motion.div variants={item} className="glass-card p-4 space-y-3">
        <div>
          <label className="block text-[10px] text-white/30 mb-1">Site Name *</label>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g., Tulsa Hills Metal Building"
            className="input-field input-glow"
          />
        </div>
        <div>
          <label className="block text-[10px] text-white/30 mb-1">Address</label>
          <input
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="e.g., 123 Main St, Tulsa, OK"
            className="input-field input-glow"
          />
        </div>
      </motion.div>

      {/* Job Type */}
      <motion.div variants={item} className="glass-card p-4">
        <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Job Type</label>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((jt) => (
            <motion.button
              key={jt.id}
              onClick={() => update("jobType", form.jobType === jt.id ? "" : jt.id)}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                form.jobType === jt.id
                  ? "bg-orange/20 text-orange border border-orange/30"
                  : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
              }`}
            >
              {jt.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Substrate & Foam System */}
      <motion.div variants={item} className="glass-card p-4 space-y-3">
        <div>
          <label className="block text-[10px] text-white/30 mb-1">Substrate</label>
          <input
            value={form.substrate}
            onChange={(e) => update("substrate", e.target.value)}
            placeholder="e.g., Metal, OSB, Concrete"
            className="input-field input-glow"
          />
        </div>
        <div>
          <label className="block text-[10px] text-white/30 mb-1">Foam System</label>
          <select
            value={form.foamSystemId}
            onChange={(e) => update("foamSystemId", e.target.value)}
            className="input-field input-glow text-sm"
          >
            <option value="">Select foam system (optional)</option>
            {foamSystems.map((f) => (
              <option key={f.id} value={f.id}>
                {f.manufacturer} {f.product} ({f.type === "closed_cell" ? "CC" : "OC"})
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Notes */}
      <motion.div variants={item} className="glass-card p-4">
        <label className="block text-[10px] text-white/30 mb-1">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Any notes about this job site..."
          rows={3}
          className="input-field input-glow resize-none text-sm"
        />
      </motion.div>

      {/* Submit */}
      <motion.div variants={item}>
        <motion.button
          onClick={handleSubmit}
          disabled={saving || !form.name.trim()}
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="w-full py-4 rounded-2xl text-base font-medium bg-orange text-white hover:bg-orange-light disabled:opacity-50 transition-all shadow-lg shadow-orange/20"
        >
          {saving ? "Creating..." : "Create Job Site"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
