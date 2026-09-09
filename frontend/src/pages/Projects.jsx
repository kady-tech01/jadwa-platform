import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FolderKanban, 
  MoreVertical, 
  Calendar, 
  Trash2, 
  Eye, 
  Edit3, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

// Helper to normalize Django snake_case & React camelCase
const formatProject = (proj) => {
  if (!proj) return null;
  return {
    ...proj,
    id: proj.id ?? proj.pk ?? proj._id ?? Date.now(),
    title: proj.title || proj.name || 'Untitled Project',
    category: proj.category || 'General Feasibility',
    status: proj.status || 'Draft',
    initialInvestment: 
      proj.initialInvestment ?? 
      proj.initial_investment ?? 
      proj.investment ?? 
      0,
    npv: proj.npv ?? 0,
    irr: proj.irr ?? 'N/A',
    createdAt: 
      proj.createdAt ?? 
      proj.created_at ?? 
      (proj.created_at_date ? String(proj.created_at_date) : 'Recent'),
  };
};

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeMenuId, setActiveMenuId] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    setErrorMessage(null);

    // Retrieve local user-created projects
    const localProjectsRaw = JSON.parse(localStorage.getItem('custom_projects') || '[]');
    const localProjects = localProjectsRaw.map(formatProject).filter(Boolean);

    try {
      const response = await API.get('projects/');
      const fetchedRaw = Array.isArray(response.data) 
        ? response.data 
        : response.data.results || [];

      const fetchedData = fetchedRaw.map(formatProject).filter(Boolean);

      // Combine local + backend user projects, avoiding duplicate IDs
      const projectMap = new Map();
      [...localProjects, ...fetchedData].forEach((p) => {
        if (p && p.id) {
          projectMap.set(String(p.id), p);
        }
      });

      setProjects(Array.from(projectMap.values()));
    } catch (err) {
      console.warn('Backend endpoint offline. Showing local user data only.', err);
      setProjects(localProjects);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation();
    setActiveMenuId(null);

    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await API.delete(`projects/${id}/`);
    } catch (err) {
      console.warn('API delete failed or offline; removing project locally.', err);
    }

    // Clean up local storage
    const localProjects = JSON.parse(localStorage.getItem('custom_projects') || '[]');
    const updatedLocal = localProjects.filter((p) => String(p.id) !== String(id));
    localStorage.setItem('custom_projects', JSON.stringify(updatedLocal));

    // Update state
    setProjects((prev) => prev.filter((p) => String(p.id) !== String(id)));
  };

  const filteredProjects = projects.filter((project) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = (project.title || '').toLowerCase().includes(term);
    const categoryMatch = (project.category || '').toLowerCase().includes(term);
    const matchesSearch = titleMatch || categoryMatch;
    
    const matchesStatus = 
      statusFilter === 'All' || 
      (project.status || '').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalInvestment = filteredProjects.reduce(
    (acc, curr) => acc + (Number(curr.initialInvestment) || 0), 0
  );
  const totalNPV = filteredProjects.reduce(
    (acc, curr) => acc + (Number(curr.npv) || 0), 0
  );

  const getStatusBadge = (status) => {
    const normalized = (status || '').toLowerCase();
    switch (normalized) {
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'in review':
      case 'in_review':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'draft':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading feasibility studies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 tracking-tight">Feasibility Projects</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage, evaluate, and track financial metrics across all investment studies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchProjects}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={() => navigate('/projects/new')}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
          >
            <Plus size={18} />
            <span>Create New Study</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Projects</span>
          <h3 className="text-2xl font-bold text-slate-100 mt-1">{filteredProjects.length} Studies</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total CapEx / Investment</span>
          <h3 className="text-2xl font-bold text-blue-400 mt-1">${totalInvestment.toLocaleString()}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Combined Portfolio NPV</span>
          <h3 className={`text-2xl font-bold mt-1 ${totalNPV >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${totalNPV.toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by project name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter size={18} className="text-slate-400 shrink-0" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer w-full sm:w-auto"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="In Review">In Review</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <FolderKanban className="w-12 h-12 text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-200">No projects found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm">
            You haven't created any projects yet. Click "Create New Study" to create your first project.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const npvValue = Number(project.npv) || 0;
            const isFeasible = npvValue >= 0;

            return (
              <div 
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all duration-200 hover:shadow-xl hover:shadow-black/40 cursor-pointer flex flex-col justify-between relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(project.status)}`}>
                        {project.status || 'Draft'}
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                        isFeasible 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {isFeasible ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {isFeasible ? 'Feasible' : 'Unfeasible'}
                      </span>
                    </div>

                    <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === project.id ? null : project.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenuId === project.id && (
                        <div className="absolute right-0 top-8 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 py-1 text-xs">
                          <button 
                            onClick={() => {
                              setActiveMenuId(null);
                              navigate(`/projects/${project.id}`);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-slate-700 transition-colors"
                          >
                            <Eye size={14} /> View Details
                          </button>
                          <button 
                            onClick={() => {
                              setActiveMenuId(null);
                              navigate(`/projects/${project.id}/edit`);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-slate-700 transition-colors"
                          >
                            <Edit3 size={14} /> Edit Details
                          </button>
                          <button 
                            onClick={(e) => handleDeleteProject(project.id, e)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{project.category || 'General Feasibility'}</p>

                  <div className="grid grid-cols-3 gap-2 my-5 p-3 bg-slate-800/50 rounded-xl border border-slate-800/80 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">CapEx</span>
                      <span className="text-xs font-bold text-slate-200 flex items-center justify-center mt-0.5">
                        ${Number(project.initialInvestment || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">NPV</span>
                      <span className={`text-xs font-bold mt-0.5 block ${isFeasible ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ${npvValue.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">IRR</span>
                      <span className="text-xs font-bold text-slate-200 mt-0.5 block">
                        {project.irr !== undefined && project.irr !== null
                          ? (typeof project.irr === 'number' ? `${project.irr}%` : project.irr) 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {project.createdAt || 'Recent'}
                  </span>
                  <span className="text-blue-400 group-hover:translate-x-1 transition-transform font-medium">
                    Details &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Projects;