import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Plus, 
  Download, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Inbox
} from 'lucide-react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import API from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const CashFlow = () => {
  const { formatAmount } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // User project data state (defaults to empty array)
  const [projections, setProjections] = useState([]);
  const [summary, setSummary] = useState({
    totalInflow: 0,
    totalOutflow: 0,
    netCashFlow: 0,
    paybackYear: 'N/A',
  });

  // Modal / Form state for entering a new cash transaction entry
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    year: '',
    inflow: '',
    outflow: '',
  });

  // Calculate summary metrics dynamically from projections list
  const calculateSummary = (items) => {
    if (!items || items.length === 0) {
      return {
        totalInflow: 0,
        totalOutflow: 0,
        netCashFlow: 0,
        paybackYear: 'N/A',
      };
    }

    const totalInflow = items.reduce((sum, item) => sum + (parseFloat(item.inflow) || 0), 0);
    const totalOutflow = items.reduce((sum, item) => sum + (parseFloat(item.outflow) || 0), 0);
    const netCashFlow = totalInflow - totalOutflow;

    // Find the first period where cumulative cash flow turns positive
    const paybackItem = items.find((item) => (item.cumulative ?? (item.inflow - item.outflow)) >= 0);
    const paybackYear = paybackItem ? paybackItem.year : 'Not Reached';

    return {
      totalInflow,
      totalOutflow,
      netCashFlow,
      paybackYear,
    };
  };

  // Fetch Cash Flow projections from Django REST backend
  const fetchCashFlowData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await API.get('cashflow/');
      const data = response.data;

      const projectProjections = Array.isArray(data) ? data : (data.projections || []);
      setProjections(projectProjections);

      if (data.summary) {
        setSummary(data.summary);
      } else {
        setSummary(calculateSummary(projectProjections));
      }
    } catch (err) {
      console.error('Error fetching cash flow data:', err);
      setErrorMessage('Could not load project cash flow data. Please check connection or try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCashFlowData();
  }, [fetchCashFlowData]);

  // Handle adding a new projection entry
  const handleAddEntry = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const inflowNum = parseFloat(newEntry.inflow) || 0;
    const outflowNum = parseFloat(newEntry.outflow) || 0;
    const netNum = inflowNum - outflowNum;

    // Calculate cumulative value based on previous entries
    const lastCumulative = projections.length > 0 
      ? (projections[projections.length - 1].cumulative ?? 0)
      : 0;

    const formattedEntry = {
      year: newEntry.year,
      inflow: inflowNum,
      outflow: outflowNum,
      net: netNum,
      cumulative: lastCumulative + netNum,
    };

    try {
      const response = await API.post('cashflow/', formattedEntry);
      const savedEntry = response.data || formattedEntry;

      const updatedProjections = [...projections, savedEntry];
      setProjections(updatedProjections);
      setSummary(calculateSummary(updatedProjections));

      setSuccessMessage('New cash flow projection period added successfully.');
      setShowAddModal(false);
      setNewEntry({ year: '', inflow: '', outflow: '' });
    } catch (err) {
      console.error('Failed to post cash flow entry:', err);
      setErrorMessage('Failed to save the cash flow entry to backend.');
    } finally {
      setSaving(false);
    }
  };

  // CSV Export Functionality for User Data
  const exportCSV = () => {
    if (projections.length === 0) return;
    const headers = ['Timeline Period', 'Inflows', 'Outflows', 'Net Flow', 'Cumulative Balance'];
    const rows = projections.map(p => [p.year, p.inflow, p.outflow, p.net, p.cumulative]);
    
    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cash_flow_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading project cash flow data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Backend alert notification */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-sm">
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

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 tracking-tight">Cash Flow Analysis</h1>
          <p className="text-sm text-slate-400 mt-1">
            Projected cash inflows, operating outflows, and cumulative break-even trajectory.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchCashFlowData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
          >
            <Plus size={18} />
            <span>Add Period Entry</span>
          </button>
        </div>
      </div>

      {/* Cash Flow Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Inflows</span>
            <ArrowUpCircle size={20} className="text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-50">
            {formatAmount(summary.totalInflow)}
          </h3>
          <p className="text-[11px] text-emerald-400 mt-1">Projected revenue streams</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Outflows</span>
            <ArrowDownCircle size={20} className="text-rose-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-50">
            {formatAmount(summary.totalOutflow)}
          </h3>
          <p className="text-[11px] text-rose-400 mt-1">CapEx + OpEx disbursements</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Cumulative Flow</span>
            <Wallet size={20} className="text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-50">
            {formatAmount(summary.netCashFlow)}
          </h3>
          <p className="text-[11px] text-blue-400 mt-1">End of lifespan liquidity</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Break-Even Reached</span>
            <TrendingUp size={20} className="text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-50">{summary.paybackYear}</h3>
          <p className="text-[11px] text-purple-400 mt-1">Positive cumulative threshold</p>
        </div>
      </div>

      {/* Projection Chart Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-100">Net & Cumulative Cash Flow Chart</h2>
            <p className="text-xs text-slate-400">Net periodic cash flow vs. cumulative recovery timeline</p>
          </div>
        </div>

        {projections.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={projections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="year" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
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
                <Bar name="Net Annual Cash Flow" dataKey="net" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                <Line type="monotone" name="Cumulative Cash Flow" dataKey="cumulative" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
            <Inbox size={40} className="mb-2 stroke-1" />
            <p className="text-sm font-medium">No cash flow chart data available.</p>
            <p className="text-xs text-slate-600 mt-1">Add your first period entry to visualize performance.</p>
          </div>
        )}
      </div>

      {/* Cash Flow Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100">Detailed Projection Schedule</h2>
          {projections.length > 0 && (
            <button 
              onClick={exportCSV}
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700 cursor-pointer"
            >
              <Download size={14} /> Export CSV
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          {projections.length > 0 ? (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Timeline Period</th>
                  <th className="px-6 py-3.5">Cash Inflows</th>
                  <th className="px-6 py-3.5">Cash Outflows</th>
                  <th className="px-6 py-3.5">Net Cash Flow</th>
                  <th className="px-6 py-3.5">Cumulative Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {projections.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-100 flex items-center gap-2">
                      <Calendar size={14} className="text-slate-500" />
                      {row.year}
                    </td>
                    <td className="px-6 py-4 text-emerald-400 font-medium">
                      +{formatAmount(row.inflow)}
                    </td>
                    <td className="px-6 py-4 text-rose-400 font-medium">
                      -{formatAmount(row.outflow)}
                    </td>
                    <td className={`px-6 py-4 font-bold ${row.net >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                      {formatAmount(row.net)}
                    </td>
                    <td className={`px-6 py-4 font-bold ${row.cumulative >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {formatAmount(row.cumulative)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm">No cash flow projections found for this project.</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-medium underline cursor-pointer"
              >
                + Add your first timeline entry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add New Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-50">Add Cash Flow Entry</h3>

            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Period / Year Label</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Year 1 or Q1 2026"
                  value={newEntry.year}
                  onChange={(e) => setNewEntry({ ...newEntry, year: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Inflow Amount</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="any"
                  placeholder="0"
                  value={newEntry.inflow}
                  onChange={(e) => setNewEntry({ ...newEntry, inflow: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Outflow Amount</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="any"
                  placeholder="0"
                  value={newEntry.outflow}
                  onChange={(e) => setNewEntry({ ...newEntry, outflow: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  <span>Save Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlow;