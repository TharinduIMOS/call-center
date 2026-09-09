import React, { useState } from 'react';
import {
  Search,
  Phone,
  PhoneCall,
  Check,
  X,
  ThumbsUp,
  ShieldCheck,
  ShieldAlert,
  Download,
  Filter,
  Eye,
  ExternalLink,
  ChevronRight,
  User,
  Copy,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Tag,
  Trash2,
  Layers,
  Shield,
} from 'lucide-react';
import type { Lead, LeadStatus, Batch } from '../types';
import { exportLeadsToExcel } from '../utils/exportExcel';

interface LeadsTableProps {
  leads: Lead[];
  batches: Batch[];
  onSelectLeadForDialer: (leadId: string) => void;
  onViewLeadDetails: (lead: Lead) => void;
  onViewScreenshot: (lead: Lead) => void;
  onQuickUpdateStatus: (leadId: string, status: LeadStatus) => void;
  isAdmin?: boolean;
  onDeleteBatch?: (batchId: string) => Promise<void> | void;
  onOpenManageSheets?: () => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  batches,
  onSelectLeadForDialer,
  onViewLeadDetails,
  onViewScreenshot,
  onQuickUpdateStatus,
  isAdmin = false,
  onDeleteBatch,
  onOpenManageSheets,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [screenshotFilter, setScreenshotFilter] = useState<'all' | 'with' | 'without'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPhone = (leadId: string, phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedId(leadId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = lead.customerName.toLowerCase().includes(q);
      const matchPhone = lead.phoneNumber.toLowerCase().includes(q);
      const matchCategory = (lead.category || '').toLowerCase().includes(q);
      const matchNotes = (lead.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchCategory && !matchNotes) return false;
    }

    // Status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'interested') {
        if (lead.status !== 'interested' && (lead.status as any) !== 'will_pay') return false;
      } else if (lead.status !== selectedStatus) {
        return false;
      }
    }

    // Batch filter
    if (selectedBatch !== 'all' && lead.batchId !== selectedBatch) {
      return false;
    }

    // Screenshot filter
    if (screenshotFilter === 'with' && !lead.screenshotUrl) return false;
    if (screenshotFilter === 'without' && !!lead.screenshotUrl) return false;

    return true;
  });

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'interested':
      case 'will_pay' as any:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
            <ThumbsUp className="w-3 h-3 text-amber-600" /> INTERESTED
          </span>
        );
      case 'answered':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
            <Check className="w-3 h-3" /> ANSWERED
          </span>
        );
      case 'not_answered':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
            <X className="w-3 h-3" /> NOT ANSWERED
          </span>
        );
      case 'callback':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1">
            CALL BACK
          </span>
        );
      case 'wrong_number':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">
            NO WHATSAPP
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            PENDING
          </span>
        );
    }
  };

  return (
    <div id="leads-table-wrapper" className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="leads-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search WhatsApp number, contact name, topic, notes..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Filters & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Batch Selector */}
          <div className="flex items-center gap-1.5">
            <select
              id="batch-filter-select"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="all">All Campaigns ({batches.length})</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.totalLeads})
                </option>
              ))}
            </select>

            {/* Delete Selected Sheet Button (Admin Only) */}
            {isAdmin && selectedBatch !== 'all' && onDeleteBatch && (
              <button
                id="delete-selected-batch-btn"
                type="button"
                onClick={() => {
                  const bObj = batches.find((b) => b.id === selectedBatch);
                  const name = bObj ? bObj.name : 'this campaign';
                  const confirmed = window.confirm(
                    `Are you sure you want to permanently delete Excel sheet "${name}" and all its contacts?`
                  );
                  if (confirmed) {
                    onDeleteBatch(selectedBatch);
                    setSelectedBatch('all');
                  }
                }}
                className="px-2.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                title="Delete this selected Excel sheet and leads (Admin Only)"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Delete Sheet</span>
              </button>
            )}

            {/* Manage Sheets Button */}
            {onOpenManageSheets && (
              <button
                id="open-manage-sheets-btn"
                type="button"
                onClick={onOpenManageSheets}
                className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                title="Manage and Delete Uploaded Excel Sheets (Admin)"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Manage Sheets</span>
              </button>
            )}
          </div>

          {/* Screenshot Proof filter */}
          <select
            id="screenshot-filter-select"
            value={screenshotFilter}
            onChange={(e) => setScreenshotFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Proof Status</option>
            <option value="with">Proof Uploaded</option>
            <option value="without">Missing Proof</option>
          </select>

          {/* Export to Excel */}
          <button
            id="export-excel-btn"
            type="button"
            onClick={() => exportLeadsToExcel(filteredLeads, batches.find((b) => b.id === selectedBatch)?.name)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-xs"
            title="Export filtered contacts to Excel sheet"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Contacts', count: leads.length },
          { id: 'pending', label: 'Pending', count: leads.filter((l) => l.status === 'pending').length },
          { id: 'answered', label: 'Answered', count: leads.filter((l) => l.status === 'answered').length },
          { id: 'not_answered', label: 'Not Answered', count: leads.filter((l) => l.status === 'not_answered').length },
          { id: 'interested', label: 'Interested', count: leads.filter((l) => l.status === 'interested' || (l.status as any) === 'will_pay').length },
          { id: 'callback', label: 'Call Back', count: leads.filter((l) => l.status === 'callback').length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedStatus(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedStatus === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedStatus === tab.id ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Leads Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Contact & WhatsApp #</th>
                <th className="px-4 py-3.5">Topic / Category</th>
                <th className="px-4 py-3.5">Call Status</th>
                <th className="px-4 py-3.5">Screenshot Proof</th>
                <th className="px-4 py-3.5">Last Call / Agent</th>
                <th className="px-4 py-3.5">Notes</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No matching contacts found for current filters.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const cleanPhone = lead.phoneNumber.replace(/[^0-9]/g, '');
                  const waLink = `https://wa.me/${cleanPhone}`;

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => onViewLeadDetails(lead)}
                    >
                      {/* Customer & Phone */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {lead.customerName}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-emerald-700 font-semibold flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-emerald-600" />
                            {lead.phoneNumber}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyPhone(lead.id, lead.phoneNumber, e)}
                            className="text-slate-400 hover:text-emerald-700 p-0.5 transition-colors"
                            title="Copy phone"
                          >
                            {copiedId === lead.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Topic / Category (Replaces Amount) */}
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          {lead.category || 'General'}
                        </span>
                        {(lead.followUpDate || lead.willPayDate) && (
                          <div className="text-[10px] text-amber-700 font-semibold mt-0.5 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" /> Follow-up: {lead.followUpDate || lead.willPayDate}
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {getStatusBadge(lead.status)}
                        </div>
                      </td>

                      {/* Screenshot Proof */}
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        {lead.screenshotUrl ? (
                          <div
                            className="relative inline-block group/thumb cursor-pointer"
                            onClick={() => onViewScreenshot(lead)}
                          >
                            <img
                              src={lead.screenshotUrl}
                              alt="Screenshot"
                              className="w-10 h-10 object-cover rounded-lg border border-emerald-300 hover:scale-105 transition-transform shadow-xs"
                            />
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow-xs">
                              ✓
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                            None
                          </span>
                        )}
                      </td>

                      {/* Last Call / Agent */}
                      <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                        <div className="font-medium text-slate-700">{lead.agentName || lead.assignedAgent || 'Unassigned'}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {lead.lastCallTimestamp
                            ? new Date(lead.lastCallTimestamp).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Not called yet'}
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="px-4 py-3.5 max-w-xs truncate text-slate-600">
                        {lead.notes || <span className="text-slate-400 italic">No notes</span>}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 text-xs font-semibold flex items-center transition-all shadow-xs"
                            title="Open in WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => onSelectLeadForDialer(lead.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-200 text-xs font-semibold flex items-center gap-1 transition-all shadow-xs"
                            title="Open in Calling Console"
                          >
                            <Phone className="w-3 h-3" />
                            Queue
                          </button>

                          <button
                            type="button"
                            onClick={() => onViewLeadDetails(lead)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
