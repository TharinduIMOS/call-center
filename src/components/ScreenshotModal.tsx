import React from 'react';
import { X, Download, ShieldCheck, User, Calendar, Phone } from 'lucide-react';
import type { Lead } from '../types';

interface ScreenshotModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export const ScreenshotModal: React.FC<ScreenshotModalProps> = ({ lead, onClose }) => {
  if (!lead || !lead.screenshotUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = lead.screenshotUrl!;
    link.download = `Proof_${lead.customerName.replace(/\s+/g, '_')}_${lead.phoneNumber.replace(/[^0-9]/g, '')}.png`;
    link.click();
  };

  return (
    <div
      id="screenshot-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="screenshot-modal-container"
        className="relative bg-white border border-slate-200 rounded-2xl max-w-3xl w-full overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Call Verification Screenshot
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Proof
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Uploaded for lead: <span className="text-slate-800 font-semibold">{lead.customerName}</span> ({lead.phoneNumber})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="download-screenshot-btn"
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-xs"
              title="Download Screenshot"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              Download
            </button>
            <button
              id="close-screenshot-modal-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Preview Container */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-50 max-h-[65vh] overflow-auto">
          <img
            id="screenshot-preview-image"
            src={lead.screenshotUrl}
            alt={`Call screenshot proof for ${lead.customerName}`}
            className="max-h-[55vh] max-w-full rounded-xl object-contain border border-slate-200 shadow-md bg-white"
          />
        </div>

        {/* Footer with Metadata */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Agent: <strong className="text-slate-700 font-semibold">{lead.agentName || 'Call Center Staff'}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Captured: <strong className="text-slate-700 font-semibold">{lead.screenshotTimestamp ? new Date(lead.screenshotTimestamp).toLocaleString() : 'Recent'}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Call Status: <strong className="text-emerald-700 uppercase font-bold">{lead.status.replace('_', ' ')}</strong>
            </span>
          </div>

          {lead.willPayAmount ? (
            <div className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-bold shadow-xs">
              Promised Payment: ${lead.willPayAmount}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
