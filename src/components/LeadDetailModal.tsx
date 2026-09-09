import React from 'react';
import {
  X,
  Phone,
  User,
  Clock,
  Calendar,
  Tag,
  ShieldCheck,
  FileText,
  History,
  Maximize2,
  ThumbsUp,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import type { Lead, LeadStatus } from '../types';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onViewScreenshot: (lead: Lead) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onViewScreenshot,
}) => {
  if (!lead) return null;

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'interested':
      case 'will_pay' as any:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <ThumbsUp className="w-3 h-3 text-amber-600" /> INTERESTED
          </span>
        );
      case 'answered':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ANSWERED
          </span>
        );
      case 'not_answered':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            NOT ANSWERED
          </span>
        );
      case 'callback':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            CALL BACK
          </span>
        );
      case 'wrong_number':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            NO WHATSAPP
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            PENDING
          </span>
        );
    }
  };

  const cleanNumber = lead.phoneNumber.replace(/[^0-9]/g, '');
  const whatsAppUrl = `https://wa.me/${cleanNumber}`;

  return (
    <div
      id="lead-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="lead-detail-modal-container"
        className="relative bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{lead.customerName}</h2>
              {getStatusBadge(lead.status)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Batch: <strong className="text-slate-800">{lead.batchName}</strong></span>
              <span>•</span>
              <span>ID: <strong className="font-mono text-slate-700">{lead.id.slice(0, 12)}</strong></span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lead Info Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-emerald-600" /> WhatsApp
            </div>
            <div className="text-xs font-bold font-mono text-emerald-700 mt-1 truncate">
              {lead.phoneNumber}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Tag className="w-3 h-3 text-indigo-600" /> Topic / Category
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1 truncate">
              {lead.category || 'General'}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" /> Call Attempts
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1">
              {lead.callAttempts}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-600" /> Screenshot
            </div>
            <div className="text-xs font-bold text-slate-800 mt-1">
              {lead.screenshotUrl ? (
                <button
                  type="button"
                  onClick={() => onViewScreenshot(lead)}
                  className="text-emerald-700 hover:underline flex items-center gap-1"
                >
                  View Proof <Maximize2 className="w-3 h-3" />
                </button>
              ) : (
                <span className="text-slate-400 font-normal">Not Uploaded</span>
              )}
            </div>
          </div>
        </div>

        {/* Interested Banner if applicable */}
        {(lead.status === 'interested' || (lead.status as any) === 'will_pay') && (
          <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-800 font-bold">
              <ThumbsUp className="w-4 h-4 text-amber-600" />
              Customer showed interest in offer
            </div>
            {(lead.followUpDate || lead.willPayDate) && (
              <div className="text-amber-700 text-xs font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                Follow-up: <strong>{lead.followUpDate || lead.willPayDate}</strong>
              </div>
            )}
          </div>
        )}

        {/* Current Notes */}
        {lead.notes && (
          <div className="mb-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" /> Latest Notes
            </div>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}

        {/* Call History Timeline */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-indigo-600" /> Call Activity Log ({lead.history.length})
          </h3>

          {lead.history.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
              No WhatsApp calls have been logged for this lead yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {lead.history.map((hist, idx) => (
                <div
                  key={hist.id || idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{hist.agentName}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(hist.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {getStatusBadge(hist.status)}
                  </div>

                  {hist.notes && (
                    <p className="text-xs text-slate-600 pl-2 border-l-2 border-slate-300">
                      {hist.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-0.5">
                    {hist.callDurationSeconds ? (
                      <span>Duration: {Math.floor(hist.callDurationSeconds / 60)}m {hist.callDurationSeconds % 60}s</span>
                    ) : null}
                    {hist.followUpDate ? (
                      <span className="text-indigo-700 font-semibold">Follow-up: {hist.followUpDate}</span>
                    ) : null}
                    {hist.screenshotUrl ? (
                      <button
                        type="button"
                        onClick={() => onViewScreenshot(lead)}
                        className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                      >
                        Screenshot Attached
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Open WhatsApp
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
