import React from 'react';
import {
  Users,
  PhoneCall,
  PhoneOff,
  ThumbsUp,
  ShieldCheck,
  CalendarClock,
} from 'lucide-react';
import type { OverallStats } from '../types';

interface StatsOverviewProps {
  stats: OverallStats;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const answeredPercent = stats.totalLeads > 0
    ? Math.round((stats.answered / stats.totalLeads) * 100)
    : 0;

  const interestedCount = stats.interested ?? (stats as any).willPay ?? 0;

  const interestedPercent = stats.totalLeads > 0
    ? Math.round((interestedCount / stats.totalLeads) * 100)
    : 0;

  const screenshotPercent = stats.totalLeads > 0
    ? Math.round((stats.screenshotsUploaded / (stats.totalLeads - stats.pending || 1)) * 100)
    : 0;

  return (
    <div id="stats-overview-grid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
      {/* Total Leads & Progress */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">Total Leads</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-xs">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <div className="text-xl sm:text-3xl font-bold text-slate-800 tracking-tight">{stats.totalLeads}</div>
          <div className="mt-0.5 sm:mt-1 flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500">
            <span>{stats.pending} remaining</span>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 sm:mt-3.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>

      {/* Answered */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">Answered</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-xs">
            <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <div className="text-xl sm:text-3xl font-bold text-emerald-600 tracking-tight">{stats.answered}</div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-emerald-700 font-bold">{answeredPercent}%</span>
            <span>of queue</span>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 sm:mt-3.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${answeredPercent}%` }}
          />
        </div>
      </div>

      {/* Not Answered */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">Not Answered</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-xs">
            <PhoneOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <div className="text-xl sm:text-3xl font-bold text-rose-600 tracking-tight">{stats.notAnswered}</div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-500">
            <span>Needs re-dial</span>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 sm:mt-3.5 overflow-hidden">
          <div
            className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${stats.totalLeads > 0 ? (stats.notAnswered / stats.totalLeads) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Interested */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">Interested</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-xs">
            <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <div className="text-xl sm:text-3xl font-bold text-amber-600 tracking-tight">{interestedCount}</div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-amber-700 font-semibold">
            {interestedPercent}% positive
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 sm:mt-3.5 overflow-hidden">
          <div
            className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${interestedPercent}%` }}
          />
        </div>
      </div>

      {/* Screenshots Uploaded */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1 hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">WA Proofs</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <div className="text-xl sm:text-3xl font-bold text-emerald-700 tracking-tight">{stats.screenshotsUploaded}</div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-500">
            <span>{Math.min(100, screenshotPercent)}% of called</span>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 sm:mt-3.5 overflow-hidden">
          <div
            className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, screenshotPercent)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
