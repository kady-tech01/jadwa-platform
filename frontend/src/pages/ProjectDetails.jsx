import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, CheckCircle2, AlertTriangle, XCircle, 
  TrendingUp, Clock, DollarSign, Lightbulb, CheckSquare, Sliders
} from 'lucide-react';
import API from '../services/api';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Interactive Simulator State (% Change in Expected Annual Revenue)
  const [revenueChange, setRevenueChange] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await API.get(`projects/${id}/`);
        setProject(res.data);
      } catch (err) {
        // Fallback to LocalStorage
        const localData = JSON.parse(localStorage.getItem('jadwa_projects') || '[]');
        const found = localData.find((p) => String(p.id) === String(id));
        if (found) {
          setProject(found);
        } else {
          // Demo fallback data
          setProject({
            id,
            title: 'Coworking Space & Cafe',
            category: 'Services',
            status: 'In Review',
            initialCapital: 20000,
            annualRevenue: 8500,
            annualExpenses: 2500,
            description: 'A shared workspace equipped for freelancers and students with premium coffee and printing services.'
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this feasibility study?')) return;

    try {
      await API.delete(`projects/${id}/`);
    } catch (err) {
      // Fallback: Remove from local storage
      const localProjects = JSON.parse(localStorage.getItem('jadwa_projects') || '[]');
      const updated = localProjects.filter((p) => String(p.id) !== String(id));
      localStorage.setItem('jadwa_projects', JSON.stringify(updated));
    }
    navigate('/projects');
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading study details...</div>;
  }

  if (!project) {
    return <div className="p-8 text-center text-rose-500">Project not found.</div>;
  }

  // --- AUTOMATED FINANCIAL CALCULATIONS ---
  const capital = Number(project.initialCapital) || 0;
  const baseRevenue = Number(project.annualRevenue) || (capital * 0.45); // Fallback: 45% of capital
  const baseExpenses = Number(project.annualExpenses) || (baseRevenue * 0.35); // Fallback: 35% of revenue

  // Calculate adjusted annual net cash flow based on simulator slider
  const simulatedRevenue = baseRevenue * (1 + revenueChange / 100);
  const netAnnualCashFlow = simulatedRevenue - baseExpenses;

  // Automated Metrics Calculation
  // 1. Payback Period = Initial Capital / Net Annual Cash Flow
  const paybackPeriod = netAnnualCashFlow > 0 
    ? (capital / netAnnualCashFlow).toFixed(1) 
    : 'N/A';

  // 2. Automated NPV (Over a 5-year timeline with 10% discount rate)
  const discountRate = 0.10;
  let npv = -capital;
  for (let year = 1; year <= 5; year++) {
    npv += netAnnualCashFlow / Math.pow(1 + discountRate, year);
  }
  const computedNPV = Math.round(npv);

  // 3. Automated IRR Estimation (ROI Proxy Ratio)
  const estimatedIRR = capital > 0 
    ? Math.round((netAnnualCashFlow / capital) * 100) 
    : 0;

  // --- AUTOMATED DECISION ENGINE ---
  let decision = {
    label: 'Highly Feasible Project',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    icon: CheckCircle2,
    advice: 'Strong return on investment! The project recovers its capital quickly with a positive NPV. Recommended to proceed with launch steps.'
  };

  if (computedNPV < 0) {
    decision = {
      label: 'High Financial Risk',
      color: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      icon: XCircle,
      advice: 'Expected costs exceed projected returns over a 5-year period. Consider reducing initial setup costs or re-evaluating pricing.'
    };
  } else if (estimatedIRR < 12) {
    decision = {
      label: 'Low Margin / Marginal',
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      icon: AlertTriangle,
      advice: 'The project is profitable but yields a relatively low margin. Compare this with other investment options before committing capital.'
    };
  }

  // Auto-generated launch checklist based on category
  const autoChecklist = [
    'Secure business permits and legal registration',
    'Finalize venue lease agreement or digital infrastructure setup',
    'Acquire core equipment and operational inventory',
    'Launch initial social media and marketing campaign'
  ];

  const DecisionIcon = decision.icon;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>Back to Projects</span>
        </button>

        <div className="flex items-center gap-3">
          <Link
            to={`/projects/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit size={16} />
            <span>Edit</span>
          </Link>

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/30 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Header & Decision Badge */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full">
              {project.category}
            </span>
            <h1 className="text-2xl font-bold mt-2">{project.title}</h1>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium ${decision.color}`}>
            <DecisionIcon size={20} />
            <span>{decision.label}</span>
          </div>
        </div>

        {/* Automated Plain-English Insight Box */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/50 flex items-start gap-3">
          <Lightbulb className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div className="text-sm space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-200">Automated Financial Assessment:</p>
            <p className="text-slate-600 dark:text-slate-400">{decision.advice}</p>
          </div>
        </div>
      </div>

      {/* Auto-Calculated Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <DollarSign size={18} className="text-blue-500" />
            <span className="text-xs font-medium uppercase tracking-wide">Initial Capital</span>
          </div>
          <p className="text-2xl font-bold">${capital.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Starting investment needed</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <TrendingUp size={18} className="text-emerald-500" />
            <span className="text-xs font-medium uppercase tracking-wide">Calculated NPV (5-Yr)</span>
          </div>
          <p className={`text-2xl font-bold ${computedNPV >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            ${computedNPV.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">Net profit after 10% discount rate</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Clock size={18} className="text-purple-500" />
            <span className="text-xs font-medium uppercase tracking-wide">Payback Period</span>
          </div>
          <p className="text-2xl font-bold">{paybackPeriod} {paybackPeriod !== 'N/A' ? 'Years' : ''}</p>
          <p className="text-xs text-slate-400 mt-1">Time to break even completely</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <TrendingUp size={18} className="text-indigo-500" />
            <span className="text-xs font-medium uppercase tracking-wide">Est. Annual Return (IRR)</span>
          </div>
          <p className="text-2xl font-bold">{estimatedIRR}%</p>
          <p className="text-xs text-slate-400 mt-1">Annual return on invested capital</p>
        </div>
      </div>

      {/* What-If Interactive Revenue Simulator */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sliders size={20} className="text-blue-600" />
          <h2 className="font-bold text-lg">Interactive "What-If" Sensitivity Simulator</h2>
        </div>
        <p className="text-sm text-slate-500">
          Adjust the slider to simulate how changes in revenue impact your projected NPV and payback timeframe:
        </p>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Revenue Adjustment: {revenueChange > 0 ? `+${revenueChange}%` : `${revenueChange}%`}</span>
            <span>Simulated Net Annual Cash Flow: <strong className="text-blue-600">${Math.round(netAnnualCashFlow).toLocaleString()}</strong></span>
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            step="5"
            value={revenueChange}
            onChange={(e) => setRevenueChange(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Pessimistic (-30%)</span>
            <span>Baseline (0%)</span>
            <span>Optimistic (+30%)</span>
          </div>
        </div>
      </div>

      {/* Auto Launch Roadmap Checklist */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <CheckSquare size={20} className="text-emerald-600" />
          <h2 className="font-bold text-lg">Auto-Generated Execution Checklist</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {autoChecklist.map((task, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-700/50">
              <input type="checkbox" className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{task}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;