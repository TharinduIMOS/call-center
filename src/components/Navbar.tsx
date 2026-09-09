import React, { useState } from 'react';
import {
  PhoneCall,
  FileSpreadsheet,
  Users,
  LayoutGrid,
  Radio,
  RotateCcw,
  Sparkles,
  ChevronDown,
  UserCheck,
  Plus,
  Shield,
  HelpCircle,
  MessageSquare,
  Lock,
  User,
  UserPlus,
  KeyRound,
  LogOut,
  Award,
  LogIn,
  Layers,
} from 'lucide-react';
import type { UserRole, UserAccount } from '../types';

interface NavbarProps {
  currentTab: 'dialer' | 'queue' | 'analytics';
  onSelectTab: (tab: 'dialer' | 'queue' | 'analytics') => void;
  onOpenUpload: () => void;
  onResetDemo: () => void;
  onClearCallHistory?: () => void;
  onOpenManageSheets?: () => void;
  activeAgent: string;
  onChangeAgent: (agent: string) => void;
  availableAgents: string[];
  isLiveSync: boolean;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onOpenRoleExplainer: () => void;
  currentUser: UserAccount | null;
  onOpenAuthModal: (tab?: 'admin_login' | 'user_register' | 'user_login') => void;
  onOpenChangePassword?: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenUpload,
  onResetDemo,
  onClearCallHistory,
  onOpenManageSheets,
  activeAgent,
  onChangeAgent,
  availableAgents,
  isLiveSync,
  userRole,
  onChangeRole,
  onOpenRoleExplainer,
  currentUser,
  onOpenAuthModal,
  onOpenChangePassword,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-600 rounded-xl flex items-center justify-center flex-none shadow-xs shadow-emerald-200">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                  <span className="xs:hidden">WA Dialer</span>
                  <span className="hidden xs:inline sm:hidden">WA Tracker</span>
                  <span className="hidden sm:inline">WhatsApp Call Center Tracker</span>
                </h1>
                {/* Live Real-Time Indicator */}
                <div
                  className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-none"
                  title="Real-time synchronization connected via Server-Sent Events"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live</span>
                </div>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 hidden xs:block font-normal truncate max-w-[180px] sm:max-w-md">
                <span className="sm:hidden">Excel Leads & Call Proofs</span>
                <span className="hidden sm:inline">Excel Leads Dispatch • Number-by-Number Call Logging & Screenshots</span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          {!currentUser ? (
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100/90 text-slate-500 text-xs font-medium border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Workspace Protected • Sign in to access Dialer & Leads</span>
            </div>
          ) : (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                id="nav-dialer-tab"
                type="button"
                onClick={() => onSelectTab('dialer')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentTab === 'dialer'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Dialer Console
              </button>

              <button
                id="nav-queue-tab"
                type="button"
                onClick={() => onSelectTab('queue')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentTab === 'queue'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Leads Queue
              </button>

              <button
                id="nav-analytics-tab"
                type="button"
                onClick={() => onSelectTab('analytics')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentTab === 'analytics'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Agent Progress
              </button>
            </nav>
          )}

          {/* Right Actions: Excel Upload, Auth & Role Badges */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-none">
            {/* Upload Excel Button: Enabled for Admin; Restricted for User; Sign In prompt for Guest */}
            {!currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  id="top-admin-signin-nav-btn"
                  type="button"
                  onClick={() => onOpenAuthModal('admin_login')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-200 transition-all"
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Admin Login</span>
                </button>
                <button
                  id="top-agent-signin-nav-btn"
                  type="button"
                  onClick={() => onOpenAuthModal('user_login')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-200 transition-all hidden sm:flex"
                >
                  <User className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Agent Login</span>
                </button>
              </div>
            ) : isAdmin ? (
              <button
                id="top-upload-excel-btn"
                type="button"
                onClick={onOpenUpload}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-200 transition-all"
                title="Admin Privilege: Upload new Excel spreadsheet of WhatsApp contacts"
              >
                <FileSpreadsheet className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Upload Excel</span>
              </button>
            ) : (
              <button
                id="top-upload-excel-btn"
                type="button"
                onClick={onOpenUpload}
                className="bg-slate-100 hover:bg-amber-50 text-slate-500 hover:text-amber-800 border border-slate-200 hover:border-amber-300 p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="Excel uploads are restricted to Administrators only. Click for details."
              >
                <Lock className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Excel Upload (Admin Only)</span>
              </button>
            )}

            {/* Current User Profile Pill & Dropdown */}
            <div className="relative">
              {currentUser ? (
                <button
                  id="user-profile-menu-btn"
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-all shadow-xs ${
                    isAdmin
                      ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 hover:bg-indigo-100/80'
                      : 'bg-emerald-50/80 border-emerald-200 text-emerald-900 hover:bg-emerald-100/80'
                  }`}
                >
                  {isAdmin ? (
                    <Shield className="w-3.5 h-3.5 text-indigo-600 flex-none" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-emerald-600 flex-none" />
                  )}
                  <div className="text-left hidden xs:block">
                    <span className="font-bold block truncate max-w-[70px] sm:max-w-[110px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 block leading-none">
                      {isAdmin ? 'Admin' : 'Agent'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </button>
              ) : (
                <button
                  id="guest-login-btn"
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Sign In</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </button>
              )}

              {/* Account Dropdown Menu */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in space-y-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {currentUser ? (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-800">
                        {currentUser.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Username: <span className="font-mono text-slate-700">{currentUser.username}</span> • Role:{' '}
                        <span className={`font-bold ${isAdmin ? 'text-indigo-600' : 'text-emerald-600'}`}>
                          {isAdmin ? 'ADMINISTRATOR' : 'CALL AGENT'}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                        {isAdmin
                          ? '✓ Can upload Excel files and manage batches.'
                          : '✗ Cannot upload Excel files (Admin only).'}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-800">Guest Visitor</p>
                      <p className="text-[10px] text-slate-500">
                        Sign in as Admin to manage campaigns or as Call Agent to dial leads.
                      </p>
                    </div>
                  )}

                  <div className="pt-1 space-y-0.5">
                    {isAdmin && onOpenManageSheets && (
                      <button
                        id="nav-dropdown-manage-sheets-btn"
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenManageSheets();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-indigo-700 hover:bg-indigo-50 font-semibold flex items-center gap-2 border border-indigo-200/50 bg-indigo-50/30 transition-colors"
                        title="Manage, export, or delete uploaded Excel lead sheets"
                      >
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Manage & Delete Sheets</span>
                      </button>
                    )}

                    {isAdmin && onClearCallHistory && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onClearCallHistory();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-amber-700 hover:bg-amber-50 font-semibold flex items-center gap-2 border border-amber-200/50 bg-amber-50/30"
                        title="Clear all call history, attempts, and agent logs"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                        <span>Clear All Call History</span>
                      </button>
                    )}

                    {!isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenAuthModal('admin_login');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-indigo-700 hover:bg-indigo-50 font-semibold flex items-center gap-2"
                      >
                        <Shield className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Admin Sign In</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAuthModal('user_login');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-emerald-700 hover:bg-emerald-50 font-semibold flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{currentUser ? 'Switch Call Agent' : 'Agent Sign In'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAuthModal('user_register');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                      <span>Register New Call Agent</span>
                    </button>

                    {currentUser && onOpenChangePassword && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenChangePassword();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                        <span>Change Password</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenRoleExplainer();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-50 font-medium flex items-center gap-2"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>What is Admin vs User?</span>
                    </button>

                    {currentUser && (
                      <div className="pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            onLogout();
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Explainer Trigger */}
            <button
              id="role-explainer-trigger-btn"
              type="button"
              onClick={onOpenRoleExplainer}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 border border-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
              title="Admin vs User permissions comparison"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden xl:inline text-[11px] font-semibold">Admin vs User?</span>
            </button>

            {/* Reset Demo Leads */}
            <button
              id="reset-demo-btn"
              type="button"
              onClick={onResetDemo}
              className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 border border-slate-200 shadow-xs transition-colors"
              title="Reset to sample WhatsApp leads"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="grid grid-cols-3 md:hidden py-1 px-1 border-t border-slate-200 gap-1 bg-slate-50/70">
          <button
            id="mobile-nav-dialer-btn"
            type="button"
            onClick={() => onSelectTab('dialer')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              currentTab === 'dialer'
                ? 'text-indigo-700 bg-indigo-100/80 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            <PhoneCall className="w-4 h-4 text-indigo-600" />
            <span>Dialer</span>
          </button>
          <button
            id="mobile-nav-queue-btn"
            type="button"
            onClick={() => onSelectTab('queue')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              currentTab === 'queue'
                ? 'text-indigo-700 bg-indigo-100/80 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-indigo-600" />
            <span>Queue</span>
          </button>
          <button
            id="mobile-nav-analytics-btn"
            type="button"
            onClick={() => onSelectTab('analytics')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              currentTab === 'analytics'
                ? 'text-indigo-700 bg-indigo-100/80 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>Progress</span>
          </button>
        </div>
      </div>
    </header>
  );
};

