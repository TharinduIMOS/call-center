import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Download,
  Users,
  Layers,
  ArrowRight,
  Lock,
  Shield,
} from 'lucide-react';
import { parseExcelFile, downloadSampleExcel, type ExcelParseResult } from '../utils/excelParser';
import type { UserAccount } from '../types';
import { DataService } from '../services/dataService';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agents: string[];
  currentUser?: UserAccount | null;
  onOpenAdminLogin?: () => void;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  agents,
  currentUser,
  onOpenAdminLogin,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);
  const [batchName, setBatchName] = useState('');
  const [assignedAgent, setAssignedAgent] = useState('');
  const [phoneCol, setPhoneCol] = useState('');
  const [nameCol, setNameCol] = useState('');
  const [categoryCol, setCategoryCol] = useState('');
  const [notesCol, setNotesCol] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  const handleFileChange = async (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
    setParsing(true);

    try {
      const result = await parseExcelFile(selectedFile);
      setParseResult(result);
      setPhoneCol(result.suggestedMapping.phoneColumn);
      setNameCol(result.suggestedMapping.nameColumn);
      setCategoryCol(result.suggestedMapping.categoryColumn || '');
      setNotesCol(result.suggestedMapping.notesColumn || '');

      // Generate default batch name from filename
      const cleanFileName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      setBatchName(`${cleanFileName} (${new Date().toLocaleDateString()})`);
    } catch (err: any) {
      setError(err.message || 'Could not parse this file. Please ensure it is a valid Excel or CSV sheet.');
      setFile(null);
      setParseResult(null);
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!isAdmin) {
      setError('Permission denied: Only administrators can upload Excel sheets.');
      return;
    }

    if (!parseResult || !phoneCol) {
      setError('Please select at least the WhatsApp/Phone Number column');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Map rows to Lead format
      const leadsToImport = parseResult.rows.map((row, idx) => {
        const rawPhone = row[phoneCol];
        const rawName = nameCol ? row[nameCol] : `Contact #${idx + 1}`;
        const rawCategory = categoryCol ? row[categoryCol] : '';
        const rawNotes = notesCol ? row[notesCol] : '';

        // Collect other fields into customFields
        const customFields: Record<string, any> = {};
        Object.keys(row).forEach((key) => {
          if (![phoneCol, nameCol, categoryCol, notesCol].includes(key)) {
            customFields[key] = row[key];
          }
        });

        return {
          phoneNumber: String(rawPhone || '').trim(),
          customerName: String(rawName || `Contact #${idx + 1}`).trim(),
          category: String(rawCategory || '').trim() || 'General Outreach',
          callType: 'whatsapp_call' as const,
          notes: String(rawNotes || '').trim(),
          assignedAgent: assignedAgent || undefined,
          customFields,
        };
      }).filter((l) => l.phoneNumber.length > 0);

      if (leadsToImport.length === 0) {
        throw new Error('No valid contact numbers found in the selected phone column.');
      }

      await DataService.importBatch(
        batchName || `WhatsApp Campaign ${new Date().toLocaleDateString()}`,
        parseResult.fileName,
        leadsToImport,
        currentUser?.name || 'Admin',
        currentUser?.role || 'admin'
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Import failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="excel-upload-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="excel-upload-modal-container"
        className="relative bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upload Excel Leads Sheet</h2>
              <p className="text-xs text-slate-500">
                Import customer phone numbers for real-time call center dispatch
              </p>
            </div>
          </div>
          <button
            id="close-upload-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Security Guard: Non-Admin Restricted View */}
        {!isAdmin ? (
          <div className="mt-6 p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-950">
                Excel Upload Restricted to Administrators
              </h3>
              <p className="text-xs text-amber-800 mt-1.5 max-w-md mx-auto leading-relaxed">
                {currentUser ? (
                  <>
                    You are currently signed in as{' '}
                    <span className="font-bold text-slate-900">{currentUser.name}</span>{' '}
                    (<span className="uppercase text-[11px] font-bold">User / Agent</span>).
                    Registered users and call agents are restricted from importing Excel spreadsheets.
                    Only Administrators can upload contact sheets.
                  </>
                ) : (
                  <>
                    You are currently not signed in. Excel contact imports are strictly restricted to Administrators.
                    Please sign in with your Administrator credentials to upload and manage contact batches.
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {onOpenAdminLogin && (
                <button
                  id="switch-to-admin-from-upload-modal"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdminLogin();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-200 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Shield className="w-4 h-4" />
                  Sign In as Administrator
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                Return to Calling Queue
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Dropzone if no file or parsing */}
            {!parseResult && (
          <div className="mt-5 space-y-4">
            <div
              id="excel-dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                parsing
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {parsing ? 'Parsing spreadsheet...' : 'Click to browse or drag & drop Excel file here'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports .xlsx, .xls, and .csv formats
              </p>
            </div>

            {/* Download Sample Template Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-slate-700 font-medium">Need a sample Excel format?</span>
              </div>
              <button
                id="download-sample-excel-btn"
                type="button"
                onClick={downloadSampleExcel}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Sample .xlsx
              </button>
            </div>
          </div>
        )}

        {/* Configuration & Preview once file is parsed */}
        {parseResult && (
          <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-900">
                  Loaded <strong>{parseResult.rows.length} leads</strong> from{' '}
                  <span className="underline">{parseResult.fileName}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setParseResult(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
              >
                Change File
              </button>
            </div>

            {/* Batch Name & Assignee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Campaign / Batch Name
                </label>
                <input
                  id="batch-name-input"
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="e.g. VIP March Leads"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  Assign To Agent (Optional)
                </label>
                <select
                  id="batch-assign-agent-select"
                  value={assignedAgent}
                  onChange={(e) => setAssignedAgent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-500"
                >
                  <option value="">General Team Pool (Unassigned)</option>
                  {agents.map((agent) => (
                    <option key={agent} value={agent}>
                      {agent}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Column Mapping Selectors */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Column Mapping
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="map-phone-col"
                    value={phoneCol}
                    onChange={(e) => setPhoneCol(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500"
                  >
                    <option value="">-- Select Column --</option>
                    {parseResult.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Customer Name
                  </label>
                  <select
                    id="map-name-col"
                    value={nameCol}
                    onChange={(e) => setNameCol(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500"
                  >
                    <option value="">-- Select Column --</option>
                    {parseResult.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Topic / Category
                  </label>
                  <select
                    id="map-category-col"
                    value={categoryCol}
                    onChange={(e) => setCategoryCol(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500"
                  >
                    <option value="">-- None / Optional --</option>
                    {parseResult.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Notes / Remarks
                  </label>
                  <select
                    id="map-notes-col"
                    value={notesCol}
                    onChange={(e) => setNotesCol(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500"
                  >
                    <option value="">-- None / Optional --</option>
                    {parseResult.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Preview of first 3 rows */}
            <div>
              <div className="text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
                <span>Spreadsheet Preview (First {Math.min(parseResult.rows.length, 3)} rows)</span>
                <span>Total: {parseResult.rows.length} rows</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">WhatsApp #</th>
                      <th className="px-3 py-2">Contact Name</th>
                      <th className="px-3 py-2">Category / Topic</th>
                      <th className="px-3 py-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {parseResult.rows.slice(0, 3).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-indigo-600 font-bold">{phoneCol ? String(r[phoneCol] || '—') : '—'}</td>
                        <td className="px-3 py-2 text-slate-800 font-sans font-medium">{nameCol ? String(r[nameCol] || '—') : '—'}</td>
                        <td className="px-3 py-2 text-indigo-700 font-sans font-medium">{categoryCol ? String(r[categoryCol] || '—') : '—'}</td>
                        <td className="px-3 py-2 text-slate-600 font-sans truncate max-w-xs">{notesCol ? String(r[notesCol] || '—') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
          <button
            id="cancel-upload-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          {parseResult && (
            <button
              id="confirm-import-btn"
              type="button"
              disabled={submitting || !phoneCol}
              onClick={handleImport}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-200 flex items-center gap-2 transition-all"
            >
              {submitting ? 'Importing Leads...' : `Import ${parseResult.rows.length} Leads to Queue`}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};
