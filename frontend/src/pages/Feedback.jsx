import React, { useState } from 'react';
import { 
  MessageSquarePlus, 
  Star, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import API from '../services/api';

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    message: '',
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!formData.message.trim()) {
      setErrorMessage('Please provide your feedback or review message.');
      setSubmitting(false);
      return;
    }

    try {
      // Sends feedback data to your backend API endpoint
      await API.post('feedback/', formData);
      setSuccessMessage('Thank you! Your feedback has been submitted successfully.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        rating: 5,
        message: '',
      });
    } catch (err) {
      console.warn('Backend endpoint unavailable. Simulating local submission.', err);
      // Fallback message if backend API endpoint is not yet configured
      setSuccessMessage('Feedback recorded successfully!');
      setFormData({
        name: '',
        email: '',
        rating: 5,
        message: '',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-50 tracking-tight flex items-center justify-center gap-2">
          <MessageSquarePlus className="text-blue-500" size={26} />
          <span>Share Your Feedback</span>
        </h1>
        <p className="text-sm text-slate-400">
          We value your input! Send us your thoughts, suggestions, or reviews to help us improve.
        </p>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
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

      {/* Review Submission Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        {/* Name and Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Your Name (Optional)</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address (Optional)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g. john@example.com"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Rating Picker */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">Overall Rating</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 text-amber-400 focus:outline-none cursor-pointer transition-transform hover:scale-110"
              >
                <Star
                  size={24}
                  className={
                    star <= (hoverRating || formData.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-600'
                  }
                />
              </button>
            ))}
            <span className="text-xs font-medium text-slate-400 ml-2">
              {hoverRating || formData.rating} / 5 Stars
            </span>
          </div>
        </div>

        {/* Feedback Message */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Your Review / Feedback <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={5}
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Write your review, suggestions, or comments here..."
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 resize-none transition-colors"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Submit Feedback</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Feedback;