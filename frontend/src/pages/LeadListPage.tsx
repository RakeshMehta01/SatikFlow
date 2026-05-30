import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Search,
  Eye,
  Layers,
  Plus
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import { formatDate, formatDateTime } from '../utils/dateFormat';
import { toast } from '../components/Toast';
import { getServiceLabel, SERVICE_CATEGORIES } from '../components/MultiSelect';

interface Lead {
  _id: string;
  displayName: string;
  businessName?: string;
  customerName?: string;
  mobile?: string;
  city?: string;
  gmbCategory?: string;
  source?: string;
  status: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  lastActivityAt?: string;
  nextFollowUpAt?: string;
  createdAt: string;
  interestedServices?: string[];
}

interface Agent {
  id: string;
  name: string;
  email: string;
}

export const LeadListPage: React.FC = () => {
  usePageTitle('Leads');
  const { user } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [incompleteFilter, setIncompleteFilter] = useState('false');
  const [followUpFilter, setFollowUpFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  useEffect(() => {
    fetchLeads();
    if (user?.role === 'MANAGER') {
      fetchAgents();
    }
  }, [statusFilter, agentFilter, incompleteFilter, followUpFilter, serviceFilter, user]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (agentFilter) params.agentId = agentFilter;
      if (incompleteFilter === 'true') params.incomplete = 'true';
      if (followUpFilter) params.followUpDate = followUpFilter;
      if (serviceFilter) params.interestedService = serviceFilter;

      const res = await api.get('/leads', { params });
      setLeads(res.data);
    } catch (err: any) {
      console.error('Error fetching leads:', err);
      toast.error('Could not retrieve leads from CRM directory.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await api.get('/users');
      setAgents(res.data.filter((u: any) => u.role === 'AGENT').map((u: any) => ({
        id: u._id || u.id,
        name: u.name,
        email: u.email
      })));
    } catch (err) {
      console.warn('Could not fetch agents for dropdown list', err);
    }
  };

  // Local filtering for quick search keyword response
  const filteredLeads = leads.filter(lead => {
    if (search === '') return true;
    const term = search.toLowerCase();
    return (
      lead.displayName.toLowerCase().includes(term) ||
      (lead.businessName && lead.businessName.toLowerCase().includes(term)) ||
      (lead.customerName && lead.customerName.toLowerCase().includes(term)) ||
      (lead.mobile && lead.mobile.includes(term)) ||
      (lead.city && lead.city.toLowerCase().includes(term)) ||
      (lead.gmbCategory && lead.gmbCategory.toLowerCase().includes(term)) ||
      (lead.interestedServices && lead.interestedServices.some(s => getServiceLabel(s).toLowerCase().includes(term)))
    );
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
            {user?.role === 'MANAGER' ? 'Master CRM Directory' : 'My Assigned Leads'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {user?.role === 'MANAGER'
              ? 'Complete list of all imported prospect profiles.'
              : 'Directory of your active calling allocations, follow-up schedules & outcomes.'}
          </p>
        </div>
        
        {user?.role === 'MANAGER' && (
          <Link
            to="/manager/upload-leads"
            className="bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold py-2 px-4 rounded-[8px] transition-all shadow-md shadow-brand-purple/20 min-h-[38px] flex items-center"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Import Leads
          </Link>
        )}
      </div>

      {/* Messages replaced by global toast */}

      {/* Filters Toolbar */}
      <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keyword..."
            className="pl-9 w-full rounded-[8px] border border-slate-350 bg-white py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full bg-white border border-slate-350 rounded-[8px] py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="INCOMPLETE">Incomplete</option>
          <option value="NOT_PICKED">Not Picked</option>
          <option value="BUSY">Busy</option>
          <option value="CONTACTED">Contacted</option>
          <option value="FOLLOW_UP">Follow Up</option>
          <option value="INTERESTED">Interested</option>
          <option value="CONVERTED">Converted</option>
          <option value="NOT_INTERESTED">Not Interested</option>
          <option value="INVALID_NUMBER">Invalid Number</option>
        </select>

        {/* Service filter */}
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="w-full bg-white border border-slate-350 rounded-[8px] py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
        >
          <option value="">All Services</option>
          {SERVICE_CATEGORIES.flatMap(c => c.options).map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Manager-only: Agent Filter */}
        {user?.role === 'MANAGER' ? (
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="w-full bg-white border border-slate-350 rounded-[8px] py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
          >
            <option value="">All Agents</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        ) : (
          <div className="hidden lg:block w-full"></div>
        )}

        {/* Incomplete filter */}
        <select
          value={incompleteFilter}
          onChange={(e) => setIncompleteFilter(e.target.value)}
          className="w-full bg-white border border-slate-350 rounded-[8px] py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
        >
          <option value="false">All Lead Details</option>
          <option value="true">Incomplete Leads Only</option>
        </select>

        {/* Follow-up date filter */}
        <select
          value={followUpFilter}
          onChange={(e) => setFollowUpFilter(e.target.value)}
          className="w-full bg-white border border-slate-350 rounded-[8px] py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
        >
          <option value="">Any Follow-up Date</option>
          <option value="today">Follow-up Today</option>
          <option value="overdue">Follow-up Overdue</option>
          <option value="upcoming">Upcoming Follow-up</option>
        </select>
      </div>

      {/* Leads Table Card */}
      <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">Querying lead profiles...</div>
          ) : filteredLeads.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                  <th className="p-4">Business / Customer Name</th>
                  <th className="p-4">Mobile</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Source</th>
                  {user?.role === 'MANAGER' && <th className="p-4">Assigned Agent</th>}
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Activity</th>
                  <th className="p-4">Next Follow-up</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900">{lead.displayName}</p>
                        {lead.businessName && lead.businessName !== lead.displayName && (
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{lead.businessName}</p>
                        )}
                        {lead.interestedServices && lead.interestedServices.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5 max-w-[200px]">
                            {lead.interestedServices.map((service, idx) => (
                              <span key={idx} className="bg-brand-purple/10 text-brand-purple border border-brand-purple/20 text-[9px] font-bold px-1.5 py-0 rounded">
                                {getServiceLabel(service)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-medium text-slate-800">
                      {lead.mobile || <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded font-sans text-[10px] font-bold">INCOMPLETE</span>}
                    </td>
                    <td className="p-4 capitalize">{lead.city || '—'}</td>
                    <td className="p-4 truncate max-w-[130px]" title={lead.gmbCategory}>{lead.gmbCategory || '—'}</td>
                    <td className="p-4 text-[10px] font-bold text-slate-500">{lead.source}</td>
                    
                    {user?.role === 'MANAGER' && (
                      <td className="p-4">
                        {lead.assignedTo ? (
                          <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-[4px]">
                            {lead.assignedTo.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                    )}
                    
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        lead.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'INCOMPLETE' ? 'bg-red-100 text-red-800' :
                        lead.status === 'NOT_PICKED' ? 'bg-orange-100 text-orange-800' :
                        lead.status === 'BUSY' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'CONTACTED' ? 'bg-teal-100 text-teal-800' :
                        lead.status === 'FOLLOW_UP' ? 'bg-amber-100 text-amber-800' :
                        lead.status === 'INTERESTED' ? 'bg-indigo-100 text-indigo-800' :
                        lead.status === 'CONVERTED' ? 'bg-green-100 text-green-800' :
                        lead.status === 'NOT_INTERESTED' ? 'bg-slate-100 text-slate-600' :
                        lead.status === 'INVALID_NUMBER' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {lead.lastActivityAt ? formatDate(lead.lastActivityAt) : '—'}
                    </td>
                    <td className="p-4 text-slate-500">
                      {lead.nextFollowUpAt ? (
                        <span className="text-amber-700 font-medium">
                          {formatDateTime(lead.nextFollowUpAt)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="p-4 text-center">
                      <Link
                        to={`/leads/${lead._id}`}
                        className="inline-flex items-center text-xs font-semibold text-brand-purple hover:text-brand-purple-hover bg-brand-purple/10 hover:bg-brand-purple/20 px-2.5 py-1.5 rounded-[6px] transition-all min-h-[32px]"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <Layers className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-xs">No lead records found in this view.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadListPage;
