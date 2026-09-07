import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Edit3, 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Percent, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  PieChart as PieChartIcon
} from 'lucide-react';
import API from '../services/api';

// Fallback initial detail state for preview or offline testing
const defaultProjectDetail = {
  id: 1,
  title: 'E-Commerce Logistics Expansion',
  category: 'Logistics & Supply Chain',
  status: 'In Review',
  description: 'Feasibility study for establishing a regional micro-fulfillment center network.',
  initialInvestment: 120000,
  annualRevenue: 55000,
  annualOperatingCost: 22000,
  projectLifespanYears: 5,
  discountRate: 10,
  // Derived financial metrics
  npv: 45200,
  irr: '18.5%',
  paybackPeriod: '3.2 Years',
  roi: '37.6%',
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form and detail data state
  const [project, setProject] = useState(defaultProjectDetail);

  // Fetch project details from Django REST Backend
  const fetchProjectDetails = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await API.get(`projects/${id}/`);
      if (response.data) {
        setProject(response.data);
      }
    } catch (err) {
      console.warn('Backend endpoint unreachable. Displaying fallback project data.', err);
      setErrorMessage('Could not load record from backend. Showing local draft state.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  // Handle Input Changes for project parameters
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit parameter updates to calculate feasibility metrics via Backend API
  const handleSaveProject = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Send inputs to backend for validation and recalculation
      const response = await API.put(`projects/${id}/`, {
        ...project,
        initialInvestment: parseFloat(project.initialInvestment) || 0,
        annualRevenue: parseFloat(project.annualRevenue) || 0,
        annualOperatingCost: parseFloat(project.annualOperatingCost) || 0,
        projectLifespanYears: parseInt(project.projectLifespanYears, 10) || 1,
        discountRate: parseFloat(project.discountRate) || 0,
      });

      if (response.data) {
        setProject(response.data);
      }
      setSuccessMessage('Feasibility model recalculated and updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving feasibility details:', err);
      setErrorMessage('Failed to submit updates. Saved to local session preview.');
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Computing financial feasibility metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors w-fit"
        >
          <ArrowLeft size={16} /> Back to Projects
        </button>

        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <Edit3 size={16} /> Edit Parameters
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Status Notifications */}
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

      {/* Project Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-50 tracking-tight">{project.title}</h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {project.status || 'Active'}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">{project.description}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-medium text-slate-500 uppercase block">Category</span>
          <span className="text-sm font-semibold text-slate-200">{project.category}</span>
        </div>
      </div>

      {/* Key Feasibility Output Indicators (KPI Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Present Value (NPV)</span>
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-400">
            ${Number(project.npv || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Discounted net returns over lifecycle</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Internal Rate of Return</span>
            <Percent size={18} className="text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-blue-400">{project.irr || '0%'}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Expected return rate yield</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Payback Period</span>
            <Clock size={18} className="text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-purple-400">{project.paybackPeriod || 'N/A'}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Time required to recover CapEx</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Return on Inv. (ROI)</span>
            <TrendingUp size={18} className="text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold text-amber-400">{project.roi || '0%'}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Efficiency metric of capital spent</p>
        </div>
      </div>

      {/* Input Form & Evaluation Parameters Section */}
      <form onSubmit={handleSaveProject} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Calculator className="text-blue-500" size={20} />
            <h2 className="text-base font-bold text-slate-100">Feasibility Study Input Parameters</h2>
          </div>
          {isEditing && (
            <span className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-medium">
              Editing Enabled
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Initial Capital Expenditure */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Initial Investment / CapEx ($)
            </label>
            <input
              type="number"
              name="initialInvestment"
              value={project.initialInvestment}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            />
          </div>

          {/* Expected Annual Revenue */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Estimated Annual Revenue ($)
            </label>
            <input
              type="number"
              name="annualRevenue"
              value={project.annualRevenue}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            />
          </div>

          {/* Expected Annual Operating Expenses */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Annual Operating Expenses / OpEx ($)
            </label>
            <input
              type="number"
              name="annualOperatingCost"
              value={project.annualOperatingCost}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            />
          </div>

          {/* Project Lifespan */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Project Lifespan (Years)
            </label>
            <input
              type="number"
              name="projectLifespanYears"
              value={project.projectLifespanYears}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            />
          </div>

          {/* Discount Rate */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Discount Rate / WACC (%)
            </label>
            <input
              type="number"
              step="0.1"
              name="discountRate"
              value={project.discountRate}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            />
          </div>
        </div>

        {/* Submit Form Action Bar */}
        {isEditing && (
          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Calculating Model...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Recalculate & Save Study</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProjectDetails;