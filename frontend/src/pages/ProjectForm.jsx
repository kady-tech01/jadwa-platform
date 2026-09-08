import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, Calculator, Globe } from 'lucide-react';
import API from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const ProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const { selectedCurrency, changeCurrency, Currencies } = useCurrency();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Technology',
    status: 'Draft',
    currency: selectedCurrency.code,
    initialCapital: '',
    annualRevenue: '',
    annualExpenses: '',
    npv: '',
    irr: '',
    paybackPeriod: '',
    description: '',
  });

  useEffect(() => {
    if (!isEditMode) return;

    const fetchProjectData = async () => {
      try {
        setFetching(true);
        const response = await API.get(`projects/${id}/`);
        setFormData(response.data);
        if (response.data.currency) {
          changeCurrency(response.data.currency);
        }
      } catch (error) {
        console.warn('Backend endpoint unavailable, attempting local cache lookup:', error);

        const localProjects = JSON.parse(localStorage.getItem('jadwa_projects') || '[]');
        const existingProject = localProjects.find((p) => String(p.id) === String(id));

        if (existingProject) {
          setFormData(existingProject);
          if (existingProject.currency) {
            changeCurrency(existingProject.currency);
          }
        } else {
          alert('Project requested could not be located.');
          navigate('/projects');
        }
      } finally {
        setFetching(false);
      }
    };

    fetchProjectData();
  }, [id, isEditMode, navigate, changeCurrency]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'currency') {
      changeCurrency(value);
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Automatic Financial KPI Estimates
      const capital = Number(name === 'initialCapital' ? value : prev.initialCapital) || 0;
      const revenue = Number(name === 'annualRevenue' ? value : prev.annualRevenue) || 0;
      const expenses = Number(name === 'annualExpenses' ? value : prev.annualExpenses) || 0;

      const netCashFlow = revenue - expenses;

      if (capital > 0 && netCashFlow > 0) {
        const calcPayback = (capital / netCashFlow).toFixed(1);
        const discountRate = 0.10;
        let npvVal = -capital;
        for (let year = 1; year <= 5; year++) {
          npvVal += netCashFlow / Math.pow(1 + discountRate, year);
        }
        const calcIRR = Math.round((netCashFlow / capital) * 100);

        updated.paybackPeriod = calcPayback;
        updated.npv = Math.round(npvVal).toString();
        updated.irr = calcIRR.toString();
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const projectId = isEditMode ? id : Date.now();
    const payload = { 
      ...formData, 
      id: projectId,
      currency: selectedCurrency.code,
      createdAt: formData.createdAt || new Date().toISOString().split('T')[0]
    };

    // 1. Safe Synchronous LocalStorage Save First
    const localProjects = JSON.parse(localStorage.getItem('jadwa_projects') || '[]');
    let updatedProjects;

    if (isEditMode) {
      updatedProjects = localProjects.map((p) =>
        String(p.id) === String(id) ? { ...p, ...payload } : p
      );
    } else {
      updatedProjects = [payload, ...localProjects];
    }
    localStorage.setItem('jadwa_projects', JSON.stringify(updatedProjects));

    // 2. Attempt Backend Sync
    try {
      if (isEditMode) {
        await API.put(`projects/${id}/`, payload);
      } else {
        await API.post('projects/', payload);
      }
    } catch (error) {
      console.warn('Backend API persistence failed. Saved locally instead:', error);
    } finally {
      setLoading(false);
      navigate('/projects');
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isEditMode ? 'Edit Feasibility Study' : 'Create New Feasibility Study'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Project Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., E-Commerce Logistics Hub"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Technology">Technology</option>
              <option value="Services">Services</option>
              <option value="Energy">Energy</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Logistics">Logistics</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="E-Commerce">E-Commerce</option>
              <option value="Finance & Fintech">Finance & Fintech</option>
              <option value="Tourism & Hospitality">Tourism & Hospitality</option>
              <option value="Manufacturing">Manufacturing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Draft">Draft</option>
              <option value="In Review">In Review</option>
              <option value="Approved">Approved</option>
              <option value="Pending Funding">Pending Funding</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="md:col-span-2 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Globe className="text-blue-600 dark:text-blue-400" size={22} />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Project Currency</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Sets the currency formatting globally for this project study.</p>
              </div>
            </div>
            <select
              name="currency"
              value={selectedCurrency.code}
              onChange={handleChange}
              className="px-4 py-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              {Currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol}) - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Initial Capital ({selectedCurrency.symbol})
            </label>
            <input
              type="number"
              name="initialCapital"
              value={formData.initialCapital}
              onChange={handleChange}
              placeholder="100000"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Expected Annual Revenue ({selectedCurrency.symbol})
            </label>
            <input
              type="number"
              name="annualRevenue"
              value={formData.annualRevenue || ''}
              onChange={handleChange}
              placeholder="45000"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Expected Annual Operating Expenses ({selectedCurrency.symbol})
            </label>
            <input
              type="number"
              name="annualExpenses"
              value={formData.annualExpenses || ''}
              onChange={handleChange}
              placeholder="12000"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
              <Calculator size={16} />
              <span>Calculated Financial Indicators</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Net Present Value (NPV {selectedCurrency.symbol})
            </label>
            <input
              type="number"
              name="npv"
              value={formData.npv}
              onChange={handleChange}
              placeholder="45000"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Internal Rate of Return (IRR %)
            </label>
            <input
              type="number"
              name="irr"
              value={formData.irr}
              onChange={handleChange}
              placeholder="18.5"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Payback Period (Years)
            </label>
            <input
              type="number"
              step="0.1"
              name="paybackPeriod"
              value={formData.paybackPeriod}
              onChange={handleChange}
              placeholder="3.2"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Description & Summary
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe project assumptions or operational goals..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span>{isEditMode ? 'Update Study' : 'Save Project'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;