import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Edit3,
  UserCheck
} from 'lucide-react';

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
  requirement?: string;
  remarks?: string;
  status: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  nextFollowUpAt?: string;
  customFields?: Record<string, any>;
  createdAt: string;
}

interface Activity {
  _id: string;
  leadId: string;
  userId: {
    name: string;
    email: string;
  };
  activityType: string;
  status?: string;
  remark?: string;
  nextFollowUpAt?: string;
  createdAt: string;
}

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Lead state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  const [savingLead, setSavingLead] = useState(false);

  // Log Call Activity state
  const [activityStatus, setActivityStatus] = useState('CONTACTED');
  const [remark, setRemark] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('10:00');
  const [loggingCall, setLoggingCall] = useState(false);

  // Messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchLeadAndActivities();
    }
  }, [id]);

  const fetchLeadAndActivities = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const [leadRes, activitiesRes] = await Promise.all([
        api.get(`/leads/${id}`),
        api.get(`/activities/lead/${id}`)
      ]);

      setLead(leadRes.data);
      setEditForm(leadRes.data);
      setActivities(activitiesRes.data);
    } catch (error: any) {
      console.error('Error fetching lead details:', error);
      setErrorMsg('Failed to fetch lead profile details.');
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

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLead(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.put(`/leads/${id}`, editForm);
      setLead(res.data);
      setIsEditing(false);
      setSuccessMsg('Lead details updated successfully.');
      fetchLeadAndActivities(); // Reload activity timeline since details edit might log audit activity
    } catch (error: any) {
      console.error('Error updating lead details:', error);
      setErrorMsg(error.response?.data?.message || 'Failed to update details');
    } finally {
      setSavingLead(false);
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingCall(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    let nextFollowUpAt: string | undefined = undefined;
    if (activityStatus === 'FOLLOW_UP') {
      if (!followUpDate) {
        setErrorMsg('Please schedule a callback date and time');
        setLoggingCall(false);
        return;
      }
      nextFollowUpAt = `${followUpDate}T${followUpTime}:00`;
    }

    try {
      await api.post('/activities', {
        leadId: id,
        activityType: 'CALL',
        status: activityStatus,
        remark,
        nextFollowUpAt
      });

      setRemark('');
      setFollowUpDate('');
      setSuccessMsg('Call logged successfully. Status updated.');
      fetchLeadAndActivities(); // Reload details and timeline
    } catch (error: any) {
      console.error('Error logging activity:', error);
      setErrorMsg(error.response?.data?.message || 'Failed to save call outcomes');
    } finally {
      setLoggingCall(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
        <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium font-sans">Retrieving lead timeline...</p>
      </div>
    );
  }

  if (errorMsg && !lead) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-[12px] flex items-center space-x-3 text-left">
        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
        <p className="text-sm font-semibold">{errorMsg}</p>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <Link
          to={user?.role === 'MANAGER' ? '/manager/leads' : '/agent/leads'}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 bg-white border border-slate-200 py-1.5 px-3 rounded-lg shadow-sm transition-all min-h-[36px]"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Directory
        </Link>
        <span className="text-xs text-slate-400">Lead ID: {lead._id}</span>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-emerald-700 p-4 rounded-[12px] flex items-center space-x-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-xs font-semibold">{successMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1 & 2: Lead Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main profile card */}
          <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-6 relative">
            {/* Lead Status badge */}
            <div className="absolute top-6 right-6">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                lead.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                lead.status === 'INCOMPLETE' ? 'bg-red-100 text-red-800' :
                lead.status === 'FOLLOW_UP' ? 'bg-amber-100 text-amber-800' :
                lead.status === 'INTERESTED' ? 'bg-indigo-100 text-indigo-800' :
                lead.status === 'CONVERTED' ? 'bg-green-100 text-green-800' :
                'bg-slate-100 text-slate-800'
              }`}>
                {lead.status}
              </span>
            </div>

            {/* Profile heading */}
            <div className="space-y-1 mb-6">
              <h3 className="text-xl font-bold text-slate-900 leading-tight">{lead.displayName}</h3>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{lead.gmbCategory || 'Uncategorized Category'}</p>
            </div>

            {/* Detail Editing Form */}
            {isEditing ? (
              <form onSubmit={handleSaveDetails} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Business Name</label>
                    <input
                      type="text"
                      name="businessName"
                      value={editForm.businessName || ''}
                      onChange={handleEditChange}
                      className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Customer/Contact Name</label>
                    <input
                      type="text"
                      name="customerName"
                      value={editForm.customerName || ''}
                      onChange={handleEditChange}
                      className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Mobile/Phone</label>
                    <input
                      type="text"
                      name="mobile"
                      value={editForm.mobile || ''}
                      onChange={handleEditChange}
                      className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Alternate Phone</label>
                    <input
                      type="text"
                      name="alternatePhone"
                      value={editForm.alternatePhone || ''}
                      onChange={handleEditChange}
                      className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      name="whatsappNumber"
                      value={editForm.whatsappNumber || ''}
                      onChange={handleEditChange}
                      className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email || ''}
                      onChange={handleEditChange}
                      className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">GMB Category</label>
                    <input
                      type="text"
                      name="gmbCategory"
                      value={editForm.gmbCategory || ''}
                      onChange={handleEditChange}
                      className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Website URL</label>
                    <input
                      type="text"
                      name="website"
                      value={editForm.website || ''}
                      onChange={handleEditChange}
                      className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Google Maps URL</label>
                    <input
                      type="text"
                      name="googleMapsUrl"
                      value={editForm.googleMapsUrl || ''}
                      onChange={handleEditChange}
                      className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Requirement Details</label>
                    <input
                      type="text"
                      name="requirement"
                      value={editForm.requirement || ''}
                      onChange={handleEditChange}
                      className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={editForm.city || ''}
                      onChange={handleEditChange}
                      className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={editForm.state || ''}
                      onChange={handleEditChange}
                      className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Full Address</label>
                  <textarea
                    name="address"
                    value={editForm.address || ''}
                    onChange={handleEditChange}
                    rows={2}
                    className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Remarks / Internal Notes</label>
                  <textarea
                    name="remarks"
                    value={editForm.remarks || ''}
                    onChange={handleEditChange}
                    rows={2}
                    className="w-full rounded-[8px] border border-slate-350 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="submit"
                    disabled={savingLead}
                    className="bg-brand-purple hover:bg-brand-purple-hover text-white font-bold py-2 px-4 rounded-[8px] transition-all disabled:opacity-50 min-h-[38px] flex items-center"
                  >
                    {savingLead ? 'Saving...' : 'Save Updates'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm(lead);
                    }}
                    className="border border-slate-350 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-[8px] min-h-[38px]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 text-xs text-slate-700">
                {/* 2-Column Details List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                  <div className="flex items-center space-x-3 py-1">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Mobile/Phone</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {lead.mobile || <span className="text-red-500 italic bg-red-50 px-1 py-0.5 rounded font-sans text-xs">Missing</span>}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 py-1">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Alternate Phone</span>
                      <span className="font-mono text-slate-800">{lead.alternatePhone || '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 py-1">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Email Address</span>
                      <span className="text-slate-800">{lead.email || '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 py-1">
                    <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Website URL</span>
                      {lead.website ? (
                        <a href={lead.website.startsWith('http') ? lead.website : `http://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-brand-purple hover:underline truncate max-w-[200px] block">
                          {lead.website}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 py-1">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">City & Region</span>
                      <span className="text-slate-800 capitalize">{lead.city || '—'}{lead.state ? `, ${lead.state}` : ''}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 py-1">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Full Address</span>
                      <span className="text-slate-600 block max-w-xs">{lead.address || '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 py-1">
                    <Sparkles className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">GMB Rating & Reviews</span>
                      <span className="font-semibold text-slate-900">
                        {lead.rating ? `⭐ ${lead.rating} (${lead.reviewCount || 0} reviews)` : 'No ratings data'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 py-1">
                    <UserCheck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Assigned Calling Agent</span>
                      <span className="font-semibold text-slate-900">
                        {lead.assignedTo?.name || <span className="text-slate-400 italic">Unassigned</span>}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Requirements / Remarks */}
                <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-100">
                  {lead.requirement && (
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold mb-0.5">Requirement Details</span>
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-700 leading-relaxed">{lead.requirement}</div>
                    </div>
                  )}
                  {lead.remarks && (
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold mb-0.5">Internal Remarks / Notes</span>
                      <div className="bg-purple-50/30 p-2.5 rounded border border-purple-100 text-slate-700 leading-relaxed font-sans">{lead.remarks}</div>
                    </div>
                  )}
                </div>

                {/* Google Maps link CTA */}
                {lead.googleMapsUrl && (
                  <div className="pt-2">
                    <a
                      href={lead.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-brand-purple hover:underline bg-brand-purple/10 px-3 py-1.5 rounded-lg border border-brand-purple/20 min-h-[36px]"
                    >
                      <MapPin className="w-4 h-4 mr-1.5" />
                      Open Google Maps Business Profile
                    </a>
                  </div>
                )}

                {/* Unmapped Custom Spreadsheet Columns */}
                {lead.customFields && Object.keys(lead.customFields).length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Unmapped Excel Columns</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(lead.customFields).map(([key, val]) => (
                        <div key={key} className="bg-slate-50 border border-slate-200 rounded p-2 text-xs truncate">
                          <span className="text-slate-400 block text-[9px] font-bold">{key}</span>
                          <span className="font-mono text-slate-700">{String(val) || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Edit details button trigger */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center text-xs font-bold text-slate-750 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-[8px] transition-all min-h-[38px]"
                  >
                    <Edit3 className="w-4 h-4 mr-1.5" />
                    Modify Lead Fields
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: Calling Logging & Timeline Activities */}
        <div className="space-y-6">
          {/* LOG ACTIVITY CARD */}
          <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-5 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center">
              <Phone className="w-4 h-4 mr-1.5 text-brand-purple" />
              Log Calling Outcome
            </h4>

            <form onSubmit={handleLogActivity} className="space-y-3.5 text-xs text-left">
              {/* Call Result select */}
              <div>
                <label className="block font-bold text-slate-600 mb-1">Call Outcome Status</label>
                <select
                  value={activityStatus}
                  onChange={(e) => setActivityStatus(e.target.value)}
                  className="w-full bg-white border border-slate-350 rounded-[8px] py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                >
                  <option value="CONTACTED">Connected / Dialed</option>
                  <option value="NEW">Reset status to NEW</option>
                  <option value="NOT_PICKED">Not Picked</option>
                  <option value="BUSY">Busy</option>
                  <option value="FOLLOW_UP">Follow Up Scheduled</option>
                  <option value="INTERESTED">Interested (Warm)</option>
                  <option value="CONVERTED">Converted (Sale Won)</option>
                  <option value="NOT_INTERESTED">Not Interested</option>
                  <option value="INVALID_NUMBER">Invalid Number</option>
                </select>
              </div>

              {/* Follow-up date select (displays only when status is FOLLOW_UP) */}
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

              {/* Remark */}
              <div>
                <label className="block font-bold text-slate-600 mb-1">Call Note / Remarks</label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Enter notes about this call..."
                  rows={3}
                  className="w-full rounded-[8px] border border-slate-350 bg-white py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                  required
                />
              </div>

              {/* Submit dial */}
              <button
                type="submit"
                disabled={loggingCall}
                className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white font-bold py-2.5 rounded-[8px] shadow-md shadow-brand-purple/20 transition-all disabled:opacity-50 min-h-[40px] flex items-center justify-center"
              >
                {loggingCall ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Save Outcome & Log Call'
                )}
              </button>
            </form>
          </div>

          {/* TIMELINE ACTIVITY LOGS */}
          <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-5 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
              Activity History Timeline
            </h4>

            {activities.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {activities.map((act) => (
                  <div key={act._id} className="relative pl-5 border-l border-slate-200 pb-1 text-xs text-left">
                    {/* Circle icon bullet */}
                    <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-brand-purple border-2 border-white"></div>
                    
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[9px] bg-slate-100 px-1.5 py-0.5 rounded">
                        {act.activityType}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(act.createdAt).toLocaleDateString()} {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {act.status && (
                      <p className="mt-1 text-slate-700">
                        Lead status set to: <strong className="text-slate-900">{act.status}</strong>
                      </p>
                    )}

                    {act.remark && (
                      <p className="mt-1 text-slate-600 bg-slate-50 p-2 rounded border border-slate-150 font-sans italic leading-relaxed">
                        "{act.remark}"
                      </p>
                    )}

                    {act.nextFollowUpAt && (
                      <p className="mt-1.5 text-amber-800 font-semibold bg-amber-50 py-0.5 px-2 rounded inline-block">
                        Scheduled callback: {new Date(act.nextFollowUpAt).toLocaleDateString()} {new Date(act.nextFollowUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}

                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                      Logged by: {act.userId?.name || 'Agent'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">No activity has been logged on this lead yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailPage;
