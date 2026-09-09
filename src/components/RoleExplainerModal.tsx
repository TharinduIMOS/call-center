import React from 'react';
import {
  X,
  ShieldAlert,
  UserCheck,
  FileSpreadsheet,
  PhoneCall,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  Users,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import type { UserRole } from '../types';

interface RoleExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole?: (role: UserRole) => void;
  onRequestAdminLogin?: () => void;
  onRequestAgentLogin?: () => void;
}

export const RoleExplainerModal: React.FC<RoleExplainerModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
  onRequestAdminLogin,
  onRequestAgentLogin,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="role-explainer-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="role-explainer-modal-container"
        className="relative bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
              Role Architecture & Permissions
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              What is Admin and User?
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Understanding the dual roles in the WhatsApp Call Center workflow
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

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
          {/* Admin Role Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              currentRole === 'admin'
                ? 'border-2 border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/10'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                Supervisor / Admin
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mt-3">
              Admin (Operations Manager)
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Responsible for managing campaigns, importing contact numbers, and tracking team performance.
            </p>

            <div className="mt-4 space-y-2 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span><strong>Uploads Excel sheets</strong> (Exclusive privilege — only Admins can import files)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span><strong>Manages campaigns & batches</strong> and assigns leads to calling agents</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span><strong>Monitors real-time KPI overview</strong> (Total Leads, Answered, Interested, Proofs)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span><strong>Exports full progress reports</strong> with timestamps & proof verifications</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (currentRole === 'admin') {
                  onSelectRole?.('admin');
                } else if (onRequestAdminLogin) {
                  onRequestAdminLogin();
                }
              }}
              className={`mt-5 w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                currentRole === 'admin'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              {currentRole === 'admin' ? 'Active Role: Administrator' : 'Sign In as Administrator'}
            </button>
          </div>

          {/* User / Agent Role Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              currentRole === 'agent'
                ? 'border-2 border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/10'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <PhoneCall className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Call Center Agent
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mt-3">
              User (Calling Agent)
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Responsible for dialing customer numbers on WhatsApp, logging call outcomes, and attaching screenshot proof.
            </p>

            <div className="mt-4 space-y-2 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Accesses live calling queue</strong> and advances number-by-number</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>1-Click WhatsApp Call</strong> or direct WhatsApp web/app chat link</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Ticks call outcome:</strong> Answered, Not Answered, Interested, Call Back</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Uploads screenshot proof:</strong> Paste Ctrl+V or drop WhatsApp call image</span>
              </div>
              <div className="flex items-start gap-2 text-rose-700 bg-rose-50/70 p-1.5 rounded-lg border border-rose-200">
                <span className="font-bold text-[11px]">🔒 Excel Upload Restricted:</span>
                <span className="text-[11px]">Registered users cannot upload Excels; only Admins can import files.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (currentRole === 'agent') {
                  onSelectRole?.('agent');
                } else if (onRequestAgentLogin) {
                  onRequestAgentLogin();
                } else {
                  onSelectRole?.('agent');
                }
              }}
              className={`mt-5 w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                currentRole === 'agent'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              {currentRole === 'agent' ? 'Active Role: Call Agent' : 'Sign In as Call Agent'}
            </button>
          </div>
        </div>

        {/* Summary Note */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Both roles stay synchronized in real time via Server-Sent Events.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
