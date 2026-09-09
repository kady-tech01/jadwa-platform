import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Plus, 
  Download, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  CheckCircle2,
  Receipt,
  DollarSign
} from 'lucide-react';
import API from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

// Fallback initial transaction records for offline or initial state
const defaultTransactions = [
  { id: 1, title: 'Initial Project Funding', category: 'Investment', type: 'income', amount: 50000, date: '2026-01-15' },
  { id: 2, title: 'Server Infrastructure & Cloud Hosting', category: 'Operations', type: 'expense', amount: 1200, date: '2026-01-20' },
  { id: 3, title: 'Software Licenses & Tools', category: 'Software', type: 'expense', amount: 450, date: '2026-02-01' },
  { id: 4, title: 'Client Milestone Payment #1', category: 'Revenue', type: 'income', amount: 12500, date: '2026-02-10' },
  { id: 5, title: 'Marketing & Digital Campaigns', category: 'Marketing', type: 'expense', amount: 2100, date: '2026-02-18' },
  { id: 6, title: 'Consulting & Expert Advisory', category: 'Legal & Finance', type: 'expense', amount: 1500, date: '2026-02-25' },
];

const Transactions = () => {
  const { formatAmount } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Core Data States
  const [transactions, setTransactions] = useState(defaultTransactions);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'income' | 'expense'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal / Form state for creating a new transaction entry
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    title: '',
    category: 'Operations',
    type: 'expense',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Fetch Transaction Ledger from Django REST backend
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await API.get('transactions/');
      if (Array.isArray(response.data)) {
        setTransactions(response.data);
      } else if (response.data.results) {
        setTransactions(response.data.results);
      }
    } catch (err) {
      console.warn('Backend endpoint unavailable. Loaded cached local transactions.', err);
      setErrorMessage('Could not load live backend ledger. Showing local session data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filtered transactions computed property
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchTerm, typeFilter, categoryFilter]);

  // Aggregate KPI Calculations
  const metrics = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    return {
      totalCount: transactions.length,
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
    };
  }, [transactions]);

  // Extract unique categories for filter dropdown
  const categoriesList = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category));
    return Array.from(cats);
  }, [transactions]);

  // Handle Form Submission for new transaction
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload = {
      title: newTransaction.title,
      category: newTransaction.category,
      type: newTransaction.type,
      amount: parseFloat(newTransaction.amount) || 0,
      date: newTransaction.date,
    };

    try {
      const response = await API.post('transactions/', payload);
      setTransactions((prev) => [response.data || { ...payload, id: Date.now() }, ...prev]);
      setSuccessMessage('Transaction recorded successfully.');
      setShowAddModal(false);
      setNewTransaction({
        title: '',
        category: 'Operations',
        type: 'expense',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('Failed to save transaction to API:', err);
      // Optimistic local add fallback
      setTransactions((prev) => [{ ...payload, id: Date.now() }, ...prev]);
      setSuccessMessage('Transaction added locally to session.');
      setShowAddModal(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading transaction records and ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Alert Notifications */}
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

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 tracking-tight">Transactions Ledger</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track, audit, and categorize all project revenues and operating disbursements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchTransactions}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
          >
            <Plus size={18} />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Recorded Operations</span>
            <Receipt size={20} className="text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-50">{metrics.totalCount}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Total entries log</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Inflow</span>
            <ArrowDownLeft size={20} className="text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-400">{formatAmount(metrics.totalIncome)}</h3>
          <p className="text-[11px] text-emerald-400/80 mt-1">Gross revenues & funding</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Outflow</span>
            <ArrowUpRight size={20} className="text-rose-400" />
          </div>
          <h3 className="text-2xl font-bold text-rose-400">{formatAmount(metrics.totalExpense)}</h3>
          <p className="text-[11px] text-rose-400/80 mt-1">Operational expenditure</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Position</span>
            <DollarSign size={20} className="text-purple-400" />
          </div>
          <h3 className={`text-2xl font-bold ${metrics.netBalance >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
            {formatAmount(metrics.netBalance)}
          </h3>
          <p className="text-[11px] text-purple-400 mt-1">Net surplus cash balance</p>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Type Filter Buttons */}
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                typeFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                typeFilter === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Incomes
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                typeFilter === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Expenses
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="relative min-w-[140px]">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categoriesList.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100">Transaction History</h2>
          <button className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700 cursor-pointer">
            <Download size={14} /> Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Transaction</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-100 flex items-center gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {tx.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <span>{tx.title}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">
                      <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{tx.date}</td>
                    <td className="px-6 py-4 text-xs font-medium capitalize">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] ${
                        tx.type === 'income' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${tx.type === 'income' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold text-sm ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                    No matching transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-50">Record New Transaction</h3>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title / Description</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Server Renewal Payment"
                  value={newTransaction.title}
                  onChange={(e) => setNewTransaction({ ...newTransaction, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Marketing"
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Amount</label>
                  <input 
                    type="number" 
                    required
                    placeholder="0.00"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
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
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;