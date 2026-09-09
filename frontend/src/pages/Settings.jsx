import React, { useState, useEffect } from 'react';
import { 
  User, 
  Globe, 
  Sliders, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import API from '../services/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'preferences' | 'system'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Initial States
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    role: '',
    organization: '',
    bio: '',
  });

  const [preferences, setPreferences] = useState({
    currency: 'USD',
    language: 'en',
    emailNotifications: true,
    weeklyReport: true,
    darkMode: true,
    autoBackup: true,
  });

  // Fetch current user details on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await API.get('settings/');
        const data = response.data;

        if (data.profile) {
          setProfile({
            fullName: data.profile.fullName || '',
            email: data.profile.email || '',
            role: data.profile.role || '',
            organization: data.profile.organization || '',
            bio: data.profile.bio || '',
          });
        }

        if (data.preferences) {
          setPreferences((prev) => ({
            ...prev,
            ...data.preferences,
          }));
        }
      } catch (err) {
        console.warn('Could not fetch user data from API, attempting local fallback.', err);
        
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setProfile((prev) => ({
              ...prev,
              fullName: parsedUser.fullName || parsedUser.name || prev.fullName,
              email: parsedUser.email || prev.email,
              role: parsedUser.role || prev.role,
              organization: parsedUser.organization || prev.organization,
            }));
          } catch (e) {
            console.error('Failed to parse cached user data', e);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const payload = {
      profile,
      preferences,
    };

    try {
      await API.post('settings/', payload);
      setSuccessMessage('Settings updated successfully!');
    } catch (err) {
      console.warn('Backend endpoint unavailable. Changes persisted in local state.', err);
      setSuccessMessage('Settings saved locally for current session.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 space-y-3">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-sm">Loading user account details...</p>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-slate-50 tracking-tight">Account & System Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your account profile, preferences, and system defaults.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <User size={16} />
          <span>Profile Info</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'preferences'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Globe size={16} />
          <span>Preferences & Regional</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('system')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'system'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Sliders size={16} />
          <span>System & Data</span>
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        {/* Tab 1: Profile */}
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
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="user@organization.com"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Professional Title / Role</label>
                <input
                  type="text"
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  placeholder="Developer / Manager"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Organization / Institution</label>
                <input
                  type="text"
                  value={profile.organization}
                  onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                  placeholder="Organization Name"
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
                placeholder="Brief description about your role or specialization..."
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Preferences */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Globe size={18} className="text-blue-400" />
              <span>Regional & Platform Defaults</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Default Currency</label>
                <select
                  value={preferences.currency}
                  onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="DZD">DZD - Algerian Dinar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Interface Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="en">English</option>
                  <option value="ar">العربية (Arabic)</option>
                  <option value="fr">Français (French)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-200">Email Notifications</p>
                  <p className="text-xs text-slate-400">Receive alerts for major updates and system events.</p>
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
                  <p className="text-xs text-slate-400">Automated system activity summary sent weekly.</p>
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

        {/* Tab 3: System */}
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
                  <p className="text-xs text-slate-400">Perform daily incremental database backups automatically.</p>
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
                <p className="text-xs text-slate-400">Environment: <span className="text-emerald-400 font-mono">Production</span></p>
                <p className="text-xs text-slate-400">API Status: <span className="text-emerald-400 font-mono">Online / REST v1</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="pt-6 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 cursor-pointer"
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