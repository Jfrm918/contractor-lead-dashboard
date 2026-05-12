"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type InProgressJob = {
  id: string;
  location: string;
  date: string;
  morningLoggedAt: string | null;
  chamberSize: number | null;
  drumTempA: number | null;
  drumTempB: number | null;
  pressureA: number | null;
  pressureB: number | null;
  jobSiteId: string | null;
  jobSite: { id: string; name: string } | null;
  events: Array<{
    id: string;
    timestamp: string;
    eventType: string;
    payload: Record<string, unknown>;
    notes: string | null;
  }>;
};

const EVENT_TYPES = [
  { id: "temp_change", label: "Temp change" },
  { id: "pressure_change", label: "Pressure change" },
  { id: "problem", label: "Problem" },
  { id: "note", label: "Note" },
] as const;

export default function InProgressCard({ onResume }: { onResume: (jobId: string, siteId: string | null) => void }) {
  const [jobs, setJobs] = useState<InProgressJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventTarget, setEventTarget] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/jobs/in-progress");
      const data = await r.json();
      if (data.success) setJobs(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  if (loading) return null;
  if (jobs.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange/90">
          In progress · day not closed
        </h2>
        <span className="text-[10px] text-white/30">
          {jobs.length} active {jobs.length === 1 ? "job" : "jobs"}
        </span>
      </div>
      {jobs.map((j) => (
        <JobCard
          key={j.id}
          job={j}
          eventOpen={eventTarget === j.id}
          onOpenEvent={() => setEventTarget(j.id)}
          onCloseEvent={() => setEventTarget(null)}
          onEventSaved={refresh}
          onResume={() => onResume(j.id, j.jobSiteId)}
        />
      ))}
    </div>
  );
}

function JobCard({
  job: j,
  eventOpen,
  onOpenEvent,
  onCloseEvent,
  onEventSaved,
  onResume,
}: {
  job: InProgressJob;
  eventOpen: boolean;
  onOpenEvent: () => void;
  onCloseEvent: () => void;
  onEventSaved: () => void;
  onResume: () => void;
}) {
  const morning = j.morningLoggedAt
    ? new Date(j.morningLoggedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      className="rounded-2xl border border-orange/30 p-4"
      style={{
        background: "linear-gradient(180deg, rgba(249,115,22,0.06) 0%, rgba(249,115,22,0.02) 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[16px] font-semibold text-white truncate">
            {j.jobSite?.name || j.location}
          </h3>
          <p className="mt-1 text-[12px] text-white/50">
            {morning ? <>Morning logged {morning}</> : <>Started {new Date(j.date).toLocaleDateString()}</>}
            {j.chamberSize ? <> · Chamber {j.chamberSize}</> : null}
            {j.drumTempA ? <> · Drum A/B {j.drumTempA}/{j.drumTempB}°F</> : null}
            {j.pressureA ? <> · {j.pressureA}/{j.pressureB} PSI</> : null}
          </p>
          {j.events.length > 0 && (
            <p className="mt-1 text-[11px] text-white/35">
              {j.events.length} event{j.events.length === 1 ? "" : "s"} logged today
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={onResume}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-orange text-white hover:bg-orange-light transition-colors"
          >
            Close out day
          </button>
          <button
            onClick={onOpenEvent}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium border border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.06] transition-colors"
          >
            + Add event
          </button>
        </div>
      </div>

      <AnimatePresence>
        {eventOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 overflow-hidden"
          >
            <EventForm jobId={j.id} onSaved={() => { onEventSaved(); onCloseEvent(); }} onCancel={onCloseEvent} />
          </motion.div>
        )}
      </AnimatePresence>

      {j.events.length > 0 && (
        <div className="mt-4 border-t border-white/[0.06] pt-3 space-y-1.5">
          {j.events.slice(-5).map((ev) => (
            <EventLine key={ev.id} event={ev} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventLine({ event }: { event: InProgressJob["events"][number] }) {
  const time = new Date(event.timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  let summary = "";
  const p = event.payload as Record<string, unknown>;
  switch (event.eventType) {
    case "temp_change":
      summary = `${p.channel || "Temp"} ${p.from}°F → ${p.to}°F`;
      break;
    case "pressure_change":
      summary = `${p.channel || "Pressure"} ${p.from} PSI → ${p.to} PSI`;
      break;
    case "problem":
      summary = String(p.problem || "Problem logged");
      break;
    case "note":
      summary = event.notes || "Note";
      break;
    default:
      summary = event.eventType;
  }
  return (
    <div className="flex items-start gap-3 text-[12px]">
      <span className="text-white/35 tabular-nums w-16 shrink-0">{time}</span>
      <span className="text-white/75 flex-1">{summary}</span>
      {event.notes && summary !== event.notes && (
        <span className="text-white/40 italic max-w-[40%] truncate" title={event.notes}>
          {event.notes}
        </span>
      )}
    </div>
  );
}

function EventForm({ jobId, onSaved, onCancel }: { jobId: string; onSaved: () => void; onCancel: () => void }) {
  const [type, setType] = useState<typeof EVENT_TYPES[number]["id"]>("temp_change");
  const [channel, setChannel] = useState("drumA");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [problem, setProblem] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      let payload: Record<string, unknown> = {};
      if (type === "temp_change") {
        payload = { channel, from: from ? parseFloat(from) : null, to: to ? parseFloat(to) : null, unit: "F" };
      } else if (type === "pressure_change") {
        payload = { channel, from: from ? parseFloat(from) : null, to: to ? parseFloat(to) : null, unit: "PSI" };
      } else if (type === "problem") {
        payload = { problem };
      }
      await fetch(`/api/jobs/${jobId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: type, payload, notes: notes || null }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        {EVENT_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setType(t.id)}
            className={`px-2.5 py-1 rounded-md text-[11.5px] font-medium border transition-colors ${
              type === t.id
                ? "border-orange/40 bg-orange/10 text-orange-light"
                : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(type === "temp_change" || type === "pressure_change") && (
        <div className="grid grid-cols-3 gap-2">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="input-field text-sm"
          >
            {type === "temp_change" ? (
              <>
                <option value="drumA">Drum A</option>
                <option value="drumB">Drum B</option>
                <option value="hoseA">Hose A</option>
                <option value="hoseB">Hose B</option>
              </>
            ) : (
              <>
                <option value="A">Side A</option>
                <option value="B">Side B</option>
              </>
            )}
          </select>
          <input
            type="number"
            inputMode="numeric"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder={type === "temp_change" ? "from °F" : "from PSI"}
            className="input-field text-sm"
          />
          <input
            type="number"
            inputMode="numeric"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={type === "temp_change" ? "to °F" : "to PSI"}
            className="input-field text-sm"
          />
        </div>
      )}

      {type === "problem" && (
        <input
          type="text"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="What happened? (e.g. Chamber clogging, Off-ratio)"
          className="input-field text-sm"
        />
      )}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        rows={2}
        className="input-field resize-none text-sm"
      />

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-[12px] text-white/60 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-orange text-white hover:bg-orange-light disabled:opacity-50"
        >
          {saving ? "Saving..." : "Log event"}
        </button>
      </div>
    </div>
  );
}
