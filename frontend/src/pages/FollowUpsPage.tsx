import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Calendar,
  Phone,
  Eye,
  AlertCircle,
  CheckCircle,
  Layers
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

interface Lead {
  _id: string;
  displayName: string;
  businessName?: string;
  mobile?: string;
  city?: string;
  gmbCategory?: string;
  status: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  nextFollowUpAt: string;
}

interface Agent {
  id: string;
  name: string;
}

export const FollowUpsPage: React.FC = () => {
  usePageTitle('Follow-Ups');
  const { user } = useAuth();

  // Agent States: split lists
  const [agentFollowUps, setAgentFollowUps] = useState<{
    today: Lead[];
    overdue: Lead[];
    upcoming: Lead[];
  }>({ today: [], overdue: [], upcoming: [] });

  // Manager States: single list with query filters
  const [managerFollowUps, setManagerFollowUps] = useState<Lead[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'today' | 'overdue' | 'upcoming' | 'all'>('today');
  const [agents, setAgents] = useState<Agent[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<'today' | 'overdue' | 'upcoming'>('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFollowUps();
    if (user?.role === 'MANAGER') {
      fetchAgents();
    }
  }, [user, selectedAgent, selectedFilter]);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      setError(null);

      if (user?.role === 'AGENT') {
        const res = await api.get('/follow-ups/my');
        setAgentFollowUps(res.data);
      } else {
        const params: any = { filter: selectedFilter };
        if (selectedAgent) params.agentId = selectedAgent;
        const res = await api.get('/follow-ups', { params });
        setManagerFollowUps(res.data);
      }
    } catch (err: any) {
      console.error('Error fetching follow-ups:', err);
      setError('Could not load scheduled follow-up alerts from database.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await api.get('/users');
      setAgents(res.data.filter((u: any) => u.role === 'AGENT').map((u: any) => ({
        id: u._id || u.id,
        name: u.name
      })));
    } catch (err) {
      console.warn('Could not load agents dropdown list', err);
    }
  };

  // Agent local list selectors based on activeTab
  const getAgentListForActiveTab = () => {
    if (activeTab === 'today') return agentFollowUps.today;
    if (activeTab === 'overdue') return agentFollowUps.overdue;
    return agentFollowUps.upcoming;
  };

  const activeAgentLeads = getAgentListForActiveTab();

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">Follow-Up Call Alerts</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track and execute scheduled callbacks, keeping lead relationships warm.</p>
        </div>
        <div className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-[8px] flex items-center text-xs font-semibold">
          <Calendar className="w-4 h-4 mr-1.5" />
          {user?.role === 'MANAGER' ? 'Master Scheduler' : 'My Schedule'}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-[12px] flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-xs font-semibold">{error}</span>
        </div>
      )}

      {/* --- AGENT VIEW: Segmented Tabs (Today, Overdue, Upcoming) --- */}
      {user?.role === 'AGENT' && (
        <div className="space-y-4">
          {/* Tab buttons */}
          <div className="flex border-b border-slate-200 text-xs font-bold">
            {(['today', 'overdue', 'upcoming'] as const).map(tab => {
              const count =
                tab === 'today' ? agentFollowUps.today.length :
                tab === 'overdue' ? agentFollowUps.overdue.length :
                agentFollowUps.upcoming.length;
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-6 border-b-2 transition-all flex items-center min-h-[44px] ${
                    activeTab === tab
                      ? 'border-brand-purple text-brand-purple'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span className="capitalize">{tab}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab
                      ? 'bg-purple-100 text-brand-purple'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tab content list */}
          <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 font-medium">Fetching callbacks list...</div>
            ) : activeAgentLeads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                      <th className="p-4">Business / Customer Name</th>
                      <th className="p-4">Mobile</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Schedule Time</th>
                      <th className="p-4 text-center">Dial Dialer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {activeAgentLeads.map(lead => (
                      <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">
                          <div>
                            <p>{lead.displayName}</p>
                            {lead.businessName && lead.businessName !== lead.displayName && (
                              <p className="text-[10px] text-slate-400 font-normal truncate max-w-[180px]">{lead.businessName}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-mono font-medium">{lead.mobile || '—'}</td>
                        <td className="p-4">{lead.gmbCategory || '—'}</td>
                        <td className="p-4 font-semibold text-amber-700">
                          {new Date(lead.nextFollowUpAt).toLocaleDateString()} {new Date(lead.nextFollowUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4 text-center">
                          <Link
                            to={`/leads/${lead._id}`}
                            className="inline-flex items-center text-xs font-semibold text-brand-purple hover:text-brand-purple-hover bg-brand-purple/10 hover:bg-brand-purple/20 px-2.5 py-1.5 rounded-[6px] transition-all min-h-[32px]"
                          >
                            <Phone className="w-3.5 h-3.5 mr-1" />
                            Open profile
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">
                <CheckCircle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-xs">No follow-up calls scheduled under this category.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MANAGER VIEW: Master Schedule & Filter Queries --- */}
      {user?.role === 'MANAGER' && (
        <div className="space-y-4">
          {/* Query Filter Toolbar */}
          <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Time segment filter</label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="w-full bg-white border border-slate-350 rounded-[8px] py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
              >
                <option value="today">Today's Follow-Ups</option>
                <option value="overdue">Overdue Follow-Ups</option>
                <option value="upcoming">Upcoming Future Follow-Ups</option>
                <option value="all">All Scheduled Callbacks</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Assigned Agent</label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full bg-white border border-slate-355 rounded-[8px] py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
              >
                <option value="">All Calling Agents</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end justify-center bg-slate-50 border border-slate-200 rounded-[8px] p-2 text-slate-700 font-bold">
              Total Found: {managerFollowUps.length} follow-ups
            </div>
          </div>

          {/* Master scheduled results */}
          <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 font-medium">Fetching master callbacks...</div>
            ) : managerFollowUps.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                      <th className="p-4">Business / Customer Name</th>
                      <th className="p-4">Mobile</th>
                      <th className="p-4">Assigned Agent</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Schedule Time</th>
                      <th className="p-4 text-center">Inspect Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {managerFollowUps.map(lead => (
                      <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">
                          <div>
                            <p>{lead.displayName}</p>
                            {lead.businessName && lead.businessName !== lead.displayName && (
                              <p className="text-[10px] text-slate-400 font-normal truncate max-w-[180px]">{lead.businessName}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-mono font-medium">{lead.mobile || '—'}</td>
                        <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">
                          {lead.assignedTo?.name || <span className="text-slate-400 italic font-normal">Unassigned</span>}
                        </td>
                        <td className="p-4">{lead.gmbCategory || '—'}</td>
                        <td className="p-4 font-bold text-amber-700">
                          {new Date(lead.nextFollowUpAt).toLocaleDateString()} {new Date(lead.nextFollowUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4 text-center">
                          <Link
                            to={`/leads/${lead._id}`}
                            className="inline-flex items-center text-xs font-semibold text-brand-purple hover:text-brand-purple-hover bg-brand-purple/10 hover:bg-brand-purple/20 px-2.5 py-1.5 rounded-[6px] transition-all min-h-[32px]"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View lead
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs">
                <Layers className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                No follow-up calls found matching the query filters.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpsPage;
