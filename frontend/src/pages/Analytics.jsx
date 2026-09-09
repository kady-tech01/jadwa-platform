import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Percent, 
  DollarSign, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  Sliders,
  FolderPlus,
  ChevronRight
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
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const Analytics = () => {
  const navigate = useNavigate();
  const { formatAmount } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const [projects, setProjects] = useState([]);
  const [metrics, setMetrics] = useState({
    portfolioNPV: 0,
    avgIRR: 0,
    overallRiskIndex: 'Low (0%)',
    highYieldProjects: 0,
    totalProjectsCount: 0
  });
  
  const [sensitivityData, setSensitivityData] = useState([]);
  const [riskProfile, setRiskProfile] = useState([]);

  const computeAnalyticsFromProjects = (projectList) => {
    if (!projectList || projectList.length === 0) {
      setMetrics({
        portfolioNPV: 0,
        avgIRR: 0,
        overallRiskIndex: 'None (0%)',
        highYieldProjects: 0,
        totalProjectsCount: 0
      });
      setSensitivityData([]);
      setRiskProfile([]);
      return;
    }

    let totalNPV = 0;
    let irrSum = 0;
    let highYieldCount = 0;
    let totalCapex = 0;
    let totalOpex = 0;
    let totalRevenue = 0;

    projectList.forEach((proj) => {
      const npv = Number(proj.npv || proj.financial_metrics?.npv || 0);
      const irr = Number(proj.irr || proj.financial_metrics?.irr || 0);
      const capex = Number(proj.initial_investment || proj.capex || 0);
      const opex = Number(proj.annual_opex || proj.opex || 0);
      const rev = Number(proj.annual_revenue || proj.revenue || 0);

      totalNPV += npv;
      irrSum += irr;
      totalCapex += capex;
      totalOpex += opex;
      totalRevenue += rev;

      if (irr >= 18 || (npv > 0 && rev > capex * 0.25)) {
        highYieldCount += 1;
      }
    });

    const avgIRRValue = projectList.length > 0 ? (irrSum / projectList.length).toFixed(1) : 0;
    
    // Evaluate risk index based on OPEX/Revenue ratio
    const opexRatio = totalRevenue > 0 ? (totalOpex / totalRevenue) : 0.5;
    let riskLevel = 'Low (15%)';
    if (opexRatio > 0.7) riskLevel = 'High (68%)';
    else if (opexRatio > 0.4) riskLevel = 'Moderate (34%)';

    setMetrics({
      portfolioNPV: totalNPV,
      avgIRR: avgIRRValue,
      overallRiskIndex: riskLevel,
      highYieldProjects: highYieldCount,
      totalProjectsCount: projectList.length
    });

    // Dynamic NPV Sensitivity Analysis Curve (-20% to +20% variation)
    const baseNPV = totalNPV !== 0 ? totalNPV : (totalRevenue - totalOpex);
    const variations = [
      { label: '-20%', revFactor: 0.8, costFactor: 1.2 },
      { label: '-10%', revFactor: 0.9, costFactor: 1.1 },
      { label: 'Base (0%)', revFactor: 1.0, costFactor: 1.0 },
      { label: '+10%', revFactor: 1.1, costFactor: 0.9 },
      { label: '+20%', revFactor: 1.2, costFactor: 0.8 },
    ];

    const generatedSensitivity = variations.map((v) => ({
      variation: v.label,
      revenueImpact: Math.round(baseNPV * v.revFactor),
      costImpact: Math.round(baseNPV * v.costFactor)
    }));

    setSensitivityData(generatedSensitivity);

    // Dynamic Risk Exposure vs. Mitigation Data
    const generatedRiskProfile = [
      { 
        category: 'Market Demand', 
        riskScore: Math.min(85, Math.round(opexRatio * 80 + 20)), 
        mitigationScore: 75 
      },
      { 
        category: 'CapEx Inflation', 
        riskScore: totalCapex > 1000000 ? 65 : 35, 
        mitigationScore: 80 
      },
      { 
        category: 'OpEx Fluctuation', 
        riskScore: Math.min(90, Math.round(opexRatio * 90)), 
        mitigationScore: 65 
      },
      { 
        category: 'Regulatory Shift', 
        riskScore: 30, 
        mitigationScore: 85 
      },
    ];

    setRiskProfile(generatedRiskProfile);
  };

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // 1. Attempt to fetch dedicated analytics endpoint if available
      let analyticsRes = null;
      try {
        analyticsRes = await API.get('analytics/overview/');
      } catch (e) {
        console.info('Global analytics overview endpoint unavailable, aggregating directly from user projects.');
      }

      if (analyticsRes?.data && Object.keys(analyticsRes.data).length > 0) {
        const data = analyticsRes.data;
        if (data.metrics) setMetrics(data.metrics);
        if (data.sensitivity) setSensitivityData(data.sensitivity);
        if (data.risk_profile) setRiskProfile(data.risk_profile);
      } else {
        // 2. Fetch real user projects to dynamically aggregate analytics metrics
        const response = await API.get('projects/');
        const userProjects = Array.isArray(response.data) 
          ? response.data 
          : (response.data.results || []);

        setProjects(userProjects);
        computeAnalyticsFromProjects(userProjects);
      }
    } catch (err) {
      console.error('Error loading user analytics data:', err);
      setErrorMessage('Failed to connect to analytics services. Please check server status.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

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
      {/* Server alert notification */}
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
            Portfolio-wide financial modeling, NPV sensitivity analysis, and risk assessment.
          </p>
        </div>
        <button 
          onClick={fetchAnalyticsData}
          className="inline-flex items-center gap-2 p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors w-fit cursor-pointer"
          title="Refresh Metrics"
        >
          <RefreshCw size={18} />
          <span className="text-sm font-medium">Sync Data</span>
        </button>
      </div>

      {/* Empty State when user has no active projects */}
      {metrics.totalProjectsCount === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-blue-500/10 text-blue-400 rounded-full">
            <FolderPlus size={36} />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Analytics Available</h3>
            <p className="text-sm text-slate-400">
              There are no feasibility studies associated with your account yet. Create a new project study to unlock sensitivity and risk analytics.
            </p>
          </div>
          <button
            onClick={() => navigate('/projects/new')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span>Create Feasibility Study</span>
            <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <>
          {/* Analytical KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Portfolio NPV</span>
                <DollarSign size={20} className="text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-50">
                {typeof metrics.portfolioNPV === 'number' ? formatAmount(metrics.portfolioNPV) : metrics.portfolioNPV}
              </h3>
              <p className="text-[11px] text-emerald-400 mt-1">Combined net capital value</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Average Portfolio IRR</span>
                <Percent size={20} className="text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-50">
                {typeof metrics.avgIRR === 'number' ? `${metrics.avgIRR}%` : metrics.avgIRR}
              </h3>
              <p className="text-[11px] text-blue-400 mt-1">Weighted internal return rate</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Overall Risk Profile</span>
                <AlertTriangle size={20} className="text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-50">{metrics.overallRiskIndex}</h3>
              <p className="text-[11px] text-amber-400 mt-1">Sensitivity exposure index</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">High Yield Projects</span>
                <TrendingUp size={20} className="text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-50">{metrics.highYieldProjects}</h3>
              <p className="text-[11px] text-slate-400 mt-1">Projects with high feasibility return</p>
            </div>
          </div>

          {/* Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sensitivity Analysis Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
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
                    <YAxis 
                      stroke="#64748B" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => formatAmount(val)} 
                    />
                    <Tooltip 
                      formatter={(value) => [formatAmount(value), '']}
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#F8FAFC' }}
                      itemStyle={{ fontSize: '13px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                    <Line type="monotone" name="Revenue Variation Impact" dataKey="revenueImpact" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" name="Cost Increase Impact" dataKey="costImpact" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Evaluation Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 size={18} className="text-purple-400" />
                    <h2 className="text-base font-bold text-slate-100">Risk Exposure vs. Mitigation</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Evaluation of key risk drivers and mitigation readiness score</p>
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

          {/* Project List Breakdown */}
          {projects.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-100">Evaluated Projects Portfolio</h2>
                <button 
                  onClick={() => navigate('/projects')}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Manage Projects <ChevronRight size={14} />
                </button>
              </div>

              <div className="divide-y divide-slate-800/60">
                {projects.map((proj) => (
                  <div 
                    key={proj.id}
                    onClick={() => navigate(`/projects/${proj.id}`)}
                    className="py-3 flex items-center justify-between hover:bg-slate-800/30 px-3 rounded-xl transition-colors cursor-pointer"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">{proj.title}</h4>
                      <span className="text-xs text-slate-400">{proj.category || 'Feasibility Study'}</span>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <div className="text-xs text-slate-400">NPV</div>
                        <div className="text-sm font-bold text-emerald-400">
                          {formatAmount(proj.npv || proj.financial_metrics?.npv || 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">IRR</div>
                        <div className="text-sm font-bold text-blue-400">
                          {proj.irr || proj.financial_metrics?.irr || '0'}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;