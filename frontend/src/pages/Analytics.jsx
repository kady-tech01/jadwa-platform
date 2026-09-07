import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Percent, 
  DollarSign, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import API from '../services/api';

// Fallback analytics mock data for offline preview or initial load
const defaultSensitivityData = [
  { variation: '-20%', revenueImpact: 22000, costImpact: 78000 },
  { variation: '-10%', revenueImpact: 35000, costImpact: 64000 },
  { variation: 'Base (0%)', revenueImpact: 48000, costImpact: 48000 },
  { variation: '+10%', revenueImpact: 62000, costImpact: 32000 },
  { variation: '+20%', revenueImpact: 79000, costImpact: 19000 },
];

const defaultRiskProfileData = [
  { category: 'Market Demand', riskScore: 65, mitigationScore: 80 },
  { category: 'CapEx Inflation', riskScore: 40, mitigationScore: 70 },
  { category: 'OpEx Fluctuation', riskScore: 55, mitigationScore: 60 },
  { category: 'Regulatory Shift', riskScore: 30, mitigationScore: 85 },
];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Analytics states
  const [metrics, setMetrics] = useState({
    portfolioNPV: '$172,400',
    avgIRR: '19.4%',
    overallRiskIndex: 'Moderate (28%)',
    highYieldProjects: 4,
  });
  const [sensitivityData, setSensitivityData] = useState(defaultSensitivityData);
  const [riskProfile, setRiskProfile] = useState(defaultRiskProfileData);

  // Fetch analytics metrics and charting data from Django REST backend
  const fetchAnalyticsData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await API.get('analytics/overview/');
      const data = response.data;

      if (data.metrics) setMetrics(data.metrics);
      if (data.sensitivity) setSensitivityData(data.sensitivity);
      if (data.risk_profile) setRiskProfile(data.risk_profile);
    } catch (err) {
      console.warn('Backend unavailable. Utilizing fallback analytical dataset.', err);
      setErrorMessage('Could not retrieve live analytical models. Displaying offline dataset.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Processing feasibility portfolio analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Backend alert notice */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 tracking-tight">Feasibility Analytics & Risk</h1>
          <p className="text-sm text-slate-400 mt-1">
            Portfolio-wide financial modeling, sensitivity analysis, and risk assessment.
          </p>
        </div>
        <button 
          onClick={fetchAnalyticsData}
          className="inline-flex items-center gap-2 p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors w-fit"
          title="Refresh Metrics"
        >
          <RefreshCw size={18} />
          <span className="text-sm font-medium">Sync Data</span>
        </button>
      </div>

      {/* Analytical KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Portfolio NPV</span>
            <DollarSign size={20} className="text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-50">{metrics.portfolioNPV}</h3>
          <p className="text-[11px] text-emerald-400 mt-1">Combined net capital value</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Portfolio IRR</span>
            <Percent size={20} className="text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-50">{metrics.avgIRR}</h3>
          <p className="text-[11px] text-blue-400 mt-1">Weighted internal return rate</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Risk Profile</span>
            <AlertTriangle size={20} className="text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-50">{metrics.overallRiskIndex}</h3>
          <p className="text-[11px] text-amber-400 mt-1">Sensitivity exposure index</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">High Yield Projects</span>
            <TrendingUp size={20} className="text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-50">{metrics.highYieldProjects}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Projects with IRR &gt; 18%</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sensitivity Analysis Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-blue-400" />
                <h2 className="text-base font-bold text-slate-100">NPV Sensitivity Analysis</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">NPV impact relative to +/- 20% shifts in revenue vs. OpEx</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensitivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="variation" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#F8FAFC' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                <Line type="monotone" name="Revenue Variation" dataKey="revenueImpact" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" name="Cost Increase Impact" dataKey="costImpact" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Evaluation Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-purple-400" />
                <h2 className="text-base font-bold text-slate-100">Risk Exposure vs. Mitigation</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Evaluation of key risk drivers and mitigation readiness</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskProfile} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="category" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#F8FAFC' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                <Bar name="Risk Exposure Score" dataKey="riskScore" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                <Bar name="Mitigation Coverage" dataKey="mitigationScore" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;