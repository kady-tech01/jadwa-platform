import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, 
  Star, 
  Send, 
  Filter, 
  Search, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Plus,
  ThumbsUp,
  Tag
} from 'lucide-react';
import API from '../services/api';

// Fallback feedback entries for initial or offline state
const defaultFeedbackList = [
  {
    id: 1,
    author: 'Sami Mansouri',
    email: 'sami@example.com',
    type: 'feature', // 'feature' | 'bug' | 'general' | 'inquiry'
    rating: 5,
    subject: 'Excellent financial analytics dashboards',
    message: 'The transaction aggregation features and quick stats render very smoothly. Would love to see dynamic CSV export filters next!',
    status: 'reviewed', // 'new' | 'reviewed' | 'resolved'
    createdAt: '2026-02-28',
  },
  {
    id: 2,
    author: 'Amira Benali',
    email: 'amira@example.com',
    type: 'bug',
    rating: 3,
    subject: 'Minor UI alignment issue on mobile viewports',
    message: 'When accessing the sidebar layout on small mobile screens, the header toggle occasionally overlaps with notification badges.',
    status: 'new',
    createdAt: '2026-03-01',
  },
  {
    id: 3,
    author: 'Yacine Khelifi',
    email: 'yacine@example.com',
    type: 'general',
    rating: 4,
    subject: 'Clean and intuitive dashboard interface',
    message: 'Great dark theme contrast and overall responsiveness. Keep up the awesome work on performance optimizations!',
    status: 'resolved',
    createdAt: '2026-03-03',
  },
];

const Feedback = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Core Data States
  const [feedbackList, setFeedbackList] = useState(defaultFeedbackList);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal / Form state for submitting feedback
  const [showModal, setShowModal] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    author: '',
    email: '',
    type: 'general',
    rating: 5,
    subject: '',
    message: '',
  });

  // Fetch feedback list from Django REST backend
  const fetchFeedback = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await API.get('feedback/');
      if (Array.isArray(response.data)) {
        setFeedbackList(response.data);
      } else if (response.data.results) {
        setFeedbackList(response.data.results);
      }
    } catch (err) {
      console.warn('Feedback API unavailable. Displaying local cached session records.', err);
      setErrorMessage('Unable to connect to live feedback endpoint. Showing local data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // Filtered feedback entries
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((item) => {
      const matchesSearch = item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [feedbackList, searchTerm, typeFilter, statusFilter]);

  // Rating and Sentiment Metrics
  const metrics = useMemo(() => {
    const total = feedbackList.length;
    if (total === 0) return { averageRating: 0, bugCount: 0, featureCount: 0 };

    const sumRating = feedbackList.reduce((acc, f) => acc + (Number(f.rating) || 0), 0);
    const bugs = feedbackList.filter((f) => f.type === 'bug').length;
    const features = feedbackList.filter((f) => f.type === 'feature').length;

    return {
      total,
      averageRating: (sumRating / total).toFixed(1),
      bugCount: bugs,
      featureCount: features,
    };
  }, [feedbackList]);

  // Handle Form Submission
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload = {
      ...newFeedback,
      status: 'new',
      createdAt: new Date().toISOString().split('T')[0],
    };

    try {
      const response = await API.post('feedback/', payload);
      setFeedbackList((prev) => [response.data || { ...payload, id: Date.now() }, ...prev]);
      setSuccessMessage('Thank you! Your feedback has been submitted successfully.');
      setShowModal(false);
      setNewFeedback({ author: '', email: '', type: 'general', rating: 5, subject: '', message: '' });
    } catch (err) {
      console.error('Failed to submit feedback via API:', err);
      // Fallback local insertion
      setFeedbackList((prev) => [{ ...payload, id: Date.now() }, ...prev]);
      setSuccessMessage('Feedback recorded locally for this session.');
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading user feedback and submissions...</p>
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
          <h1 className="text-2xl font-bold text-slate-50 tracking-tight">Feedback & Reviews</h1>
          <p className="text-sm text-slate-400 mt-1">
            Collect user inquiries, feature requests, bug reports, and operational reviews.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchFeedback}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh Feedback"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Plus size={18} />
            <span>Submit Feedback</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Rating</span>
            <Star size={20} className="text-amber-400 fill-amber-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-50">{metrics.averageRating} <span className="text-sm text-slate-500 font-normal">/ 5.0</span></h3>
          <p className="text-[11px] text-slate-400 mt-1">Based on {metrics.total} submissions</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Feedback</span>
            <MessageSquare size={20} className="text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-50">{metrics.total}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Total recorded items</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Feature Requests</span>
            <Tag size={20} className="text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-purple-400">{metrics.featureCount}</h3>
          <p className="text-[11px] text-purple-400/80 mt-1">Enhancement suggestions</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Bug Reports</span>
            <AlertCircle size={20} className="text-rose-400" />
          </div>
          <h3 className="text-2xl font-bold text-rose-400">{metrics.bugCount}</h3>
          <p className="text-[11px] text-rose-400/80 mt-1">Reported issues</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="feature">Feature Request</option>
            <option value="bug">Bug Report</option>
            <option value="general">General Feedback</option>
            <option value="inquiry">Inquiry</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="reviewed">Under Review</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Feedback Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredFeedback.length > 0 ? (
          filteredFeedback.map((item) => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border uppercase tracking-wider ${
                    item.type === 'bug' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    item.type === 'feature' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {item.type}
                  </span>

                  {/* Star Rating Display */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={14} 
                        className={star <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'} 
                      />
                    ))}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-100 mb-1">{item.subject}</h3>
                <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">{item.message}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div>
                  <span className="font-semibold text-slate-200">{item.author}</span>
                  <span className="block text-[11px] text-slate-500">{item.createdAt}</span>
                </div>

                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium capitalize ${
                  item.status === 'resolved' ? 'text-emerald-400 bg-emerald-500/10' :
                  item.status === 'reviewed' ? 'text-amber-400 bg-amber-500/10' :
                  'text-slate-400 bg-slate-800'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            No feedback entries match your criteria.
          </div>
        )}
      </div>

      {/* New Feedback Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-50">Submit Your Feedback</h3>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Your Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Khadidja Mechara"
                    value={newFeedback.author}
                    onChange={(e) => setNewFeedback({...newFeedback, author: e.target.value})}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="khadidja@example.com"
                    value={newFeedback.email}
                    onChange={(e) => setNewFeedback({...newFeedback, email: e.target.value})}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
                  <select
                    value={newFeedback.type}
                    onChange={(e) => setNewFeedback({...newFeedback, type: e.target.value})}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="general">General Feedback</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                    <option value="inquiry">Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Rating</label>
                  <div className="flex items-center gap-1.5 pt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewFeedback({...newFeedback, rating: star})}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star size={18} className={star <= newFeedback.rating ? 'fill-amber-400' : 'text-slate-700'} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                <input 
                  type="text" 
                  required
                  placeholder="Summary of your feedback..."
                  value={newFeedback.subject}
                  onChange={(e) => setNewFeedback({...newFeedback, subject: e.target.value})}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Detailed Message</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Describe your thoughts or issue in detail..."
                  value={newFeedback.message}
                  onChange={(e) => setNewFeedback({...newFeedback, message: e.target.value})}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Submit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;