import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Trash2,
  Download,
  AlertTriangle,
  RotateCcw,
  Shield,
  Layers,
  CheckCircle2,
  Clock,
  ThumbsUp,
  PhoneCall,
  Plus,
  Lock,
} from 'lucide-react';
import type { Batch, Lead } from '../types';
import { exportLeadsToExcel } from '../utils/exportExcel';

interface ManageSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: Batch[];
  leads: Lead[];
  onDeleteBatch: (batchId: string) => Promise<void> | void;
  onClearCallHistory: () => Promise<void> | void;
  onOpenUpload: () => void;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
}

export const ManageSheetsModal: React.FC<ManageSheetsModalProps> = ({
  isOpen,
  onClose,
  batches,
  leads,
  onDeleteBatch,
  onClearCallHistory,
  onOpenUpload,
  isAdmin,
  onOpenAdminLogin,
}) => {
  const [deletingBatchId, setDeletingBatchId] = useState<string | null>(null);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [confirmBatchDelete, setConfirmBatchDelete] = useState<Batch | null>(null);
  const [confirmClearHistoryOpen, setConfirmClearHistoryOpen] = useState(false);

  if (!isOpen) return null;

  const handleDeleteBatchConfirmed = async (batch: Batch) => {
    setDeletingBatchId(batch.id);
    try {
      await onDeleteBatch(batch.id);
      setConfirmBatchDelete(null);
    } finally {
      setDeletingBatchId(null);
    }
  };

  const handleClearHistoryConfirmed = async () => {
    setClearingHistory(true);
    try {
      await onClearCallHistory();
      setConfirmClearHistoryOpen(false);
    } finally {
      setClearingHistory(false);
    }
  };

  return (
    <div
      id="manage-sheets-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="manage-sheets-modal-container"
        className="relative bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Manage & Delete Uploaded Excel Sheets
              </h2>
              {isAdmin ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-indigo-600" /> Admin Only
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-600" /> Restricted
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Delete unwanted Excel sheets, remove imported campaign batches, or reset call logs (Admin privileges required)
            </p>
          </div>

          <button
            id="manage-sheets-close-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Restriction Guard */}
        {!isAdmin ? (
          <div className="py-8 space-y-4">
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3.5">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-none mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-amber-900">
                  Administrator Privileges Required
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Only administrators have permission to delete uploaded Excel sheets and wipe call logs. As a Call Agent, your account is configured for outreach dialing and status logging.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminLogin();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                Sign in as Administrator
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>
                  Total Uploaded Sheets:{' '}
                  <strong className="text-slate-900 font-bold">{batches.length}</strong> • Total Leads:{' '}
                  <strong className="text-slate-900 font-bold">{leads.length}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUpload();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Upload New Sheet
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmClearHistoryOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                  title="Wipes all call logs and resets contact status to pending"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  Clear Call History
                </button>
              </div>
            </div>

            {/* Confirmation Banner for Clear Call History */}
            {confirmClearHistoryOpen && (
              <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 animate-in fade-in duration-150 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-700 flex-none mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">
                      Confirm: Clear All Call History & Reset Queue?
                    </h4>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      This will reset all contact statuses to "Pending", delete all call attempt logs, agent notes, and uploaded screenshots. The contacts themselves will stay in the queue.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={clearingHistory}
                    onClick={() => setConfirmClearHistoryOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={clearingHistory}
                    onClick={handleClearHistoryConfirmed}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 flex items-center gap-1 shadow-xs"
                  >
                    {clearingHistory ? 'Clearing...' : 'Yes, Clear All Call History'}
                  </button>
                </div>
              </div>
            )}

            {/* Confirmation Dialog for Batch Deletion */}
            {confirmBatchDelete && (
              <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 animate-in fade-in duration-150 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-700 flex-none mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-900">
                      Confirm Deletion of Excel Sheet: "{confirmBatchDelete.name}"?
                    </h4>
                    <p className="text-[11px] text-rose-800 mt-0.5">
                      Are you sure you want to permanently delete this Excel sheet?{' '}
                      <strong>
                        All {confirmBatchDelete.totalLeads} contacts and their call logs
                      </strong>{' '}
                      will be permanently removed from the system. This cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={deletingBatchId !== null}
                    onClick={() => setConfirmBatchDelete(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={deletingBatchId !== null}
                    onClick={() => handleDeleteBatchConfirmed(confirmBatchDelete)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 flex items-center gap-1 shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deletingBatchId ? 'Deleting Sheet...' : 'Yes, Delete This Sheet'}
                  </button>
                </div>
              </div>
            )}

            {/* Excel Batches List */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {batches.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs">
                  No Excel sheets uploaded yet. Click "Upload New Sheet" to add contacts.
                </div>
              ) : (
                batches.map((batch) => {
                  const batchLeads = leads.filter((l) => l.batchId === batch.id);
                  const isDeleting = deletingBatchId === batch.id;
                  const interestedCount =
                    batch.stats.interested ?? (batch.stats as any).will_pay ?? 0;

                  return (
                    <div
                      key={batch.id}
                      className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-200 transition-colors shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{batch.name}</h3>
                          <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md font-semibold">
                            {batch.fileName}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Uploaded: {new Date(batch.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Stats Breakdown */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">
                            Total: <strong>{batch.totalLeads}</strong>
                          </span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">
                            Answered: <strong>{batch.stats.answered}</strong>
                          </span>
                          <span>•</span>
                          <span className="text-rose-700 font-semibold">
                            Not Answered: <strong>{batch.stats.not_answered}</strong>
                          </span>
                          <span>•</span>
                          <span className="text-amber-700 font-bold">
                            Interested: <strong>{interestedCount}</strong>
                          </span>
                          <span>•</span>
                          <span className="text-indigo-700 font-semibold">
                            Proofs: <strong>{batch.stats.withScreenshot}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons: Export & Delete */}
                      <div className="flex items-center gap-2 flex-none pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <button
                          type="button"
                          onClick={() => exportLeadsToExcel(batchLeads, batch.name)}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
                          title="Export this sheet's results to Excel"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Export</span>
                        </button>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => setConfirmBatchDelete(batch)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 shadow-xs flex items-center gap-1.5 transition-colors"
                          title="Delete this Excel sheet and its contacts (Admin Only)"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Delete Sheet</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>
                <Shield className="w-3.5 h-3.5 text-indigo-600 inline mr-1" />
                Sheet and call log deletions are strictly restricted to Administrators.
              </span>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
