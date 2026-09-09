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
  DollarSign,
  X,
  Trash2,
  FolderKanban
} from 'lucide-react';
import API from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const Transactions = ({ projectId }) => {
  const { formatAmount } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // User's Project Transactions (Starts completely empty)
  const [transactions, setTransactions] = useState([]);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'income' | 'expense'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State for adding a user's transaction
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    title: '',
    category: 'Operations',
    type: 'expense',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Fetch only user-created transactions for this specific project
  const fetchTransactions = useCallback(async () => {
    if (!projectId) {
      setTransactions([]);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await API.get(`transactions/`, {
        params: { project: projectId }
      });

      if (Array.isArray(response.data)) {
        setTransactions(response.data);
      } else if (response.data.results) {
        setTransactions(response.data.results);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setErrorMessage('Could not load transactions for this project.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handle manual entry submission by the user
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!projectId) {
      setErrorMessage('Please select a project before adding transactions.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload = {
      project: projectId,
      title: newTransaction.title.trim(),
      category: newTransaction.category.trim(),
      type: newTransaction.type,
      amount: parseFloat(newTransaction.amount) || 0,
      date: newTransaction.date,
    };

    try {
      const response = await API.post('transactions/', payload);
      setTransactions((prev) => [response.data, ...prev]);
      setSuccessMessage('Transaction added successfully!');
      setShowAddModal(false);
      
      // Reset form
      setNewTransaction({
        title: '',
        category: 'Operations',
        type: 'expense',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('Failed to create transaction:', err);
      setErrorMessage('Failed to save transaction. Please check your backend connection.');
    } finally {
      setSaving(false);
    }
  };

  // Handle deleting a user transaction
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction record?')) return;

    setDeletingId(id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await API.delete(`transactions/${id}/`);
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      setSuccessMessage('Transaction deleted.');
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      setErrorMessage('Failed to delete transaction.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered transactions derived state
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const titleMatch = tx.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const categoryMatch = tx.category?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const matchesSearch = titleMatch || categoryMatch;
      
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchTerm, typeFilter, categoryFilter]);

  // Live Aggregate KPI Metrics computed from user input
  const metrics = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    return {
      totalCount: transactions.length,
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
    };
  }, [transactions]);

  // Dynamically pull categories created by the user for the dropdown filter
  const categoriesList = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category).filter(Boolean));
    return Array.from(cats);
  }, [transactions]);

  // Export User Transactions to CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ['ID', 'Title', 'Category', 'Type', 'Amount', 'Date'];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      `"${(tx.title || '').replace(/"/g, '""')}"`,
      `"${(tx.category || '').replace(/"/g, '""')}"`,
      tx.type,
      tx.amount,
      tx.date,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `project_${projectId}_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Screen state when user hasn't selected a project
  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
        <FolderKanban className="w-12 h-12 text-slate-600 mb-3" />
        <h3 className="text-lg font-bold text-slate-200">No Project Selected</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-md">
          Please select or open a project to enter and track its financial transactions.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Fetching project ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Alert Notifications */}
      {errorMessage && (
        <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-amber-400 hover:text-amber-200">
            <X size={16} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 tracking-tight">Project Financial Ledger</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manually log, update, and manage financial income and expenses for this project.
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
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Entries</span>
            <Receipt size={20} className="text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-50">{metrics.totalCount}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Total recorded entries</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Inflow</span>
            <ArrowDownLeft size={20} className="text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-400">{formatAmount(metrics.totalIncome)}</h3>
          <p className="text-[11px] text-emerald-400/80 mt-1">Revenues & funding</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Outflow</span>
            <ArrowUpRight size={20} className="text-rose-400" />
          </div>
          <h3 className="text-2xl font-bold text-rose-400">{formatAmount(metrics.totalExpense)}</h3>
          <p className="text-[11px] text-rose-400/80 mt-1">Operational expenses</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Surplus</span>
            <DollarSign size={20} className="text-purple-400" />
          </div>
          <h3 className={`text-2xl font-bold ${metrics.netBalance >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
            {formatAmount(metrics.netBalance)}
          </h3>
          <p className="text-[11px] text-purple-400 mt-1">Net cash position</p>
        </div>
      </div>

      {/* Controls Bar: Search & Filtering */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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
          <h2 className="text-base font-bold text-slate-100">Transaction Log</h2>
          <button 
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700 cursor-pointer disabled:opacity-50"
            disabled={filteredTransactions.length === 0}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Title</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5 text-right">Amount</th>
                <th className="px-6 py-3.5 text-center">Action</th>
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
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteTransaction(tx.id)}
                        disabled={deletingId === tx.id}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete entry"
                      >
                        {deletingId === tx.id ? <Loader2 size={16} className="animate-spin text-rose-400" /> : <Trash2 size={16} />}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No transactions recorded for this project yet.<br />
                    Click <strong className="text-slate-300">"Add Transaction"</strong> above to input your first expense or income entry.
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-50">Add Project Transaction</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title / Description</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Domain Name Renewal"
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
                    placeholder="e.g. Operations"
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
                    step="0.01"
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
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
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

export default Transactions;