import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Phone,
  PhoneCall,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Globe,
  ChevronRight,
  Edit2,
  CheckSquare
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

interface Lead {
  _id: string;
  displayName: string;
  businessName?: string;
  customerName?: string;
  mobile?: string;
  alternatePhone?: string;
  whatsappNumber?: string;
  email?: string;
  website?: string;
  googleMapsUrl?: string;
  gmbCategory?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  source?: string;
  remarks?: string;
  status: string;
  nextFollowUpAt?: string;
  customFields?: Record<string, any>;
}

export const CallingWorkspace: React.FC = () => {
  usePageTitle('Calling Workspace');
  const [queue, setQueue] = useState<Lead[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Inline edit state
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});

  // Calling log state
  const [activityStatus, setActivityStatus] = useState('CONTACTED');
  const [remark, setRemark] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('10:00');
  
  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveQueue();
  }, []);

  const fetchActiveQueue = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      // Fetch agent assigned leads in calling status
      const res = await api.get('/leads/agent/my-leads');
      
      // Filter leads that need calls: NEW, NOT_PICKED, BUSY, FOLLOW_UP, CONTACTED
      const pendingLeads = res.data.filter((l: Lead) =>
        ['NEW', 'NOT_PICKED', 'BUSY', 'FOLLOW_UP', 'CONTACTED'].includes(l.status)
      );

      setQueue(pendingLeads);
      setCurrentIndex(0);
      
      if (pendingLeads.length > 0) {
        setEditForm(pendingLeads[0]);
      }
    } catch (error) {
      console.error('Error fetching calling workspace queue:', error);
      setErrorMsg('Failed to load your assigned dialing queue.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const currentLead = queue[currentIndex];

  const handleSaveAndNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLead) return;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    let nextFollowUpAt: string | undefined = undefined;
    if (activityStatus === 'FOLLOW_UP') {
      if (!followUpDate) {
        setErrorMsg('Please schedule a callback date and time');
        setSubmitting(false);
        return;
      }
      nextFollowUpAt = `${followUpDate}T${followUpTime}:00`;
    }

    try {
      // 1. If agent edited lead fields, save changes first
      if (isEditingDetails) {
        await api.put(`/leads/${currentLead._id}`, editForm);
      }

      // 2. Log calling activity & status update
      await api.post('/activities', {
        leadId: currentLead._id,
        activityType: 'CALL',
        status: activityStatus,
        remark,
        nextFollowUpAt
      });

      setSuccessMsg(`Call logged successfully for: ${currentLead.displayName}`);
      
      // Reset call logging forms
      setRemark('');
      setFollowUpDate('');
      setActivityStatus('CONTACTED');
      setIsEditingDetails(false);

      // Advance index
      const nextIndex = currentIndex + 1;
      if (nextIndex < queue.length) {
        setCurrentIndex(nextIndex);
        setEditForm(queue[nextIndex]);
      } else {
        // Queue completed, refresh
        fetchActiveQueue();
      }
    } catch (error: any) {
      console.error('Error saving call outcomes:', error);
      setErrorMsg(error.response?.data?.message || 'Error occurred while saving workspace results');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      setCurrentIndex(nextIndex);
      setEditForm(queue[nextIndex]);
      setRemark('');
      setFollowUpDate('');
      setActivityStatus('CONTACTED');
      setIsEditingDetails(false);
      setSuccessMsg(null);
      setErrorMsg(null);
    } else {
      setErrorMsg('You have reached the end of your calling queue');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
        <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Opening dialer workspace...</p>
      </div>
    );
  }

  if (errorMsg && queue.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-[12px] flex items-center space-x-3 text-left">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <span className="text-xs font-semibold">{errorMsg}</span>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-12 text-center space-y-6 max-w-xl mx-auto">
        <div className="w-16 h-16 bg-green-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
          <CheckSquare className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Calling Queue Completed!</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            All your assigned leads have been dialed, categorized, or scheduled. Check back later once manager assigns more Excel or records.
          </p>
        </div>
        <button
          onClick={fetchActiveQueue}
          className="bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold py-2.5 px-6 rounded-[8px] transition-all min-h-[40px]"
        >
          Check Directory Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Header and Queue status */}
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">Agent Calling Workspace</h2>
          <p className="text-xs text-slate-500 mt-0.5">Rapid sequential dialing mode. View listing links and update outcomes in one screen.</p>
        </div>
        
        {/* Progress Tracker bar */}
        <div className="bg-navy-950 text-white rounded-[8px] py-1.5 px-4 flex items-center text-xs font-bold shadow-md">
          <Sparkles className="w-4 h-4 mr-2 text-brand-purple-light" />
          Queue Lead: {currentIndex + 1} of {queue.length} pending
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-emerald-700 p-4 rounded-[12px] flex items-center space-x-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-xs font-semibold">{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-[12px] flex items-center space-x-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-xs font-semibold">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (Lg span 2): Active Prospect Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-6 relative space-y-6">
            
            {/* Header info */}
            <div className="pb-4 border-b border-slate-100 flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">{currentLead.businessName || currentLead.displayName}</h3>
                <span className="bg-slate-100 text-slate-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  {currentLead.gmbCategory || 'General lead'}
                </span>
              </div>
              <span className="bg-brand-purple/10 text-brand-purple font-semibold text-[10px] px-2.5 py-1 rounded">
                Current Status: {currentLead.status}
              </span>
            </div>

            {/* Click to Call big panel */}
            {currentLead.mobile ? (
              <div className="bg-purple-50/50 rounded-[12px] border border-purple-100 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Active Dialing Number</span>
                  <span className="text-xl font-extrabold text-navy-950 font-mono tracking-wide">{currentLead.mobile}</span>
                  {currentLead.customerName && (
                    <p className="text-xs text-slate-500 mt-0.5">Contact: <strong className="text-slate-700">{currentLead.customerName}</strong></p>
                  )}
                </div>
                <a
                  href={`tel:${currentLead.mobile}`}
                  className="bg-brand-purple hover:bg-brand-purple-hover text-white text-sm font-semibold rounded-[8px] px-6 py-3 shadow-lg shadow-brand-purple/20 transition-all flex items-center justify-center space-x-2 w-full sm:w-auto min-h-[44px]"
                >
                  <PhoneCall className="w-5 h-5 mr-1" />
                  <span>Call Mobile Number</span>
                </a>
              </div>
            ) : (
              <div className="bg-red-50 rounded-[12px] border border-red-200 p-5 text-red-950 text-xs">
                <p className="font-bold flex items-center mb-1">
                  <AlertCircle className="w-4 h-4 mr-1 text-red-600" />
                  Missing Contact Number (Incomplete Lead)
                </p>
                <p className="text-red-700 leading-relaxed">
                  This lead is flagged as <strong>INCOMPLETE</strong>. Use the edit inputs below or check the website/listing links to find their contact details, fill in the mobile number, and dial to proceed.
                </p>
              </div>
            )}

            {/* Inline Fields Editor toggle */}
            <div className="flex items-center space-x-2 pb-2">
              <input
                type="checkbox"
                id="toggleEdit"
                checked={isEditingDetails}
                onChange={(e) => setIsEditingDetails(e.target.checked)}
                className="rounded text-brand-purple focus:ring-brand-purple"
              />
              <label htmlFor="toggleEdit" className="text-xs font-bold text-slate-700 cursor-pointer flex items-center">
                <Edit2 className="w-3.5 h-3.5 mr-1" />
                Edit lead details while calling
              </label>
            </div>

            {/* Edit form */}
            {isEditingDetails ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100 animate-slideDown">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Contact Name</label>
                  <input
                    type="text"
                    name="customerName"
                    value={editForm.customerName || ''}
                    onChange={handleEditChange}
                    className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Mobile / Phone</label>
                  <input
                    type="text"
                    name="mobile"
                    value={editForm.mobile || ''}
                    onChange={handleEditChange}
                    className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Alternate Phone</label>
                  <input
                    type="text"
                    name="alternatePhone"
                    value={editForm.alternatePhone || ''}
                    onChange={handleEditChange}
                    className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email || ''}
                    onChange={handleEditChange}
                    className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Category</label>
                  <input
                    type="text"
                    name="gmbCategory"
                    value={editForm.gmbCategory || ''}
                    onChange={handleEditChange}
                    className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Website URL</label>
                  <input
                    type="text"
                    name="website"
                    value={editForm.website || ''}
                    onChange={handleEditChange}
                    className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                  />
                </div>
              </div>
            ) : (
              /* Static Display Details */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Location / City</span>
                    <span className="font-semibold text-slate-800 capitalize">{currentLead.city || '—'}{currentLead.state ? `, ${currentLead.state}` : ''}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Website</span>
                    {currentLead.website ? (
                      <a href={currentLead.website.startsWith('http') ? currentLead.website : `http://${currentLead.website}`} target="_blank" rel="noopener noreferrer" className="text-brand-purple hover:underline truncate max-w-[180px] block">
                        {currentLead.website}
                      </a>
                    ) : (
                      <span className="text-slate-400">No website URL</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Sparkles className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Rating & Reviews</span>
                    <span className="font-semibold text-slate-800">
                      {currentLead.rating ? `⭐ ${currentLead.rating} (${currentLead.reviewCount || 0} reviews)` : '—'}
                    </span>
                  </div>
                </div>

                {currentLead.alternatePhone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Alternate Phone</span>
                      <span className="font-semibold text-slate-800 font-mono">{currentLead.alternatePhone}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Custom spreadsheet metadata */}
            {currentLead.customFields && Object.keys(currentLead.customFields).length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Spreadsheet Row Context</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(currentLead.customFields).map(([key, val]) => (
                    <div key={key} className="bg-slate-50 border border-slate-200 rounded p-2 text-xs truncate">
                      <span className="text-slate-400 block text-[9px] font-bold">{key}</span>
                      <span className="font-mono text-slate-700">{String(val) || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links and mapping helpers */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
              {currentLead.googleMapsUrl && (
                <a
                  href={currentLead.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 min-h-[36px]"
                >
                  <MapPin className="w-4 h-4 mr-1.5 text-red-500" />
                  Maps Link
                </a>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Save Outcome & Notes */}
        <div className="space-y-6">
          <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-5 space-y-4">
            <h4 className="font-bold text-slate-950 text-sm flex items-center justify-between">
              <span>Save & Dial Next</span>
              <button
                type="button"
                onClick={handleSkip}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold flex items-center min-h-[32px]"
              >
                Skip Lead
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </button>
            </h4>

            <form onSubmit={handleSaveAndNext} className="space-y-4 text-xs text-left">
              {/* Call Result */}
              <div>
                <label className="block font-bold text-slate-600 mb-1">Calling Result Status</label>
                <select
                  value={activityStatus}
                  onChange={(e) => setActivityStatus(e.target.value)}
                  className="w-full bg-white border border-slate-350 rounded-[8px] py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple text-xs"
                >
                  <option value="CONTACTED">Connected / Dialed</option>
                  <option value="NOT_PICKED">Not Picked / No Answer</option>
                  <option value="BUSY">Line Busy</option>
                  <option value="FOLLOW_UP">Schedule Callback Follow-Up</option>
                  <option value="INTERESTED">Interested (Warm Prospect)</option>
                  <option value="CONVERTED">Converted (Sale Closed)</option>
                  <option value="NOT_INTERESTED">Not Interested</option>
                  <option value="INVALID_NUMBER">Invalid / Switched Off Number</option>
                </select>
              </div>

              {/* Callback date selection */}
              {activityStatus === 'FOLLOW_UP' && (
                <div className="grid grid-cols-2 gap-2 bg-amber-50/50 p-2.5 rounded-[8px] border border-amber-200/50 animate-slideDown">
                  <div>
                    <label className="block font-bold text-amber-900 mb-1">Callback Date</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full rounded-[6px] border border-slate-300 bg-white py-1 px-2 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-amber-900 mb-1">Callback Time</label>
                    <input
                      type="time"
                      value={followUpTime}
                      onChange={(e) => setFollowUpTime(e.target.value)}
                      className="w-full rounded-[6px] border border-slate-300 bg-white py-1 px-2 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Remarks textarea */}
              <div>
                <label className="block font-bold text-slate-600 mb-1">Call Note / Remarks</label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Type calling logs or prospect feedback..."
                  rows={4}
                  className="w-full rounded-[8px] border border-slate-350 bg-white py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple text-xs leading-relaxed"
                  required
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white font-bold py-3 rounded-[8px] shadow-lg shadow-brand-purple/20 transition-all disabled:opacity-50 min-h-[44px] flex items-center justify-center"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Submit & Log Next Lead</span>
                    <ChevronRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallingWorkspace;
