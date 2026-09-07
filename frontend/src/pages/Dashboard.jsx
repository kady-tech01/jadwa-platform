import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart as PieChartIcon,
  Plus
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

// Mock Data for Cash Flow Trend
const cashFlowData = [
  { month: 'Jan', revenue: 4000, expenses: 2400 },
  { month: 'Feb', revenue: 5000, expenses: 2800 },
  { month: 'Mar', revenue: 6800, expenses: 3200 },
  { month: 'Apr', revenue: 8200, expenses: 3900 },
  { month: 'May', revenue: 7500, expenses: 4100 },
  { month: 'Jun', revenue: 11000, expenses: 4800 },
  { month: 'Jul', revenue: 12500, expenses: 5300 },
];

// Mock Data for Allocation Breakdowns
const allocationData = [
  { name: 'Feasibility Studies', value: 45, color: '#3B82F6' },
  { name: 'Operational Costs', value: 25, color: '#10B981' },
  { name: 'Marketing & Sales', value: 18, color: '#8B5CF6' },
  { name: 'Reserve / Emergency', value: 12, color: '#F59E0B' },
];

// Recent Activity Mock
const recentTransactions = [
  { id: 'TRX-9081', project: 'Solar Tech Plant Feasibility', category: 'Consulting', amount: '+$4,200', status: 'Completed', date: '2026-09-05' },
  { id: 'TRX-9082', project: 'E-Commerce Platform Valuation', category: 'Software', amount: '-$850', status: 'Pending', date: '2026-09-04' },
  { id: 'TRX-9083', project: 'Real Estate Complex Analysis', category: 'Audit', amount: '+$12,500', status: 'Completed', date: '2026-09-02' },
  { id: 'TRX-9084', project: 'AgriTech Market Expansion', category: 'Research', amount: '-$1,200', status: 'Failed', date: '2026-08-31' },
];

const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 tracking-tight">Financial Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time analytics and financial feasibility overview.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95">
          <Plus size={18} />
          <span>New Feasibility Study</span>
        </button>
      </div>

      {/* Financial Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-slate-50">$55,000</h3>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ArrowUpRight size={14} className="mr-0.5" /> +12.5%
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net Profit</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-slate-50">$25,200</h3>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ArrowUpRight size={14} className="mr-0.5" /> +8.2%
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Expenses</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-slate-50">$29,800</h3>
            <span className="inline-flex items-center text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              <ArrowDownRight size={14} className="mr-0.5" /> -3.1%
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Projects</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <Wallet size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-slate-50">14</h3>
            <span className="text-xs font-medium text-slate-400">
              4 Pending Approval
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Main Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-100">Cash Flow Projection</h2>
              <p className="text-xs text-slate-400">Monthly revenue vs. operational expenses</p>
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
              <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#F8FAFC' }}
                  itemStyle={{ fontSize: '13px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expenses" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Allocation Pie Chart (1 Column) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-100">Capital Distribution</h2>
              <p className="text-xs text-slate-400">Budget allocation breakdown</p>
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
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0F172A" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '10px', color: '#F8FAFC' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend */}
          <div className="space-y-2 mt-4 pt-4 border-t border-slate-800">
            {allocationData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="text-slate-400 font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-100">Recent Transactions</h2>
            <p className="text-xs text-slate-400">Financial entries logged for feasibility studies</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">ID</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-slate-400">{trx.id}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-100">{trx.project}</td>
                  <td className="px-4 py-3.5 text-slate-400">{trx.category}</td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs">{trx.date}</td>
                  <td className={`px-4 py-3.5 font-bold ${trx.amount.startsWith('+') ? 'text-emerald-400' : 'text-slate-100'}`}>
                    {trx.amount}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      trx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      trx.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;