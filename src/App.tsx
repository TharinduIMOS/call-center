import React, { useState, useEffect, useCallback } from 'react';
import type { Lead, Batch, OverallStats, AgentPerformance, LeadStatus, UserRole, UserAccount } from './types';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { NumberByNumberDialer } from './components/NumberByNumberDialer';
import { LeadsTable } from './components/LeadsTable';
import { AgentPerformanceView } from './components/AgentPerformanceView';
import { ExcelUploadModal } from './components/ExcelUploadModal';
import { ScreenshotModal } from './components/ScreenshotModal';
import { LeadDetailModal } from './components/LeadDetailModal';
import { RoleExplainerModal } from './components/RoleExplainerModal';
import { AuthModal } from './components/AuthModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { GuestWelcomeScreen } from './components/GuestWelcomeScreen';
import {
  CheckCircle2,
  AlertCircle,
  Shield,
  User,
  HelpCircle,
  FileSpreadsheet,
  PhoneCall,
  UserPlus,
  KeyRound,
  Lock,
} from 'lucide-react';

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [stats, setStats] = useState<OverallStats>({
    totalLeads: 0,
    pending: 0,
    answered: 0,
    notAnswered: 0,
    willPay: 0,
    callback: 0,
    wrongNumber: 0,
    totalWillPayAmount: 0,
    screenshotsUploaded: 0,
    completionRate: 0,
  });
  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [availableAgents, setAvailableAgents] = useState<string[]>(['Agent 1']);
  const [activeAgent, setActiveAgent] = useState<string>('Agent 1');

  // Authentication & Role Management:
  // Starts with NO logins on initial page load per user requirement
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'admin_login' | 'user_register' | 'user_login'>('admin_login');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [roleExplainerOpen, setRoleExplainerOpen] = useState(false);

  // Synchronize role whenever currentUser changes
  const handleUserLoginSuccess = (user: UserAccount, message?: string) => {
    setCurrentUser(user);
    setUserRole(user.role);
    if (user.role === 'user') {
      setActiveAgent(user.name);
      if (!availableAgents.includes(user.name)) {
        setAvailableAgents((prev) => [...prev, user.name]);
      }
    }
    refreshData();
    showToast(message || `Logged in as ${user.name} (${user.role.toUpperCase()})`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole('user');
    setLeads([]);
    setBatches([]);
    setCurrentLeadId(null);
    setStats({
      totalLeads: 0,
      pending: 0,
      answered: 0,
      notAnswered: 0,
      interested: 0,
      callback: 0,
      wrongNumber: 0,
      screenshotsUploaded: 0,
      completionRate: 0,
    });
    showToast('Signed out successfully. Switched to guest view.');
  };

  // UI Navigation & Modals
  const [currentTab, setCurrentTab] = useState<'dialer' | 'queue' | 'analytics'>('dialer');
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [screenshotModalLead, setScreenshotModalLead] = useState<Lead | null>(null);
  const [detailModalLead, setDetailModalLead] = useState<Lead | null>(null);
  const [isLiveSync, setIsLiveSync] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch all leads and batches
  const refreshData = useCallback(async () => {
    try {
      const [leadsRes, batchesRes, statsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/batches'),
        fetch('/api/stats'),
      ]);

      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data.leads || []);
        // If no active lead selected yet, pick the first pending lead
        setCurrentLeadId((prev) => {
          if (prev && data.leads.some((l: Lead) => l.id === prev)) return prev;
          const pending = data.leads.find((l: Lead) => l.status === 'pending');
          return pending ? pending.id : data.leads[0]?.id || null;
        });
      }

      if (batchesRes.ok) {
        const data = await batchesRes.json();
        setBatches(data.batches || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.overall) setStats(data.overall);
        if (data.agents) {
          setAgents(data.agents);
          // Auto-accumulate any agent names from server stats
          data.agents.forEach((ag: AgentPerformance) => {
            if (ag.agentName && !availableAgents.includes(ag.agentName)) {
              setAvailableAgents((prev) => [...prev, ag.agentName]);
            }
          });
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, [availableAgents]);

  // Data load: Only fetch operational leads when authenticated
  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser, refreshData]);

  // Real-Time Server-Sent Events (SSE) listener
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/stream');

      eventSource.onopen = () => {
        setIsLiveSync(true);
      };

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.event === 'lead_updated') {
            const updated = data.payload?.lead;
            if (updated) {
              setLeads((prev) =>
                prev.map((l) => (l.id === updated.id ? updated : l))
              );
            }
            refreshData();
          } else if (data.event === 'batch_imported') {
            showToast(`New leads batch "${data.payload?.batch?.name}" imported in real-time!`);
            refreshData();
          } else if (data.event === 'screenshot_uploaded') {
            refreshData();
          } else if (data.event === 'data_reset' || data.event === 'batch_deleted') {
            refreshData();
          }
        } catch {
          // ignore parse error
        }
      };

      eventSource.onerror = () => {
        setIsLiveSync(false);
      };
    } catch {
      setIsLiveSync(false);
    }

    // Polling backup every 6 seconds for redundancy
    const pollInterval = setInterval(() => {
      refreshData();
    }, 6000);

    return () => {
      eventSource?.close();
      clearInterval(pollInterval);
    };
  }, [refreshData]);

  // Handle saving updates from Dialer
  const handleSaveLeadUpdate = async (
    leadId: string,
    update: {
      status: LeadStatus;
      notes: string;
      screenshotUrl?: string;
      callDurationSeconds?: number;
      willPayAmount?: number;
      willPayDate?: string;
    }
  ) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/call-update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...update,
          agentName: activeAgent,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update lead');
      }

      const data = await res.json();
      const updatedLead = data.lead;

      // Optimistically update local state
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? updatedLead : l))
      );

      showToast(`Saved status "${update.status.replace('_', ' ').toUpperCase()}" for ${updatedLead.customerName}`);
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Could not save call update');
    }
  };

  // Quick status update from Table
  const handleQuickUpdateStatus = async (leadId: string, status: LeadStatus) => {
    await handleSaveLeadUpdate(leadId, {
      status,
      notes: `Quick status change to ${status}`,
    });
  };

  // Batch delete
  const handleDeleteBatch = async (batchId: string) => {
    try {
      const res = await fetch(`/api/batches/${batchId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Batch removed successfully');
        refreshData();
      }
    } catch {
      alert('Failed to delete batch');
    }
  };

  // Reset demo
  const handleResetDemo = async () => {
    if (confirm('Reset to initial customer-ready contacts and queue?')) {
      await fetch('/api/reset-demo', { method: 'POST' });
      showToast('Queue restored to initial clean state');
      refreshData();
    }
  };

  // Clear all call history
  const handleClearCallHistory = async () => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('Administrator sign in required to clear call history.', 'info');
      setAuthModalTab('admin_login');
      setAuthModalOpen(true);
      return;
    }
    const confirmed = window.confirm(
      'Are you sure you want to clear all call history? This resets all contact statuses to pending and clears all call attempt logs.'
    );
    if (!confirmed) return;

    try {
      const res = await fetch('/api/admin/clear-all-call-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
        },
      });
      if (res.ok) {
        showToast('All call history has been cleared successfully.');
        refreshData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to clear call history', 'info');
      }
    } catch {
      showToast('Network error while clearing call history', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white antialiased">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 p-3.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenUpload={() => setUploadModalOpen(true)}
        onResetDemo={handleResetDemo}
        onClearCallHistory={handleClearCallHistory}
        activeAgent={activeAgent}
        onChangeAgent={setActiveAgent}
        availableAgents={availableAgents}
        isLiveSync={isLiveSync}
        userRole={userRole}
        onChangeRole={(r) => {
          if (r === 'admin' && currentUser?.role !== 'admin') {
            setAuthModalTab('admin_login');
            setAuthModalOpen(true);
            return;
          }
          setUserRole(r);
        }}
        onOpenRoleExplainer={() => setRoleExplainerOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={(tab = 'admin_login') => {
          setAuthModalTab(tab);
          setAuthModalOpen(true);
        }}
        onOpenChangePassword={() => setChangePasswordOpen(true)}
        onLogout={handleLogout}
      />

      {/* Role Context Bar - Displays when user is authenticated */}
      {currentUser && (
        <div className="bg-slate-100/90 border-b border-slate-200 py-2.5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {currentUser.role === 'admin' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 font-bold border border-indigo-200 shadow-xs">
                  <Shield className="w-3.5 h-3.5 text-indigo-700" /> ADMIN VIEW (Full Access)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold border border-emerald-200 shadow-xs">
                  <User className="w-3.5 h-3.5 text-emerald-700" /> CALL AGENT ({currentUser.name})
                </span>
              )}

              <span className="text-slate-600 hidden sm:inline text-xs">
                {currentUser.role === 'admin' ? (
                  <>
                    Excel: <strong className="text-indigo-700">Authorized</strong> • Upload batches & supervise team.
                  </>
                ) : (
                  <>
                    Excel: <strong className="text-amber-700">Admin Only</strong> • Call outreach & WhatsApp logging.
                  </>
                )}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {currentUser.role === 'admin' ? (
                <button
                  id="context-bar-upload-excel-btn"
                  type="button"
                  onClick={() => setUploadModalOpen(true)}
                  className="text-indigo-700 hover:text-indigo-900 font-bold underline flex items-center gap-1 text-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Upload Leads
                </button>
              ) : (
                <button
                  id="context-bar-switch-admin-btn"
                  type="button"
                  onClick={() => {
                    setAuthModalTab('admin_login');
                    setAuthModalOpen(true);
                  }}
                  className="text-indigo-700 hover:text-indigo-900 font-bold bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs transition-colors text-xs"
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-600" /> Switch to Admin
                </button>
              )}

              <button
                id="context-bar-register-agent-btn"
                type="button"
                onClick={() => {
                  setAuthModalTab('user_register');
                  setAuthModalOpen(true);
                }}
                className="text-slate-700 hover:text-slate-900 font-semibold bg-white border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs transition-colors text-xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-slate-500" /> Register Agent
              </button>

              <button
                type="button"
                onClick={() => setRoleExplainerOpen(true)}
                className="text-slate-500 hover:text-slate-800 hidden sm:flex items-center gap-1 ml-1 font-medium text-xs"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {!currentUser ? (
          <GuestWelcomeScreen
            onOpenAuthModal={(tab) => {
              setAuthModalTab(tab);
              setAuthModalOpen(true);
            }}
            onOpenRoleExplainer={() => setRoleExplainerOpen(true)}
          />
        ) : (
          <>
            {/* KPI Metrics Summary */}
            <StatsOverview stats={stats} />

            {/* Tab Content */}
            {currentTab === 'dialer' && (
              <NumberByNumberDialer
                leads={leads}
                currentLeadId={currentLeadId}
                onSelectLeadId={setCurrentLeadId}
                onSaveLeadUpdate={handleSaveLeadUpdate}
                onViewScreenshot={(lead) => setScreenshotModalLead(lead)}
                activeAgent={activeAgent}
              />
            )}

            {currentTab === 'queue' && (
              <LeadsTable
                leads={leads}
                batches={batches}
                onSelectLeadForDialer={(id) => {
                  setCurrentLeadId(id);
                  setCurrentTab('dialer');
                }}
                onViewLeadDetails={(lead) => setDetailModalLead(lead)}
                onViewScreenshot={(lead) => setScreenshotModalLead(lead)}
                onQuickUpdateStatus={handleQuickUpdateStatus}
              />
            )}

            {currentTab === 'analytics' && (
              <AgentPerformanceView
                agents={agents}
                batches={batches}
                leads={leads}
                onDeleteBatch={handleDeleteBatch}
                onOpenUpload={() => setUploadModalOpen(true)}
                isAdmin={currentUser?.role === 'admin'}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <ExcelUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => {
          showToast('Excel sheet uploaded successfully! Leads added to queue.');
          refreshData();
        }}
        agents={availableAgents}
        currentUser={currentUser}
        onOpenAdminLogin={() => {
          setAuthModalTab('admin_login');
          setAuthModalOpen(true);
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
        onLoginSuccess={handleUserLoginSuccess}
      />

      <ScreenshotModal
        lead={screenshotModalLead}
        onClose={() => setScreenshotModalLead(null)}
      />

      <LeadDetailModal
        lead={detailModalLead}
        onClose={() => setDetailModalLead(null)}
        onViewScreenshot={(lead) => setScreenshotModalLead(lead)}
      />

      <RoleExplainerModal
        isOpen={roleExplainerOpen}
        onClose={() => setRoleExplainerOpen(false)}
        currentRole={currentUser?.role === 'admin' ? 'admin' : 'agent'}
        onRequestAdminLogin={() => {
          setRoleExplainerOpen(false);
          setAuthModalTab('admin_login');
          setAuthModalOpen(true);
        }}
        onRequestAgentLogin={() => {
          setRoleExplainerOpen(false);
          setAuthModalTab('user_login');
          setAuthModalOpen(true);
        }}
        onSelectRole={(role) => {
          if (role === 'admin' && currentUser?.role !== 'admin') {
            setRoleExplainerOpen(false);
            setAuthModalTab('admin_login');
            setAuthModalOpen(true);
            return;
          }
          setUserRole(role);
          showToast(`Switched view to ${role === 'admin' ? 'Admin' : 'Call Center Agent'}`);
        }}
      />

      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        currentUser={currentUser}
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
}
