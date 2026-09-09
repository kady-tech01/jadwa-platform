import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart as PieChartIcon,
  Plus,
  Loader2,
  RefreshCw,
  AlertCircle,
  FolderPlus,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const PIE_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { formatAmount } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const [projects, setProjects] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    netProfit: 0,
    totalExpenses: 0,
    activeProjects: 0,
    totalCAPEX: 0,
  });
  
  const [cashFlowData, setCashFlowData] = useState([]);
  const [allocationData, setAllocationData] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // 1. Try fetching global dashboard summary if available
      let dashboardRes = null;
      try {
        dashboardRes = await API.get('dashboard/summary/');
      } catch (e) {
        console.info('Summary endpoint unavailable, building from projects list.');
      }

      if (dashboardRes?.data && Object.keys(dashboardRes.data).length > 0) {
        const data = dashboardRes.data;
        setMetrics(data.metrics || {});
        setCashFlowData(data.cash_flow || []);
        setAllocationData(data.allocation || []);
      } else {
        // 2. Fetch real user projects directly and calculate dynamically
        const response = await API.get('projects/');
        const userProjects = Array.isArray(response.data) 
          ? response.data 
          : (response.data.results || []);

        setProjects(userProjects);
        computeMetricsFromProjects(userProjects);
      }
    } catch (err) {
      console.error('Error fetching user dashboard data:', err);
      setErrorMessage('Could not load real project metrics from server.');
    } finally {
      setLoading(false);
    }
  };

  const computeMetricsFromProjects = (projectList) => {
    if (!projectList || projectList.length === 0) {
      setMetrics({
        totalRevenue: 0,
        netProfit: 0,
        totalExpenses: 0,
        activeProjects: 0,
        totalCAPEX: 0,
      });
      setCashFlowData([]);
      setAllocationData([]);
      return;
    }

    let sumRevenue = 0;
    let sumOpex = 0;
    let sumCapex = 0;

    const allocationMap = {};

    projectList.forEach((proj) => {
      const rev = Number(proj.annual_revenue || proj.revenue || 0);
      const opex = Number(proj.annual_opex || proj.opex || 0);
      const capex = Number(proj.initial_investment || proj.capex || 0);

      sumRevenue += rev;
      sumOpex += opex;
      sumCapex += capex;

      const category = proj.category || proj.sector || 'General Project';
      allocationMap[category] = (allocationMap[category] || 0) + capex;
    });

    const netProfit = sumRevenue - sumOpex;

    setMetrics({
      totalRevenue: sumRevenue,
      netProfit: netProfit,
      totalExpenses: sumOpex,
      activeProjects: projectList.length,
      totalCAPEX: sumCapex,
    });

    // Generate monthly projections based on real totals
    const monthlyRevBase = sumRevenue / 12;
    const monthlyExpBase = sumOpex / 12;

    const simulatedMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const generatedCashFlow = simulatedMonths.map((m, idx) => {
      const factor = 0.85 + (idx * 0.03); // Natural growth progression
      return {
        month: m,
        revenue: Math.round(monthlyRevBase * factor),
        expenses: Math.round(monthlyExpBase * (1 + (idx * 0.01))),
      };
    });

    setCashFlowData(generatedCashFlow);

    // Format capital allocation breakdown
    const totalAllocated = sumCapex || 1;
    const formattedAllocation = Object.keys(allocationMap).map((key, idx) => ({
      name: key,
      value: Math.round((allocationMap[key] / totalAllocated) * 100) || 100,
      color: PIE_COLORS[idx % PIE_COLORS.length]
    }));

    setAllocationData(formattedAllocation.length > 0 ? formattedAllocation : [
      { name: 'Initial Capital', value: 100, color: '#3B82F6' }
    ]);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading real-time financial metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 tracking-tight">Financial Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time aggregate analytics across your active feasibility projects.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDashboardData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={() => navigate('/projects/new')}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
          >
            <Plus size={18} />
            <span>New Feasibility Study</span>
          </button>
        </div>
      </div>

      {/* Empty State when user has no projects */}
      {metrics.activeProjects === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-blue-500/10 text-blue-400 rounded-full">
            <FolderPlus size={36} />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Projects Found</h3>
            <p className="text-sm text-slate-400">
              You haven't created any feasibility studies yet. Start by creating your first project to view dynamic financial analytics and projections.
            </p>
          </div>
          <button
            onClick={() => navigate('/projects/new')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus size={18} />
            <span>Create Your First Project</span>
          </button>
        </div>
      ) : (
        <>
          {/* Financial Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Revenue</span>
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="text-2xl font-bold text-slate-50">{formatAmount(metrics.totalRevenue)}</h3>
                <span className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <ArrowUpRight size={14} className="mr-0.5" /> Annual Est.
                </span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net Profit</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="text-2xl font-bold text-slate-50">{formatAmount(metrics.netProfit)}</h3>
                <span className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <ArrowUpRight size={14} className="mr-0.5" /> Projected
                </span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Expenses</span>
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                  <TrendingDown size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="text-2xl font-bold text-slate-50">{formatAmount(metrics.totalExpenses)}</h3>
                <span className="inline-flex items-center text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  OPEX
                </span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Projects</span>
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                  <Wallet size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="text-2xl font-bold text-slate-50">{metrics.activeProjects}</h3>
                <span className="text-xs font-medium text-slate-400">
                  Studies Active
                </span>
              </div>
            </div>
          </div>

          {/* Analytics Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-100">Cash Flow Projection</h2>
                  <p className="text-xs text-slate-400">Projected monthly revenue vs. operational expenses</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Revenue
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Expenses
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => formatAmount(val)} />
                    <Tooltip 
                      formatter={(value) => [formatAmount(value), '']}
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#F8FAFC' }}
                      itemStyle={{ fontSize: '13px' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="expenses" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-100">Capital Distribution</h2>
                  <p className="text-xs text-slate-400">Budget allocation across sectors</p>
                </div>
                <PieChartIcon size={18} className="text-slate-400" />
              </div>

              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#3B82F6'} stroke="#0F172A" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '10px', color: '#F8FAFC' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-4 pt-4 border-t border-slate-800">
                {allocationData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || '#3B82F6' }}></span>
                      <span className="text-slate-300 font-medium truncate max-w-[120px]">{item.name}</span>
                    </div>
                    <span className="text-slate-400 font-semibold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Projects List Overview */}
          {projects.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-100">Your Projects Overview</h2>
                <button 
                  onClick={() => navigate('/projects')}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                >
                  View All <ChevronRight size={14} />
                </button>
              </div>

              <div className="divide-y divide-slate-800/60">
                {projects.slice(0, 5).map((project) => (
                  <div 
                    key={project.id} 
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="py-3 flex items-center justify-between hover:bg-slate-800/30 px-3 rounded-xl transition-colors cursor-pointer"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">{project.title}</h4>
                      <span className="text-xs text-slate-400">{project.category || 'Feasibility Study'}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-100">
                        {formatAmount(project.initial_investment || project.capex || 0)}
                      </div>
                      <span className="text-xs text-slate-400">Initial Capital</span>
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

export default Dashboard;