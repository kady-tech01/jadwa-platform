import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  DollarSign,
  Briefcase,
  RefreshCw,
  Calendar
} from 'lucide-react';
import API from '../api/axios';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchProjectDetails = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await API.get(`projects/${id}/`);
      setProject(response.data);
    } catch (err) {
      console.warn(`Backend fetch failed for ID #${id}. Checking local storage fallback.`, err);

      const localProjects = JSON.parse(localStorage.getItem('custom_projects') || '[]');
      const foundLocal = localProjects.find((p) => String(p.id) === String(id));

      if (foundLocal) {
        setProject(foundLocal);
      } else {
        setErrorMessage('Project could not be retrieved from online server or local storage.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await API.delete(`projects/${id}/`);
    } catch (err) {
      console.warn('API delete request failed; removing project from local storage.');
    }

    const localProjects = JSON.parse(localStorage.getItem('custom_projects') || '[]');
    const updated = localProjects.filter((p) => String(p.id) !== String(id));
    localStorage.setItem('custom_projects', JSON.stringify(updated));

    navigate('/projects');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4 mt-8">
        <AlertCircle size={40} className="text-rose-400 mx-auto" />
        <h3 className="text-lg font-semibold text-slate-200">Project Not Found</h3>
        <p className="text-sm text-slate-400">The study you are trying to view does not exist or has been removed.</p>
        <button 
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 text-blue-400 hover:underline text-sm font-medium cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Projects
        </button>
      </div>
    );
  }

  const isFeasible = (parseFloat(project.npv) || 0) >= 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors text-sm font-medium w-fit cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>Back to Projects</span>
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchProjectDetails}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Refresh Details"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={() => navigate(`/projects/${id}/edit`)}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer"
          >
            <Edit3 size={16} /> Edit
          </button>
          <button 
            onClick={handleDelete}
            className="inline-flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {/* Main Title & Details Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {project.status || 'Active'}
          </span>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1 border ${
            isFeasible 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {isFeasible ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
            {isFeasible ? 'Financially Feasible' : 'Not Feasible'}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-slate-50 tracking-tight">{project.title}</h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-slate-500" />
            <span>{project.category || 'General Feasibility Study'}</span>
          </div>
          {project.createdAt && (
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-500" />
              <span>Created {project.createdAt}</span>
            </div>
          )}
        </div>

        {project.description && (
          <p className="text-slate-300 text-sm leading-relaxed pt-2 border-t border-slate-800">
            {project.description}
          </p>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <DollarSign size={16} className="text-blue-400" /> Initial CapEx
          </div>
          <p className="text-2xl font-bold text-slate-100">
            ${Number(project.initialInvestment || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <TrendingUp size={16} className={isFeasible ? 'text-emerald-400' : 'text-rose-400'} /> Net Present Value (NPV)
          </div>
          <p className={`text-2xl font-bold ${isFeasible ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${Number(project.npv || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Internal Rate of Return (IRR)
          </div>
          <p className="text-2xl font-bold text-slate-100">
            {project.irr ? (typeof project.irr === 'number' ? `${project.irr}%` : project.irr) : 'N/A'}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Payback Period
          </div>
          <p className="text-2xl font-bold text-slate-100">
            {project.paybackPeriod || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;