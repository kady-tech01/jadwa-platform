import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import API from '../api/axios';

const ProjectForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    status: 'Draft',
    initialInvestment: '',
    npv: '',
    irr: '',
    paybackPeriod: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      initialInvestment: parseFloat(formData.initialInvestment) || 0,
      npv: parseFloat(formData.npv) || 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    try {
      const response = await API.post('projects/', payload);
      const newId = response.data.id || response.data.pk;
      navigate(`/projects/${newId}`);
    } catch (err) {
      console.warn('Backend endpoint offline. Saving project to local storage fallback.', err);

      const existingProjects = JSON.parse(localStorage.getItem('custom_projects') || '[]');
      const newProject = {
        ...payload,
        id: Date.now(),
      };

      localStorage.setItem('custom_projects', JSON.stringify([newProject, ...existingProjects]));
      navigate(`/projects/${newProject.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <button 
        onClick={() => navigate('/projects')}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-100 text-sm font-medium transition-colors cursor-pointer"
      >
        <ArrowLeft size={18} />
        <span>Back to Projects</span>
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">Create New Feasibility Study</h1>
          <p className="text-sm text-slate-400 mt-1">Enter financial metrics and structural parameters for evaluation.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Project Title *</label>
            <input 
              type="text" 
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Solar Farm Energy Feasibility"
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Category</label>
              <input 
                type="text" 
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Renewable Energy"
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="Draft">Draft</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Initial CapEx ($)</label>
              <input 
                type="number" 
                name="initialInvestment"
                value={formData.initialInvestment}
                onChange={handleChange}
                placeholder="150000"
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">NPV ($)</label>
              <input 
                type="number" 
                name="npv"
                value={formData.npv}
                onChange={handleChange}
                placeholder="45000"
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">IRR (%)</label>
              <input 
                type="text" 
                name="irr"
                value={formData.irr}
                onChange={handleChange}
                placeholder="18.5%"
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Payback Period</label>
            <input 
              type="text" 
              name="paybackPeriod"
              value={formData.paybackPeriod}
              onChange={handleChange}
              placeholder="e.g., 3.2 Years"
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Description</label>
            <textarea 
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide strategic notes, cash flow assumptions, or risk analysis..."
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button 
              type="button"
              onClick={() => navigate('/projects')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>Save Feasibility Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;