import React, { useState, useEffect } from 'react';
import {
  Shield,
  User,
  UserPlus,
  Lock,
  X,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  PhoneCall,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import type { UserAccount } from '../types';
import { DataService } from '../services/dataService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'admin_login' | 'user_register' | 'user_login';
  onLoginSuccess: (user: UserAccount, message?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'admin_login',
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'admin_login' | 'user_register' | 'user_login'>(
    initialTab
  );

  // Form states - strictly blank so credentials are never exposed
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [userLoginUsername, setUserLoginUsername] = useState('');
  const [userLoginPassword, setUserLoginPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setError(null);
      setAdminPassword('');
      setUserLoginPassword('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await DataService.login(adminUsername, adminPassword);
      onLoginSuccess(result.user, 'Logged in as Administrator (Excel Upload Privileges Enabled)');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!registerName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!registerUsername.trim()) {
      setError('Please enter a username');
      return;
    }
    if (registerPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await DataService.register(
        registerName.trim(),
        registerUsername.trim().toLowerCase(),
        registerPassword
      );

      onLoginSuccess(
        result.user,
        `Welcome ${result.user.name}! Registered as Call Agent. (Excel upload is reserved for Admin)`
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try another username.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserLogin = async (e?: React.FormEvent, customUser?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const u = customUser || userLoginUsername;
    const p = customPass || userLoginPassword;

    try {
      const result = await DataService.login(u, p);
      onLoginSuccess(result.user, `Logged in as Call Agent: ${result.user.name}`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Verify username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="auth-modal-content"
        className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6 pb-0 sm:pb-0">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Authentication & Roles</h2>
                <p className="text-xs text-slate-500">
                  Admin uploads Excels • Users register to dial & track
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-slate-200 gap-1">
            <button
              id="auth-tab-admin-login"
              type="button"
              onClick={() => {
                setActiveTab('admin_login');
                setError(null);
              }}
              className={`flex-1 py-3 px-2 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'admin_login'
                  ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>

            <button
              id="auth-tab-user-register"
              type="button"
              onClick={() => {
                setActiveTab('user_register');
                setError(null);
              }}
              className={`flex-1 py-3 px-2 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'user_register'
                  ? 'border-emerald-600 text-emerald-600 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>User Register</span>
            </button>

            <button
              id="auth-tab-user-login"
              type="button"
              onClick={() => {
                setActiveTab('user_login');
                setError(null);
              }}
              className={`flex-1 py-3 px-2 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'user_login'
                  ? 'border-emerald-600 text-emerald-600 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>User Login</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-none mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* ================= TAB 1: ADMIN LOGIN ================= */}
          {activeTab === 'admin_login' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-indigo-700 flex-none mt-0.5" />
                  <div className="text-xs text-indigo-950 leading-relaxed">
                    <span className="font-bold">Administrator Authority: </span>
                    Sign in with your administrator credentials to import Excel sheets, manage contact batches, and supervise team progress.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Username / ID
                </label>
                <input
                  id="admin-username-input"
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Enter admin username"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Password
                </label>
                <input
                  id="admin-password-input"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  id="admin-login-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-indigo-200 transition-all disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In as Administrator'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ================= TAB 2: USER REGISTER ================= */}
          {activeTab === 'user_register' && (
            <form onSubmit={handleUserRegister} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
                <UserPlus className="w-4 h-4 text-emerald-600 flex-none mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <span className="font-bold">New Call Agent Registration: </span>
                  Create your agent profile to dial WhatsApp numbers sequentially, tick outcomes, and upload call screenshot proofs.
                  <div className="text-[11px] text-emerald-800 font-semibold mt-1">
                    🔒 Notice: Registered users cannot upload Excel sheets. Only Admins can upload spreadsheets.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name (Display Name)
                </label>
                <input
                  id="register-name-input"
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="e.g. Agent Marcus"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username (For Login)
                </label>
                <input
                  id="register-username-input"
                  type="text"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  placeholder="e.g. marcus"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  id="register-password-input"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  id="user-register-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-emerald-200 transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Register User & Start Calling'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('user_login')}
                  className="text-xs text-emerald-700 hover:underline font-semibold"
                >
                  Already have an agent account? Sign In here
                </button>
              </div>
            </form>
          )}

          {/* ================= TAB 3: USER LOGIN ================= */}
          {activeTab === 'user_login' && (
            <form onSubmit={handleUserLogin} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-start gap-3">
                <PhoneCall className="w-4 h-4 text-slate-600 flex-none mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  Sign in with your registered Call Agent username to access your assigned WhatsApp contact queue and record call outcomes.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username
                </label>
                <input
                  id="user-login-username-input"
                  type="text"
                  value={userLoginUsername}
                  onChange={(e) => setUserLoginUsername(e.target.value)}
                  placeholder="Enter registered username"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  id="user-login-password-input"
                  type="password"
                  value={userLoginPassword}
                  onChange={(e) => setUserLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  id="user-login-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-emerald-200 transition-all disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In as Agent'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('user_register')}
                  className="text-xs text-emerald-700 hover:underline font-semibold"
                >
                  Don't have an account? Register as New User
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
