import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Bell, 
  Globe, 
  Sliders, 
  Key, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Moon
} from 'lucide-react';
import API from '../services/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'preferences' | 'system'
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Profile Settings State
  const [profile, setProfile] = useState({
    fullName: 'Khadidja Mechara',
    email: 'khadidja@example.com',
    role: 'Financial Manager & Lead Developer',
    organization: 'École Supérieure d\'Administration des Affaires',
    bio: 'Specializing in financial operations management, web platforms, and dynamic analytical systems.',
  });

  // Security Settings State
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    enable2FA: false,
  });

  // Preferences & System Settings State
  const [preferences, setPreferences] = useState({
    currency: 'DZD', // DZD | USD | EUR
    language: 'ar',
    emailNotifications: true,
    weeklyReport: true,
    darkMode: true,
    autoBackup: true,
  });

  // Handle saving general configuration settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    // Validate password match if updating security tab
    if (activeTab === 'security' && security.newPassword) {
      if (security.newPassword !== security.confirmPassword) {
        setErrorMessage('New password and confirmation do not match.');
        setSaving(false);
        return;
      }
    }

    const payload = {
      profile,
      security: { enable2FA: security.enable2FA },
      preferences,
    };

    try {
      await API.post('settings/', payload);
      setSuccessMessage('Settings updated successfully!');
      // Clear sensitive password fields after save
      setSecurity((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      console.warn('Backend endpoint unavailable. Changes persisted in local state.', err);
      setSuccessMessage('Settings saved locally for current session.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Alert Notifications */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-50 tracking-tight">System & Account Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your account credentials, financial preferences, security protocols, and system defaults.
        </p>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('profile')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <User size={16} />
          <span>Profile Info</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <ShieldCheck size={16} />
          <span>Security & Auth</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'preferences'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Globe size={16} />
          <span>Preferences & Regional</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'system'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Sliders size={16} />
          <span>System & Data</span>
        </button>
      </div>

      {/* Main Settings Form Panel */}
      <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        {/* Tab 1: Profile Information */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <User size={18} className="text-blue-400" />
              <span>Personal & Organizational Profile</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Professional Title / Role</label>
                <input
                  type="text"
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Organization / Institution</label>
                <input
                  type="text"
                  value={profile.organization}
                  onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Bio / Summary</label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-400" />
              <span>Authentication & Access Credentials</span>
            </h2>

            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={security.currentPassword}
                  onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={security.newPassword}
                  onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={security.confirmPassword}
                  onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between max-w-lg">
              <div>
                <p className="text-sm font-semibold text-slate-200">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-slate-400">Enforce secondary authorization for security compliance.</p>
              </div>
              <input
                type="checkbox"
                checked={security.enable2FA}
                onChange={(e) => setSecurity({ ...security, enable2FA: e.target.checked })}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Regional Preferences & Language */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Globe size={18} className="text-blue-400" />
              <span>Regional & Financial Defaults</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Default Ledger Currency</label>
                <select
                  value={preferences.currency}
                  onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="DZD">DZD - Algerian Dinar</option>
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Interface Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="ar">العربية (Arabic)</option>
                  <option value="en">English</option>
                  <option value="fr">Français (French)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-200">Email Notifications</p>
                  <p className="text-xs text-slate-400">Receive alerts for major transaction edits and platform updates.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-200">Weekly Summary Reports</p>
                  <p className="text-xs text-slate-400">Automated financial aggregation sent every Sunday morning.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.weeklyReport}
                  onChange={(e) => setPreferences({ ...preferences, weeklyReport: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: System Defaults & Backup */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sliders size={18} className="text-blue-400" />
              <span>System & Database Operations</span>
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-200">Automated Database Snapshots</p>
                  <p className="text-xs text-slate-400">Perform daily incremental backups on Render PostgreSQL cluster.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.autoBackup}
                  onChange={(e) => setPreferences({ ...preferences, autoBackup: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-2">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">System Info & Health</p>
                <p className="text-xs text-slate-400">Environment: <span className="text-emerald-400 font-mono">Production (Vercel / Render)</span></p>
                <p className="text-xs text-slate-400">API Status: <span className="text-emerald-400 font-mono">Online / REST v1</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-6 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Save Configurations</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;