'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import SignIn from '@/components/sign-in';
import DashboardShell from '@/components/dashboard-shell';
import OverviewPage from '@/components/overview-page';
import LeadsPage from '@/components/leads-page';
import LeadDetail from '@/components/lead-detail';
import AlertsPage from '@/components/alerts-page';
import ScorecardPage from '@/components/scorecard-page';

type Page = 'overview' | 'leads' | 'alerts' | 'scorecard';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [activePage, setActivePage] = useState<Page>('overview');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <SignIn />;
  }

  const handleViewLead = (id: string) => {
    setSelectedLeadId(id);
    setActivePage('leads');
  };

  const handleBackFromDetail = () => {
    setSelectedLeadId(null);
  };

  const handleNavigate = (page: Page) => {
    setActivePage(page);
    setSelectedLeadId(null);
  };

  return (
    <DashboardShell activePage={activePage} onNavigate={handleNavigate}>
      {activePage === 'overview' && <OverviewPage onViewLead={handleViewLead} />}
      {activePage === 'leads' && !selectedLeadId && <LeadsPage onViewLead={handleViewLead} />}
      {activePage === 'leads' && selectedLeadId && (
        <LeadDetail leadId={selectedLeadId} onBack={handleBackFromDetail} />
      )}
      {activePage === 'alerts' && <AlertsPage onViewLead={handleViewLead} />}
      {activePage === 'scorecard' && <ScorecardPage />}
    </DashboardShell>
  );
}
