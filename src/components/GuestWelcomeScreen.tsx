import React, { useState, useEffect } from 'react';
import {
  Shield,
  User,
  UserPlus,
  PhoneCall,
  FileSpreadsheet,
  Lock,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  Headphones,
} from 'lucide-react';

interface GuestWelcomeScreenProps {
  onOpenAuthModal: (tab: 'admin_login' | 'user_register' | 'user_login') => void;
  onOpenRoleExplainer: () => void;
}

export const GuestWelcomeScreen: React.FC<GuestWelcomeScreenProps> = ({
  onOpenAuthModal,
  onOpenRoleExplainer,
}) => {
  const [greeting, setGreeting] = useState('');
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour >= 4 && hour < 12) {
        setGreeting('Good morning');
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good afternoon');
      } else {
        setGreeting('Good evening');
      }

      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto py-8 sm:py-12 space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-semibold border border-white/10">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentTimeStr}</span>
            <span className="text-white/40">•</span>
            <span>Live Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {greeting || 'Welcome'}, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-indigo-200">
              Welcome to Call Center
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            All customer leads, dialer queues, call outcomes, and screenshot proofs are securely protected.
            Please sign in with your account to access your assigned queue and dialer.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              id="welcome-admin-login-btn"
              type="button"
              onClick={() => onOpenAuthModal('admin_login')}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30 active:scale-98"
            >
              <Shield className="w-4 h-4 text-indigo-200" />
              <span>Admin Sign In</span>
            </button>

            <button
              id="welcome-agent-login-btn"
              type="button"
              onClick={() => onOpenAuthModal('user_login')}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/30 active:scale-98"
            >
              <User className="w-4 h-4 text-emerald-200" />
              <span>Call Agent Sign In</span>
            </button>

            <button
              id="welcome-register-btn"
              type="button"
              onClick={() => onOpenAuthModal('user_register')}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-sm flex items-center gap-2 border border-white/15 transition-all"
            >
              <UserPlus className="w-4 h-4 text-slate-300" />
              <span>Register Agent</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Role Choice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Admin Card */}
        <div
          id="card-role-admin"
          onClick={() => onOpenAuthModal('admin_login')}
          className="group cursor-pointer bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-100/70 text-indigo-800 uppercase tracking-wider">
              Management
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Administrator Access
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Upload Excel contact files, dispatch campaigns, clear call logs, monitor all agents, and configure system settings.
            </p>
          </div>

          <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-none" />
              <span>Exclusive permission to upload Excel spreadsheets</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-none" />
              <span>Batch campaign progress & full history controls</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-none" />
              <span>Audit proof screenshots and agent productivity</span>
            </li>
          </ul>

          <div className="pt-2">
            <button
              type="button"
              className="w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center gap-1.5"
            >
              <span>Sign In as Administrator</span>
            </button>
          </div>
        </div>

        {/* Call Agent Card */}
        <div
          id="card-role-agent"
          onClick={() => onOpenAuthModal('user_login')}
          className="group cursor-pointer bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Headphones className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100/70 text-emerald-800 uppercase tracking-wider">
              Call Agent
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Call Center Agent Access
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Access assigned leads, dial numbers one-by-one via WhatsApp, log outcomes (Answered, Interested, Callback), and attach screenshot proofs.
            </p>
          </div>

          <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-none" />
              <span>1-Click direct WhatsApp launch (Web & App)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-none" />
              <span>Upload and attach call screenshot proof instantly</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-none" />
              <span>Quick status toggles and next-number auto advancement</span>
            </li>
          </ul>

          <div className="pt-2">
            <button
              type="button"
              className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs group-hover:bg-emerald-600 group-hover:text-white transition-all flex items-center justify-center gap-1.5"
            >
              <span>Sign In as Call Agent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security & Privacy Notice */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center flex-none">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-800">Confidentiality Protected</p>
            <p className="text-[11px] text-slate-500">
              Customer phone numbers, call records, and proof images remain hidden until a valid user or admin signs in.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenRoleExplainer}
          className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 whitespace-nowrap"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Role Permissions Info</span>
        </button>
      </div>
    </div>
  );
};
