"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import SignIn from "@/components/sign-in";
import Sidebar from "@/components/sidebar";
import Dashboard from "@/components/dashboard";
import JobLogger from "@/components/job-logger";
import type { JobLoggerPreFill, JobLoggerResume } from "@/components/job-logger";
import BFCalculator from "@/components/bf-calculator";
import DialInCalculator from "@/components/dial-in-calculator";
import FoamDatabase from "@/components/foam-database";
import DiagnosticsPage from "@/components/diagnostics-page";
import AdminDashboard from "@/components/admin-dashboard";
import JobSitesList from "@/components/job-sites-list";
import JobSiteDetail from "@/components/job-site-detail";
import NewJobSite from "@/components/new-job-site";

import GunReference from "@/components/gun-reference";
import EODReport from "@/components/eod-report";
import PatternDetection from "@/components/pattern-detection";
import QCReport from "@/components/qc-report";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [loggerPreFill, setLoggerPreFill] = useState<JobLoggerPreFill | null>(null);
  const [loggerResume, setLoggerResume] = useState<JobLoggerResume | null>(null);

  const handleNavigate = useCallback((page: string) => {
    // Handle "site-detail:id" navigation from job logger
    if (page.startsWith("site-detail:")) {
      const siteId = page.split(":")[1];
      setSelectedSiteId(siteId);
      setActivePage("site-detail");
      setLoggerPreFill(null);
      return;
    }
    // Handle "resume-job:id" — fetch the in-progress job and load EVERY
    // morning value into the logger so Jason only edits what changed.
    // Submitting will PATCH this job (not create a new one).
    if (page.startsWith("resume-job:")) {
      const jobId = page.split(":")[1];
      fetch(`/api/jobs/${jobId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data) {
            const j = data.data;
            setLoggerResume({
              jobId: j.id,
              jobSiteId: j.jobSiteId || "",
              location: j.location,
              substrate: j.substrate || "",
              jobType: j.jobType || "",
              foamSystemId: j.foamSystemId || "",
              chamberSize: j.chamberSize != null ? String(j.chamberSize) : "",
              ambientTemp: j.ambientTemp != null ? String(j.ambientTemp) : "",
              substrateTemp: j.substrateTemp != null ? String(j.substrateTemp) : "",
              humidity: j.humidity != null ? String(j.humidity) : "",
              hoseTempA: j.hoseTempA != null ? String(j.hoseTempA) : "",
              hoseTempB: j.hoseTempB != null ? String(j.hoseTempB) : "",
              drumTempA: j.drumTempA != null ? String(j.drumTempA) : "",
              drumTempB: j.drumTempB != null ? String(j.drumTempB) : "",
              pressureA: j.pressureA != null ? String(j.pressureA) : "",
              pressureB: j.pressureB != null ? String(j.pressureB) : "",
              notes: j.notes || "",
            });
            setLoggerPreFill(null);
            setActivePage("job-logger");
          }
        })
        .catch(() => {
          setActivePage("dashboard");
        });
      return;
    }
    setActivePage(page);
    if (page !== "job-logger") {
      setLoggerPreFill(null);
      setLoggerResume(null);
    }
    if (page !== "site-detail") {
      setSelectedSiteId(null);
    }
  }, []);

  const handleViewSite = useCallback((siteId: string) => {
    setSelectedSiteId(siteId);
    setActivePage("site-detail");
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLogWork = useCallback((site: any) => {
    setLoggerPreFill({
      jobSiteId: site.id,
      location: site.name + (site.address ? ` - ${site.address}` : ""),
      substrate: site.substrate || "",
      jobType: site.jobType || "",
      foamSystemId: site.foamSystemId || "",
    });
    setActivePage("job-logger");
  }, []);

  const handleSiteCreated = useCallback((siteId: string) => {
    setSelectedSiteId(siteId);
    setActivePage("site-detail");
  }, []);

  // Determine which page the sidebar should highlight
  const sidebarPage = activePage === "site-detail" || activePage === "new-job-site"
    ? "job-sites-list"
    : activePage;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-orange/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-lg font-bold text-orange">FD</span>
          </div>
          <div className="text-sm text-white/30">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignIn />;
  }

  return (
    <div className="min-h-screen relative">
      {/* Atmospheric background layers */}
      <div className="fd-bg-base" />
      <div className="fd-bg-grain" />
      <div className="fd-bg-mesh" />
      <div className="fd-bg-foam" />
      <div className="fd-bg-glow" />
      <div className="fd-bg-glow-warm" />
      <div className="fd-bg-vignette" />

      {/* Top navigation */}
      <Sidebar activePage={sidebarPage} onNavigate={handleNavigate} />

      {/* Main content — full width, centered */}
      <main className="w-full max-w-[1400px] mx-auto px-4 pt-6 pb-12 sm:px-6 lg:px-8 relative z-10">
        {activePage === "dashboard" && (
          <Dashboard onNavigate={handleNavigate} onViewSite={handleViewSite} />
        )}
        {activePage === "job-sites-list" && (
          <JobSitesList onNavigate={handleNavigate} onViewSite={handleViewSite} />
        )}
        {activePage === "site-detail" && selectedSiteId && (
          <JobSiteDetail
            siteId={selectedSiteId}
            onNavigate={handleNavigate}
            onLogWork={handleLogWork}
          />
        )}
        {activePage === "new-job-site" && (
          <NewJobSite onNavigate={handleNavigate} onCreated={handleSiteCreated} />
        )}
        {activePage === "job-logger" && (
          <JobLogger onNavigate={handleNavigate} preFill={loggerPreFill} resume={loggerResume} />
        )}
        {activePage === "bf-calculator" && <BFCalculator />}
        {activePage === "calculator" && <DialInCalculator />}
        {activePage === "foam-db" && <FoamDatabase />}
        {activePage === "diagnostics" && <DiagnosticsPage onNavigate={handleNavigate} />}
        {activePage === "gun-reference" && <GunReference />}
        {activePage === "admin" && <AdminDashboard />}

        {activePage === "eod-report" && <EODReport />}
        {activePage === "patterns" && <PatternDetection />}
        {activePage === "qc-report" && <QCReport onNavigate={handleNavigate} />}
      </main>
    </div>
  );
}
