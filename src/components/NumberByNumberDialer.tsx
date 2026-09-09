import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneCall,
  Check,
  X,
  ThumbsUp,
  Clock,
  Upload,
  Image as ImageIcon,
  Copy,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  Calendar,
  AlertCircle,
  FileText,
  Trash2,
  Maximize2,
  Sparkles,
  PhoneForwarded,
  PhoneOff,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import type { Lead, LeadStatus } from '../types';

interface NumberByNumberDialerProps {
  leads: Lead[];
  currentLeadId: string | null;
  onSelectLeadId: (id: string) => void;
  onSaveLeadUpdate: (
    leadId: string,
    update: {
      status: LeadStatus;
      notes: string;
      screenshotUrl?: string;
      callDurationSeconds?: number;
      followUpDate?: string;
    }
  ) => Promise<void>;
  onViewScreenshot: (lead: Lead) => void;
  activeAgent: string;
}

export const NumberByNumberDialer: React.FC<NumberByNumberDialerProps> = ({
  leads,
  currentLeadId,
  onSelectLeadId,
  onSaveLeadUpdate,
  onViewScreenshot,
  activeAgent,
}) => {
  const [onlyPending, setOnlyPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  // Call timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Form states for current lead
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>('answered');
  const [notes, setNotes] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [followUpDate, setFollowUpDate] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered queue based on toggle
  const queue = onlyPending ? leads.filter((l) => l.status === 'pending') : leads;

  // Find active lead index
  const currentIndex = queue.findIndex((l) => l.id === currentLeadId);
  const currentLead = currentIndex !== -1 ? queue[currentIndex] : queue[0] || null;

  // Synchronize form when active lead changes
  useEffect(() => {
    if (currentLead) {
      const initialStatus =
        currentLead.status === 'pending'
          ? 'answered'
          : (currentLead.status as any) === 'will_pay'
          ? 'interested'
          : currentLead.status;

      setSelectedStatus(initialStatus);
      setNotes(currentLead.notes || '');
      setScreenshotPreview(currentLead.screenshotUrl || null);
      setFollowUpDate(
        currentLead.followUpDate ||
        currentLead.willPayDate ||
        new Date(Date.now() + 86400000).toISOString().slice(0, 10)
      );
      setCallDuration(currentLead.callDurationSeconds || 0);
      setTimerRunning(false);
    }
  }, [currentLead?.id]);

  // Call Timer Tick
  useEffect(() => {
    let interval: any;
    if (timerRunning) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Clipboard Paste listener for Screenshot (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (uploadEvent) => {
              setScreenshotPreview(uploadEvent.target?.result as string);
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const cleanPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/[^0-9]/g, '');
  };

  const handleCopyPhone = () => {
    if (!currentLead) return;
    navigator.clipboard.writeText(currentLead.phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartWhatsAppCall = () => {
    setTimerRunning(true);
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (WhatsApp screenshot PNG/JPEG)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshotPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDropScreenshot = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSaveAndNext = async (andAdvance: boolean = true) => {
    if (!currentLead) return;

    setSaving(true);
    try {
      await onSaveLeadUpdate(currentLead.id, {
        status: selectedStatus,
        notes,
        screenshotUrl: screenshotPreview || undefined,
        callDurationSeconds: callDuration,
        followUpDate: ['interested', 'callback'].includes(selectedStatus) ? followUpDate : undefined,
      });

      setTimerRunning(false);

      if (andAdvance) {
        // Advance to next lead in current queue
        const nextIndex = (currentIndex + 1) % queue.length;
        if (queue[nextIndex]) {
          onSelectLeadId(queue[nextIndex].id);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (!currentLead) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-3">
          <PhoneOff className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No leads available in this queue</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          {onlyPending
            ? 'All leads in this batch have been contacted! Switch filter to view all numbers or import a new Excel sheet.'
            : 'Import an Excel spreadsheet to start calling customer WhatsApp numbers.'}
        </p>
        {onlyPending && (
          <button
            type="button"
            onClick={() => setOnlyPending(false)}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200"
          >
            Show All Leads
          </button>
        )}
      </div>
    );
  }

  const cleanNumber = cleanPhoneForWhatsApp(currentLead.phoneNumber);
  const whatsAppCallUrl = `https://wa.me/${cleanNumber}`;
  const whatsAppChatUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    `Hello ${currentLead.customerName}, this is ${activeAgent} regarding ${currentLead.category || 'our consultation'}.`
  )}`;

  return (
    <div id="dialer-console-container" className="space-y-4">
      {/* Top Queue Bar & Stepper */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
            <span className="font-bold text-indigo-600">
              #{currentIndex + 1}
            </span>
            <span className="text-slate-400">of</span>
            <span className="font-semibold text-slate-800">{queue.length}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-[11px] truncate max-w-[140px] font-medium">
              {currentLead.batchName}
            </span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none font-medium">
            <input
              type="checkbox"
              checked={onlyPending}
              onChange={(e) => setOnlyPending(e.target.checked)}
              className="rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500/20 w-3.5 h-3.5"
            />
            <span>Uncontacted only</span>
          </label>
        </div>

        {/* Previous / Next buttons */}
        <div className="flex items-center gap-2">
          <button
            id="dialer-prev-lead-btn"
            type="button"
            disabled={currentIndex <= 0}
            onClick={() => onSelectLeadId(queue[currentIndex - 1].id)}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          <button
            id="dialer-next-lead-btn"
            type="button"
            disabled={currentIndex >= queue.length - 1}
            onClick={() => onSelectLeadId(queue[currentIndex + 1].id)}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors shadow-xs"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Calling Console Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: WhatsApp Number & Primary Call Actions */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  Target Customer
                </span>
                {currentLead.status !== 'pending' && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    currentLead.status === 'interested' || (currentLead.status as any) === 'will_pay'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : currentLead.status === 'answered'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-rose-100 text-rose-700 border-rose-200'
                  }`}>
                    Current: {currentLead.status === 'will_pay' ? 'INTERESTED' : currentLead.status.replace('_', ' ')}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1.5">
                {currentLead.customerName}
              </h2>
            </div>

            {/* Prominent WhatsApp Number Block */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex flex-col gap-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  WhatsApp Number
                </span>
                <button
                  id="copy-phone-btn"
                  type="button"
                  onClick={handleCopyPhone}
                  className="text-xs text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-medium transition-colors"
                  title="Copy Number"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-700 tracking-wider">
                {currentLead.phoneNumber}
              </div>

              {/* Direct WhatsApp Call & Chat Actions */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <a
                  id="dial-whatsapp-link"
                  href={whatsAppCallUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleStartWhatsAppCall}
                  className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition-all text-center"
                  title="Open in WhatsApp to call"
                >
                  <PhoneCall className="w-4 h-4" />
                  WhatsApp Call
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                <a
                  id="chat-whatsapp-link"
                  href={whatsAppChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleStartWhatsAppCall}
                  className="px-3 py-3 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors text-center"
                  title="Open WhatsApp Chat"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  WhatsApp Chat
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>

              {/* Native Dial / Timer Bar */}
              <div className="flex items-center justify-between pt-1 border-t border-emerald-100 text-xs text-slate-600">
                <a
                  href={`tel:${currentLead.phoneNumber}`}
                  className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  Standard Phone Dialer
                </a>

                <button
                  id="toggle-call-timer-btn"
                  type="button"
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                    timerRunning
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Clock className={`w-3 h-3 ${timerRunning ? 'text-amber-600 animate-spin' : 'text-slate-400'}`} />
                  Timer: {formatSeconds(callDuration)}
                </button>
              </div>
            </div>

            {/* Campaign Category & Call Attempts (No Amount Due!) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Outreach Topic</div>
                <div className="text-sm font-bold text-indigo-700 mt-0.5 truncate">
                  {currentLead.category || 'Customer Outreach'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Call Attempts</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">
                  {currentLead.callAttempts} attempt{currentLead.callAttempts !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Screenshot Proof Card / Uploader */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  WhatsApp Call Screenshot Proof
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Ctrl+V to paste</span>
              </div>

              {screenshotPreview ? (
                <div className="relative group rounded-xl overflow-hidden border border-emerald-300 bg-white shadow-xs">
                  <img
                    src={screenshotPreview}
                    alt="WhatsApp Call Screenshot"
                    className="w-full h-36 object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onViewScreenshot(currentLead)}
                      className="p-2 rounded-lg bg-white text-slate-800 hover:bg-slate-100 shadow-sm"
                      title="Inspect full image"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setScreenshotPreview(null)}
                      className="p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                      title="Remove Screenshot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-white/95 text-[10px] font-bold text-emerald-700 border border-emerald-200 flex items-center gap-1 shadow-xs">
                    <Check className="w-3 h-3" /> WhatsApp Proof Verified
                  </div>
                </div>
              ) : (
                <div
                  id="screenshot-drop-area"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDropScreenshot}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-xl p-4 text-center cursor-pointer transition-all bg-white shadow-xs"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">
                    Upload WhatsApp Call Screenshot
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Click, drag & drop, or paste image with Ctrl+V
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Status Ticks, Notes, and Save */}
          <div className="lg:col-span-7 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2.5">
                  1. Call Outcome Tick <span className="text-rose-500">*</span>
                </label>

                {/* Primary Requested Tick Badges: Answered, Not Answered, Interested (Replaces Will Pay) */}
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Answered Tick */}
                  <button
                    id="tick-answered-btn"
                    type="button"
                    onClick={() => setSelectedStatus('answered')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 ${
                      selectedStatus === 'answered'
                        ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-800 shadow-sm font-bold ring-2 ring-emerald-500/10'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      selectedStatus === 'answered' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <span className="text-xs">Answered</span>
                  </button>

                  {/* Not Answered Tick */}
                  <button
                    id="tick-not-answered-btn"
                    type="button"
                    onClick={() => setSelectedStatus('not_answered')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 ${
                      selectedStatus === 'not_answered'
                        ? 'bg-rose-50 border-2 border-rose-500 text-rose-800 shadow-sm font-bold ring-2 ring-rose-500/10'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      selectedStatus === 'not_answered' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <X className="w-4 h-4 stroke-[3]" />
                    </div>
                    <span className="text-xs">Not Answered</span>
                  </button>

                  {/* Interested Tick */}
                  <button
                    id="tick-interested-btn"
                    type="button"
                    onClick={() => setSelectedStatus('interested')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 ${
                      selectedStatus === 'interested'
                        ? 'bg-amber-50 border-2 border-amber-500 text-amber-800 shadow-sm font-bold ring-2 ring-amber-500/10'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      selectedStatus === 'interested' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <ThumbsUp className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <span className="text-xs">Interested</span>
                  </button>
                </div>

                {/* Secondary status chips */}
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    id="tick-callback-btn"
                    type="button"
                    onClick={() => setSelectedStatus('callback')}
                    className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                      selectedStatus === 'callback'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-semibold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <PhoneForwarded className="w-3.5 h-3.5 text-indigo-600" />
                    Call Back Requested
                  </button>

                  <button
                    id="tick-wrong-number-btn"
                    type="button"
                    onClick={() => setSelectedStatus('wrong_number')}
                    className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                      selectedStatus === 'wrong_number'
                        ? 'bg-rose-50 border-rose-400 text-rose-700 font-semibold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <PhoneOff className="w-3.5 h-3.5 text-rose-500" />
                    Wrong # / No WhatsApp
                  </button>
                </div>
              </div>

              {/* Follow-up Date if Interested or Call Back */}
              {(selectedStatus === 'interested' || selectedStatus === 'callback') && (
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <Calendar className="w-4 h-4 text-amber-700" />
                      Next Follow-Up / Scheduled Callback
                    </div>
                    <span className="text-[10px] text-amber-700">Optional reminder date</span>
                  </div>
                  <div>
                    <input
                      id="follow-up-date-input"
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Call Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    2. WhatsApp Call Notes & Conversation Summary
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Agent: <strong className="text-slate-700 font-semibold">{activeAgent}</strong>
                  </span>
                </label>
                <textarea
                  id="lead-notes-textarea"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record customer response, interest level, reason for no-answer, or topics discussed during the WhatsApp call..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Action Bar: Save or Save & Advance */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                id="save-only-btn"
                type="button"
                disabled={saving}
                onClick={() => handleSaveAndNext(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold disabled:opacity-50 transition-colors shadow-xs"
              >
                Save Update
              </button>

              <button
                id="save-and-next-btn"
                type="button"
                disabled={saving}
                onClick={() => handleSaveAndNext(true)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 disabled:opacity-50 flex items-center gap-2 transition-all"
              >
                {saving ? 'Saving...' : 'Save & Next Number'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

