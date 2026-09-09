import React, { useState } from 'react';
import {
  Users,
  Award,
  PhoneCall,
  PhoneOff,
  ThumbsUp,
  ShieldCheck,
  Calendar,
  Layers,
  Trash2,
  Download,
  CheckCircle2,
  FileSpreadsheet,
  Lock,
  Clock,
  TrendingUp,
  ChevronRight,
  Filter,
} from 'lucide-react';
import type { AgentPerformance, Batch, Lead } from '../types';
import { exportLeadsToExcel } from '../utils/exportExcel';

interface AgentPerformanceViewProps {
  agents: AgentPerformance[];
  batches: Batch[];
  leads: Lead[];
  onDeleteBatch: (batchId: string) => void;
  onOpenUpload: () => void;
  isAdmin?: boolean;
}

export const AgentPerformanceView: React.FC<AgentPerformanceViewProps> = ({
  agents,
  batches,
  leads,
  onDeleteBatch,
  onOpenUpload,
  isAdmin = true,
}) => {
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string | 'all'>('all');

  // Consolidate agents list from server stats, plus any agents appearing in leads
  const consolidatedAgents: AgentPerformance[] = React.useMemo(() => {
    const map = new Map<string, AgentPerformance>();

    // Seed from agents prop
    agents.forEach((ag) => {
      map.set(ag.agentName, { ...ag });
    });

    // Also scan leads to ensure no agent is omitted
    leads.forEach((l) => {
      const name = l.agentName || l.assignedAgent;
      if (name && !map.has(name)) {
        map.set(name, {
          agentName: name,
          totalCalls: 0,
          answered: 0,
          notAnswered: 0,
          interested: 0,
          callback: 0,
          wrongNumber: 0,
          screenshotsUploaded: 0,
          lastActive: l.updatedAt || '',
        });
      }
    });

    const list = Array.from(map.values());
    // Sort descending by total calls or answered
    return list.sort((a, b) => b.totalCalls - a.totalCalls || b.answered - a.answered);
  }, [agents, leads]);

  // Overall calculations across all agents
  const totalTeamCalls = consolidatedAgents.reduce((acc, a) => acc + (a.totalCalls || 0), 0);
  const totalTeamInterested = consolidatedAgents.reduce(
    (acc, a) => acc + (a.interested ?? (a as any).willPay ?? 0),
    0
  );
  const totalTeamProofs = consolidatedAgents.reduce((acc, a) => acc + (a.screenshotsUploaded || 0), 0);

  const filteredAgents =
    selectedAgentFilter === 'all'
      ? consolidatedAgents
      : consolidatedAgents.filter((a) => a.agentName === selectedAgentFilter);

  return (
    <div id="performance-view-container" className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-600">
                <Award className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Agent Progress & Call Performance
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live tracking of agent call volume, answered rates, positive interest, and verified WhatsApp proofs
            </p>
          </div>

          {/* Quick Filter */}
          {consolidatedAgents.length > 1 && (
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="agent-progress-filter-select"
                aria-label="Filter agent progress by specific team member"
                value={selectedAgentFilter}
                onChange={(e) => setSelectedAgentFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="all">All Agents ({consolidatedAgents.length})</option>
                {consolidatedAgents.map((ag) => (
                  <option key={ag.agentName} value={ag.agentName}>
                    {ag.agentName} ({ag.totalCalls} calls)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Team Summary KPI row */}
        <div className="grid grid-cols-3 gap-3 pt-4 text-center">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-[10px] sm:text-xs font-semibold uppercase text-slate-500 block">Total Staff Calls</span>
            <span className="text-lg sm:text-2xl font-bold text-slate-800">{totalTeamCalls}</span>
          </div>
          <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100">
            <span className="text-[10px] sm:text-xs font-semibold uppercase text-amber-700 block">Interested Leads</span>
            <span className="text-lg sm:text-2xl font-bold text-amber-600">{totalTeamInterested}</span>
          </div>
          <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100">
            <span className="text-[10px] sm:text-xs font-semibold uppercase text-emerald-700 block">Verified Proofs</span>
            <span className="text-lg sm:text-2xl font-bold text-emerald-700">{totalTeamProofs}</span>
          </div>
        </div>

        {/* ----------------- MOBILE CARDS VIEW (< md) ----------------- */}
        <div className="mt-5 space-y-3 md:hidden">
          {filteredAgents.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
              No staff call activity recorded yet. Calls logged in the dialer will update here live.
            </div>
          ) : (
            filteredAgents.map((agent, idx) => {
              const interested = agent.interested ?? (agent as any).willPay ?? 0;
              const answeredPct =
                agent.totalCalls > 0 ? Math.round((agent.answered / agent.totalCalls) * 100) : 0;
              const interestPct =
                agent.answered > 0 ? Math.round((interested / agent.answered) * 100) : 0;

              return (
                <div
                  key={agent.agentName}
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3"
                >
                  {/* Header: Name + Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shadow-xs">
                        {agent.agentName.replace('Agent ', '').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 leading-tight">
                          {agent.agentName}
                        </h3>
                        <span className="text-[10px] text-slate-500">
                          {agent.lastActive
                            ? `Active: ${new Date(agent.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : 'Queue assigned'}
                        </span>
                      </div>
                    </div>

                    {idx === 0 && agent.totalCalls > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        ★ Top Caller
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500 font-medium">Answered Rate</span>
                      <span className="font-bold text-emerald-700">{answeredPct}% ({agent.answered}/{agent.totalCalls} calls)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${answeredPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Mini Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 uppercase block">Calls</span>
                      <span className="text-xs font-bold text-slate-800">{agent.totalCalls}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                      <span className="text-[10px] text-emerald-700 uppercase block">Answered</span>
                      <span className="text-xs font-bold text-emerald-700">{agent.answered}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-100">
                      <span className="text-[10px] text-amber-700 uppercase block">Interested</span>
                      <span className="text-xs font-bold text-amber-600">{interested}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-indigo-50/60 border border-indigo-100">
                      <span className="text-[10px] text-indigo-700 uppercase block">Proofs</span>
                      <span className="text-xs font-bold text-indigo-700">{agent.screenshotsUploaded}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ----------------- DESKTOP LEADERBOARD TABLE (>= md) ----------------- */}
        <div className="mt-5 hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3 text-center">Total Calls</th>
                <th className="px-4 py-3 text-center">Answered</th>
                <th className="px-4 py-3 text-center">Not Answered</th>
                <th className="px-4 py-3 text-center">Interested</th>
                <th className="px-4 py-3 text-center">WA Proofs</th>
                <th className="px-4 py-3">Answer Rate Progress</th>
                <th className="px-4 py-3 text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No calls recorded yet. Staff calls will appear here in real-time.
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent, idx) => {
                  const interested = agent.interested ?? (agent as any).willPay ?? 0;
                  const answeredPct =
                    agent.totalCalls > 0
                      ? Math.round((agent.answered / agent.totalCalls) * 100)
                      : 0;

                  return (
                    <tr key={agent.agentName} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shadow-xs">
                          {agent.agentName.replace('Agent ', '').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{agent.agentName}</div>
                          {idx === 0 && agent.totalCalls > 0 && (
                            <div className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                              ★ Top Caller
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center font-bold text-slate-900">
                        {agent.totalCalls}
                      </td>

                      <td className="px-4 py-3.5 text-center text-emerald-600 font-semibold">
                        {agent.answered}
                      </td>

                      <td className="px-4 py-3.5 text-center text-rose-600 font-semibold">
                        {agent.notAnswered}
                      </td>

                      <td className="px-4 py-3.5 text-center text-amber-600 font-bold">
                        {interested}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {agent.screenshotsUploaded}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 min-w-[140px]">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-slate-500 font-semibold">{answeredPct}%</span>
                          <span className="text-slate-400">{agent.answered}/{agent.totalCalls}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${answeredPct}%` }}
                          />
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right text-slate-500 text-[11px]">
                        {agent.lastActive
                          ? new Date(agent.lastActive).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Excel Batches / Campaign Management */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Uploaded Excel Lead Sheets ({batches.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage uploaded campaigns, view progress breakdown, and export individual results
            </p>
          </div>

          {isAdmin ? (
            <button
              id="batches-upload-excel-btn"
              type="button"
              onClick={onOpenUpload}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Upload New Sheet
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenUpload}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-500 hover:text-amber-800 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              title="Only Administrators can upload spreadsheets"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              Upload (Admin Only)
            </button>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {batches.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
              No spreadsheets uploaded yet. Click Upload to import your first Excel file.
            </div>
          ) : (
            batches.map((batch) => {
              const batchLeads = leads.filter((l) => l.batchId === batch.id);
              const completion =
                batch.totalLeads > 0
                  ? Math.round(((batch.totalLeads - batch.stats.pending) / batch.totalLeads) * 100)
                  : 0;

              const interestedCount =
                batch.stats.interested ?? (batch.stats as any).will_pay ?? 0;

              return (
                <div
                  key={batch.id}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-800">{batch.name}</h3>
                      <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full font-medium shadow-xs">
                        {batch.fileName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500">
                      <span>Total: <strong className="text-slate-800">{batch.totalLeads}</strong></span>
                      <span>•</span>
                      <span>Answered: <strong className="text-emerald-600 font-bold">{batch.stats.answered}</strong></span>
                      <span>•</span>
                      <span>Not Answered: <strong className="text-rose-600 font-bold">{batch.stats.not_answered}</strong></span>
                      <span>•</span>
                      <span>Interested: <strong className="text-amber-600 font-bold">{interestedCount}</strong></span>
                      <span>•</span>
                      <span>Proofs: <strong className="text-indigo-600 font-bold">{batch.stats.withScreenshot}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                    {/* Progress indicator */}
                    <div className="text-left sm:text-right min-w-[75px]">
                      <div className="text-xs font-bold text-slate-700">{completion}% Done</div>
                      <div className="w-20 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => exportLeadsToExcel(batchLeads, batch.name)}
                        className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs border border-slate-200 shadow-xs transition-colors"
                        title="Export this batch to Excel"
                      >
                        <Download className="w-4 h-4 text-emerald-600" />
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete batch "${batch.name}" and all its leads?`)) {
                              onDeleteBatch(batch.id);
                            }
                          }}
                          className="p-2 rounded-lg bg-white hover:bg-rose-50 text-rose-600 text-xs border border-rose-200 shadow-xs transition-colors"
                          title="Delete batch (Admin Only)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
