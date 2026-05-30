import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  Phone,
  PhoneCall,
  Sparkles,
  AlertCircle,
  MapPin,
  Globe,
  ChevronRight,
  Edit2,
  CheckSquare,
  RefreshCw,
  RotateCcw,
  Clock,
  ArrowRight,
  PhoneMissed,
  PhoneOff,
  Calendar,
  ThumbsUp,
  Trophy,
  ThumbsDown,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import { buildISTIsoString } from '../utils/dateFormat';
import { toast } from '../components/Toast';
import { MultiSelect, getServiceLabel } from '../components/MultiSelect';

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
  interestedServices?: string[];
}

// Statuses that mean the lead still needs calling retried → stay in queue
const RETRY_STATUSES = ['NOT_PICKED', 'BUSY'];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  NEW:          { label: 'New',          color: 'bg-blue-100 text-blue-800' },
  NOT_PICKED:   { label: 'Not Picked',   color: 'bg-orange-100 text-orange-800' },
  BUSY:         { label: 'Busy',         color: 'bg-yellow-100 text-yellow-800' },
  INCOMPLETE:   { label: 'Incomplete',   color: 'bg-red-100 text-red-800' },
  CONTACTED:    { label: 'Contacted',    color: 'bg-teal-100 text-teal-800' },
  FOLLOW_UP:    { label: 'Follow Up',    color: 'bg-amber-100 text-amber-800' },
  INTERESTED:   { label: 'Interested',   color: 'bg-indigo-100 text-indigo-800' },
  CONVERTED:    { label: 'Converted',    color: 'bg-green-100 text-green-800' },
  NOT_INTERESTED:{ label: 'Not Interested', color: 'bg-slate-100 text-slate-600' },
  INVALID_NUMBER:{ label: 'Invalid Number', color: 'bg-rose-100 text-rose-800' },
};

const STATUS_OPTIONS = [
  { value: 'CONTACTED', label: 'Connected / Dialled', icon: PhoneCall, iconColor: 'text-teal-600', bgColor: 'bg-teal-50' },
  { value: 'NOT_PICKED', label: 'Not Picked / No Answer', icon: PhoneMissed, iconColor: 'text-orange-600', bgColor: 'bg-orange-50' },
  { value: 'BUSY', label: 'Line Busy', icon: PhoneOff, iconColor: 'text-amber-600', bgColor: 'bg-amber-50' },
  { value: 'FOLLOW_UP', label: 'Schedule Callback', icon: Calendar, iconColor: 'text-amber-700', bgColor: 'bg-amber-100/55' },
  { value: 'INTERESTED', label: 'Interested (Warm Prospect)', icon: ThumbsUp, iconColor: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  { value: 'CONVERTED', label: 'Converted (Deal Closed)', icon: Trophy, iconColor: 'text-green-600', bgColor: 'bg-green-50' },
  { value: 'NOT_INTERESTED', label: 'Not Interested', icon: ThumbsDown, iconColor: 'text-slate-500', bgColor: 'bg-slate-50' },
  { value: 'INVALID_NUMBER', label: 'Invalid / Switched Off', icon: AlertTriangle, iconColor: 'text-red-600', bgColor: 'bg-red-50' },
];

export const CallingWorkspace: React.FC = () => {
  usePageTitle('Calling Workspace');
  const [queue, setQueue] = useState<Lead[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalLoaded, setTotalLoaded] = useState(0);

  // Inline edit state
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});

  // Calling log state
  const [activityStatus, setActivityStatus] = useState('CONTACTED');
  const [remark, setRemark] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('10:00');
  
  // Interested Services state
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customService, setCustomService] = useState<string>('');

  // Submit state
  const [submitting, setSubmitting] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchActiveQueue();
  }, []);

  useEffect(() => {
    if (currentLead) {
      const services = currentLead.interestedServices || [];
      const hasOther = services.some(s => s.startsWith('Other: '));
      const otherVal = services.find(s => s.startsWith('Other: '));
      
      const cleanServices = services.map(s => s.startsWith('Other: ') ? 'Other' : s);
      setSelectedServices(cleanServices);
      if (hasOther && otherVal) {
        setCustomService(otherVal.substring(7));
      } else {
        setCustomService('');
      }
    } else {
      setSelectedServices([]);
      setCustomService('');
    }
  }, [currentIndex, queue]);

  const fetchActiveQueue = async () => {
    try {
      setLoading(true);
      // Backend filters to only NEW, INCOMPLETE, NOT_PICKED, BUSY
      const res = await api.get('/leads/agent/my-leads');
      const pendingLeads: Lead[] = res.data;

      setQueue(pendingLeads);
      setTotalLoaded(prev => Math.max(prev, pendingLeads.length));
      setCurrentIndex(0);

      if (pendingLeads.length > 0) {
        setEditForm(pendingLeads[0]);
      }
    } catch (error) {
      console.error('Error fetching calling workspace queue:', error);
      toast.error('Failed to load your assigned dialing queue.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setRemark('');
    setFollowUpDate('');
    setFollowUpTime('10:00');
    setActivityStatus('CONTACTED');
    setIsEditingDetails(false);
    setSelectedServices([]);
    setCustomService('');
  };

  const currentLead = queue[currentIndex];

  const handleSaveAndNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLead) return;

    setSubmitting(true);

    const isPositiveStatus = ['CONTACTED', 'FOLLOW_UP', 'INTERESTED', 'CONVERTED'].includes(activityStatus);
    if (isPositiveStatus) {
      if (selectedServices.length === 0) {
        toast.warning('Please select at least one interested service.');
        setSubmitting(false);
        return;
      }
      if (selectedServices.includes('Other') && !customService.trim()) {
        toast.warning('Please specify details for "Other" service.');
        setSubmitting(false);
        return;
      }
    }

    let nextFollowUpAt: string | undefined = undefined;
    if (activityStatus === 'FOLLOW_UP') {
      if (!followUpDate) {
        toast.warning('Please select a callback date and time.');
        setSubmitting(false);
        return;
      }
      // Always store in IST (+05:30) so the displayed time matches what was entered
      nextFollowUpAt = buildISTIsoString(followUpDate, followUpTime);
    }

    try {
      // 1. Save any edited lead fields
      if (isEditingDetails) {
        await api.put(`/leads/${currentLead._id}`, editForm);
      }

      const servicesPayload = isPositiveStatus
        ? selectedServices.map(s => s === 'Other' ? `Other: ${customService.trim()}` : s)
        : undefined;

      // 2. Post activity — backend updates lead.status in DB
      await api.post('/activities', {
        leadId: currentLead._id,
        activityType: 'CALL',
        status: activityStatus,
        remark,
        nextFollowUpAt,
        interestedServices: servicesPayload
      });

      const leadName = currentLead.businessName || currentLead.displayName;
      const statusCfg = STATUS_CONFIG[activityStatus];
      const statusLabel = statusCfg?.label || activityStatus;

      // 3. Determine queue update strategy
      let updatedQueue: Lead[];
      let newIndex: number;

      if (RETRY_STATUSES.includes(activityStatus)) {
        // Keep lead but update its local status — move to next
        updatedQueue = queue.map((l, idx) =>
          idx === currentIndex ? { 
            ...l, 
            status: activityStatus,
            interestedServices: servicesPayload !== undefined ? servicesPayload : l.interestedServices
          } : l
        );
        newIndex = (currentIndex + 1) % updatedQueue.length;
        toast.success(`Logged "${statusLabel}" for ${leadName}.`);
      } else {
        // Remove lead — it's fully actioned
        updatedQueue = queue.filter((_, idx) => idx !== currentIndex);
        newIndex = currentIndex < updatedQueue.length ? currentIndex : Math.max(0, updatedQueue.length - 1);
        toast.success(`Logged "${statusLabel}" for ${leadName}.`);
      }

      setQueue(updatedQueue);

      if (updatedQueue.length > 0) {
        setCurrentIndex(newIndex);
        setEditForm(updatedQueue[newIndex]);
      } else {
        setCurrentIndex(0);
      }

      // Reset form fields
      setRemark('');
      setFollowUpDate('');
      setFollowUpTime('10:00');
      setActivityStatus('CONTACTED');
      setIsEditingDetails(false);

    } catch (error: any) {
      console.error('Error saving call outcomes:', error);
      toast.error(error.response?.data?.message || 'Error while saving. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (queue.length <= 1) {
      toast.warning('No more leads to skip to.');
      return;
    }
    const nextIndex = (currentIndex + 1) % queue.length;
    setCurrentIndex(nextIndex);
    setEditForm(queue[nextIndex]);
    resetForm();
  };

  const completedCount = Math.max(0, totalLoaded - queue.length);
  const progressPct = totalLoaded > 0 ? Math.round((completedCount / totalLoaded) * 100) : 0;
  const statusCfg = currentLead ? (STATUS_CONFIG[currentLead.status] || { label: currentLead.status, color: 'bg-slate-100 text-slate-600' }) : null;

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
        <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Loading your dialer queue...</p>
      </div>
    );
  }



  // ── Empty queue ──
  if (queue.length === 0) {
    return (
      <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-12 text-center space-y-6 max-w-xl mx-auto">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
          <CheckSquare className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Calling Queue Complete</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            All your assigned leads have been actioned. Your manager will assign new leads when available.
          </p>
          {completedCount > 0 && (
            <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-1.5 inline-block">
              {completedCount} lead{completedCount !== 1 ? 's' : ''} processed this session
            </p>
          )}
        </div>
        <button onClick={fetchActiveQueue}
          className="bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold py-2.5 px-6 rounded-[8px] transition-all min-h-[40px] inline-flex items-center">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Queue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-left font-sans">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">Agent Calling Workspace</h2>
          <p className="text-xs text-slate-500 mt-0.5">Log call outcomes and automatically advance to the next lead.</p>
        </div>
        <div className="bg-navy-950 text-white rounded-[8px] py-1.5 px-4 flex items-center text-xs font-bold shadow-md">
          <Sparkles className="w-4 h-4 mr-2 text-brand-purple-light" />
          Lead {currentIndex + 1} of {queue.length} remaining
        </div>
      </div>

      {/* Progress Bar */}
      {totalLoaded > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Session Progress</span>
            <span>{completedCount} of {totalLoaded} done ({progressPct}%)</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-purple rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Messages replaced by global toast */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Lead Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-6 space-y-6">

            {/* Lead Header */}
            <div className="pb-4 border-b border-slate-100 flex justify-between items-start">
              <div className="space-y-1.5 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{currentLead.businessName || currentLead.displayName}</h3>
                  {currentLead.interestedServices && currentLead.interestedServices.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {currentLead.interestedServices.map((service, index) => (
                        <span key={index} className="inline-flex items-center bg-brand-purple/10 text-brand-purple border border-brand-purple/20 text-[10px] font-semibold px-2 py-0.5 rounded">
                          {getServiceLabel(service)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider inline-block">
                  {currentLead.gmbCategory || 'General Lead'}
                </span>
              </div>
              {statusCfg && (
                <span className={`font-semibold text-[10px] px-2.5 py-1 rounded flex-shrink-0 ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
              )}
            </div>

            {/* Call Panel */}
            {currentLead.mobile ? (
              <div className="bg-purple-50/50 rounded-[12px] border border-purple-100 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Primary Contact</span>
                  <span className="text-xl font-extrabold text-navy-950 font-mono tracking-wide">{currentLead.mobile}</span>
                  {currentLead.customerName && (
                    <p className="text-xs text-slate-500 mt-0.5">Contact: <strong className="text-slate-700">{currentLead.customerName}</strong></p>
                  )}
                </div>
                <a href={`tel:${currentLead.mobile}`}
                  className="bg-brand-purple hover:bg-brand-purple-hover text-white text-sm font-semibold rounded-[8px] px-6 py-3 shadow-lg shadow-brand-purple/20 transition-all flex items-center justify-center w-full sm:w-auto min-h-[44px]">
                  <PhoneCall className="w-5 h-5 mr-2" />
                  Dial Number
                </a>
              </div>
            ) : (
              <div className="bg-red-50 rounded-[12px] border border-red-200 p-5 text-xs">
                <p className="font-bold flex items-center mb-1 text-red-800">
                  <AlertCircle className="w-4 h-4 mr-1.5 text-red-600" />
                  Contact Number Missing
                </p>
                <p className="text-red-700 leading-relaxed">
                  This lead is <strong>INCOMPLETE</strong>. Check their website or Maps listing below to find the contact number, then edit and save it before dialling.
                </p>
              </div>
            )}

            {/* Edit Toggle */}
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="toggleEdit" checked={isEditingDetails}
                onChange={(e) => setIsEditingDetails(e.target.checked)}
                className="rounded text-brand-purple focus:ring-brand-purple" />
              <label htmlFor="toggleEdit" className="text-xs font-bold text-slate-700 cursor-pointer flex items-center">
                <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                Edit lead details inline
              </label>
            </div>

            {/* Edit Form / Static Details */}
            {isEditingDetails ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
                {[
                  { label: 'Contact Name', name: 'customerName', type: 'text' },
                  { label: 'Mobile / Phone', name: 'mobile', type: 'text' },
                  { label: 'Alternate Phone', name: 'alternatePhone', type: 'text' },
                  { label: 'Email Address', name: 'email', type: 'email' },
                  { label: 'Category', name: 'gmbCategory', type: 'text' },
                  { label: 'Website URL', name: 'website', type: 'text' },
                ].map(field => (
                  <div key={field.name}>
                    <label className="block font-bold text-slate-500 mb-1">{field.label}</label>
                    <input type={field.type} name={field.name}
                      value={(editForm as any)[field.name] || ''}
                      onChange={handleEditChange}
                      className="w-full rounded-[8px] border border-slate-300 bg-white py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple text-xs" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">City / Region</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {currentLead.city || '—'}{currentLead.state ? `, ${currentLead.state}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Website</span>
                    {currentLead.website ? (
                      <a href={currentLead.website.startsWith('http') ? currentLead.website : `http://${currentLead.website}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-brand-purple hover:underline truncate max-w-[180px] block">
                        {currentLead.website}
                      </a>
                    ) : <span className="text-slate-400">—</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Sparkles className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Rating</span>
                    <span className="font-semibold text-slate-800">
                      {currentLead.rating ? `${currentLead.rating} / 5 (${currentLead.reviewCount || 0} reviews)` : '—'}
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

            {/* Custom Fields */}
            {currentLead.customFields && Object.keys(currentLead.customFields).length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Spreadsheet Data</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(currentLead.customFields).map(([key, val]) => (
                    <div key={key} className="bg-slate-50 border border-slate-200 rounded p-2 text-xs">
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">{key}</span>
                      <span className="font-mono text-slate-700 truncate block">{String(val) || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External Links */}
            {currentLead.googleMapsUrl && (
              <div className="pt-2 border-t border-slate-100">
                <a href={currentLead.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 min-h-[36px]">
                  <MapPin className="w-4 h-4 mr-1.5 text-red-500" />
                  Open Google Maps Listing
                </a>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Log Outcome */}
        <div className="space-y-4">
          <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-5 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Log Outcome</span>
              <button type="button" onClick={handleSkip}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold flex items-center min-h-[32px]">
                <ArrowRight className="w-3.5 h-3.5 mr-1" />
                Skip Lead
              </button>
            </h4>

            <form onSubmit={handleSaveAndNext} className="space-y-4 text-xs text-left">
              {/* Status Select */}
              <div className="relative" ref={dropdownRef}>
                <label className="block font-bold text-slate-600 mb-1">Call Outcome Status</label>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full bg-white border border-slate-300 rounded-[8px] py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple text-xs flex items-center justify-between shadow-sm hover:border-slate-400 transition-colors cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    {(() => {
                      const selected = STATUS_OPTIONS.find(o => o.value === activityStatus);
                      if (selected) {
                        const Icon = selected.icon;
                        return (
                          <>
                            <Icon className={`w-3.5 h-3.5 ${selected.iconColor}`} />
                            <span className="font-medium text-slate-700">{selected.label}</span>
                          </>
                        );
                      }
                      return <span className="text-slate-400">Select Status</span>;
                    })()}
                  </span>
                  {dropdownOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-[12px] shadow-xl py-1 max-h-60 overflow-y-auto">
                    {STATUS_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const isSelected = activityStatus === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setActivityStatus(option.value);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2.5 transition-colors cursor-pointer ${
                            isSelected ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <span className={`p-1 rounded-[6px] ${option.bgColor}`}>
                            <Icon className={`w-3.5 h-3.5 ${option.iconColor}`} />
                          </span>
                          <span className="text-slate-700">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Interested Services */}
              {['CONTACTED', 'FOLLOW_UP', 'INTERESTED', 'CONVERTED'].includes(activityStatus) && (
                <MultiSelect
                  selectedValues={selectedServices}
                  onChange={setSelectedServices}
                  customValue={customService}
                  onCustomChange={setCustomService}
                  required={true}
                />
              )}

              {/* Callback Date/Time */}
              {activityStatus === 'FOLLOW_UP' && (
                <div className="grid grid-cols-2 gap-2 bg-amber-50 p-3 rounded-[8px] border border-amber-200">
                  <div>
                    <label className="block font-bold text-amber-900 mb-1">Callback Date</label>
                    <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full rounded-[6px] border border-slate-300 bg-white py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-brand-purple text-xs"
                      required />
                  </div>
                  <div>
                    <label className="block font-bold text-amber-900 mb-1">Callback Time</label>
                    <input type="time" value={followUpTime} onChange={(e) => setFollowUpTime(e.target.value)}
                      className="w-full rounded-[6px] border border-slate-300 bg-white py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-brand-purple text-xs"
                      required />
                  </div>
                  <p className="col-span-2 text-[10px] text-amber-700 font-medium flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Time is saved as Indian Standard Time (IST)
                  </p>
                </div>
              )}

              {/* Remarks */}
              <div>
                <label className="block font-bold text-slate-600 mb-1">Call Notes / Remarks <span className="text-red-500">*</span></label>
                <textarea value={remark} onChange={(e) => setRemark(e.target.value)}
                  placeholder="Enter call notes, prospect response, or any relevant details..."
                  rows={4}
                  className="w-full rounded-[8px] border border-slate-300 bg-white py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple text-xs leading-relaxed"
                  required />
              </div>

              {/* Submit */}
              <button type="submit" disabled={submitting}
                className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white font-bold py-3 rounded-[8px] shadow-lg shadow-brand-purple/20 transition-all disabled:opacity-50 min-h-[44px] flex items-center justify-center text-sm">
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Submit &amp; Log Next Lead</span>
                    <ChevronRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Refresh from server */}
          <button onClick={fetchActiveQueue}
            className="w-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 text-xs font-semibold py-2 px-4 rounded-[8px] flex items-center justify-center min-h-[36px] transition-all">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Sync Queue from Server
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallingWorkspace;
