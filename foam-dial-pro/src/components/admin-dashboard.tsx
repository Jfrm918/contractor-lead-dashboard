"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AdminStats {
  companies: Array<{
    id: string;
    name: string;
    status: string;
    _count: { users: number; jobs: number };
  }>;
  userStats: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    company: { name: string };
    avgYield: number | null;
    avgRating: number | null;
    jobCount: number;
  }>;
  recentJobs: Array<{
    id: string;
    date: string;
    location: string;
    rating: number | null;
    yieldActual: number | null;
    user: { name: string };
    company: { name: string };
    foamSystem: { product: string } | null;
  }>;
  topProblems: Array<{ problem: string; count: number }>;
  totalJobs: number;
  avgYield: number;
  avgRating: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="text-white/30 text-sm py-20 text-center">
        Loading admin data...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-red-400 text-sm py-20 text-center">
        Failed to load admin data. Ensure you have admin access.
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <h2 className="text-lg text-white font-medium">
          Admin Dashboard
        </h2>
        <p className="text-sm text-white/40 mt-1">
          Platform-wide analytics and management
        </p>
      </motion.div>

      {/* Platform stats */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="glass-card p-4">
          <div className="text-xs text-white/40 uppercase tracking-wider">
            Companies
          </div>
          <div className="text-2xl font-light text-white mt-1">
            {stats.companies.length}
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="text-xs text-white/40 uppercase tracking-wider">
            Total Jobs
          </div>
          <div className="text-2xl font-light text-orange mt-1">
            {stats.totalJobs}
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="text-xs text-white/40 uppercase tracking-wider">
            Avg Yield
          </div>
          <div className="text-2xl font-light text-white mt-1">
            {Math.round(stats.avgYield).toLocaleString()} bf
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="text-xs text-white/40 uppercase tracking-wider">
            Avg Rating
          </div>
          <div className="text-2xl font-light text-white mt-1">
            {stats.avgRating.toFixed(1)}/5
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Companies */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-sm text-white/60 uppercase tracking-wider mb-4">
            Companies
          </h3>
          <div className="space-y-3">
            {stats.companies.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-white/3 border border-white/5"
              >
                <div className="flex justify-between items-center">
                  <div className="text-sm text-white font-medium">
                    {c.name}
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      c.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="text-xs text-white/40 mt-1">
                  {c._count.users} user(s) &middot; {c._count.jobs} job(s)
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Installer performance */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-sm text-white/60 uppercase tracking-wider mb-4">
            Installer Performance
          </h3>
          <div className="space-y-3">
            {stats.userStats.map((u) => (
              <div
                key={u.id}
                className="p-3 rounded-xl bg-white/3 border border-white/5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-white font-medium">
                      {u.name}
                    </div>
                    <div className="text-[10px] text-white/30">
                      {u.company.name} &middot; {u.role}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">
                      {u.jobCount} jobs
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-white/50">
                  <span>
                    Yield:{" "}
                    {u.avgYield
                      ? `${Math.round(u.avgYield).toLocaleString()} bf/set`
                      : "N/A"}
                  </span>
                  <span>
                    Rating:{" "}
                    {u.avgRating ? `${u.avgRating.toFixed(1)}/5` : "N/A"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Common problems */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-sm text-white/60 uppercase tracking-wider mb-4">
            Most Common Problems
          </h3>
          {stats.topProblems.length > 0 ? (
            <div className="space-y-2">
              {stats.topProblems.map((p) => (
                <div
                  key={p.problem}
                  className="flex justify-between items-center p-2 rounded-lg bg-white/3"
                >
                  <span className="text-sm text-white/70">{p.problem}</span>
                  <span className="text-xs text-orange font-medium">
                    {p.count}x
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white/30 text-sm py-4 text-center">
              No problems logged yet
            </div>
          )}
        </motion.div>

        {/* Recent activity */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-sm text-white/60 uppercase tracking-wider mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {stats.recentJobs.slice(0, 8).map((j) => (
              <div
                key={j.id}
                className="p-2 rounded-lg bg-white/3 flex justify-between items-start"
              >
                <div>
                  <div className="text-sm text-white/70">{j.location}</div>
                  <div className="text-[10px] text-white/30">
                    {j.user.name} &middot; {j.company.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/40">
                    {new Date(j.date).toLocaleDateString()}
                  </div>
                  {j.rating && (
                    <div className="text-xs text-orange">
                      {"★".repeat(j.rating)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
