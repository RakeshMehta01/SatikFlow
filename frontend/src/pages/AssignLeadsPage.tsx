import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Search,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Users,
  Layers
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

interface Agent {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
}

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
  createdAt: string;
}

export const AssignLeadsPage: React.FC = () => {
  usePageTitle('Assign Leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'unassigned' | 'assigned'>('unassigned');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  
  // Loading & statuses
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchLeadsAndAgents();
  }, []);

  const fetchLeadsAndAgents = async () => {
    try {
      setLoading(true);
      const [leadsRes, usersRes] = await Promise.all([
        api.get('/leads'),
        api.get('/users')
      ]);

      setLeads(leadsRes.data);
      // Filter only active agents and map database fields to Agent interface
      setAgents(
        usersRes.data
          .filter((u: any) => u.role === 'AGENT' && u.status === 'ACTIVE')
          .map((u: any) => ({
            id: u._id || u.id,
            name: u.name,
            email: u.email,
            status: u.status,
            role: u.role
          }))
      );
    } catch (error) {
      console.error('Error fetching leads/agents:', error);
      setErrorMessage('Failed to connect to database. Make sure backend is active.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeadIds(filteredLeads.map(l => l._id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleSelectLead = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(prev => [...prev, id]);
    } else {
      setSelectedLeadIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleBulkAssign = async () => {
    if (selectedLeadIds.length === 0) {
      setErrorMessage('Please select at least one lead to assign');
      return;
    }

    setAssigning(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await api.patch('/leads/bulk-assign', {
        leadIds: selectedLeadIds,
        agentId: selectedAgentId || null // If empty, it unassigns
      });

      const count = selectedLeadIds.length;
      const agentName = selectedAgentId
        ? agents.find(a => a.id === selectedAgentId)?.name || 'Agent'
        : 'Unassigned';

      setSuccessMessage(`Successfully updated ${count} leads assignment to: ${agentName}`);
      setSelectedLeadIds([]);
      fetchLeadsAndAgents(); // Refresh tables
    } catch (error: any) {
      console.error('Bulk assignment error:', error);
      setErrorMessage(error.response?.data?.message || 'Error occurred during bulk assignment');
    } finally {
      setAssigning(false);
    }
  };

  // Local filtering logic
  const filteredLeads = leads.filter(lead => {
    // 1. Text search
    const matchesSearch =
      search === '' ||
      lead.displayName.toLowerCase().includes(search.toLowerCase()) ||
      (lead.businessName && lead.businessName.toLowerCase().includes(search.toLowerCase())) ||
      (lead.mobile && lead.mobile.includes(search)) ||
      (lead.city && lead.city.toLowerCase().includes(search.toLowerCase())) ||
      (lead.gmbCategory && lead.gmbCategory.toLowerCase().includes(search.toLowerCase()));

    // 2. Status filter
    const matchesStatus = statusFilter === '' || lead.status === statusFilter;

    // 3. Assignment filter
    const matchesAssignment =
      assignmentFilter === 'all' ||
      (assignmentFilter === 'unassigned' && !lead.assignedTo) ||
      (assignmentFilter === 'assigned' && !!lead.assignedTo);

    return matchesSearch && matchesStatus && matchesAssignment;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">Assign & Reassign Leads</h2>
          <p className="text-xs text-slate-500 mt-0.5">Filter the unassigned lead pool, select records and route them to agents.</p>
        </div>
        <div className="bg-brand-purple/10 text-brand-purple border border-brand-purple/20 px-3 py-1.5 rounded-[8px] flex items-center text-xs font-semibold">
          <UserPlus className="w-4 h-4 mr-1.5" />
          Lead Allocation
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-emerald-700 p-4 rounded-[12px] flex items-center space-x-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-xs font-semibold">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-[12px] flex items-center space-x-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-xs font-semibold">{errorMessage}</p>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, mobile, city..."
            className="pl-9 w-full rounded-[8px] border border-slate-350 bg-white py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple"
          />
        </div>

        {/* Assignment filter */}
        <select
          value={assignmentFilter}
          onChange={(e) => setAssignmentFilter(e.target.value as any)}
          className="w-full bg-white border border-slate-350 rounded-[8px] py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
        >
          <option value="unassigned">Unassigned Leads</option>
          <option value="assigned">Assigned Leads</option>
          <option value="all">All Leads</option>
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full bg-white border border-slate-350 rounded-[8px] py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="INCOMPLETE">Incomplete</option>
          <option value="FOLLOW_UP">Follow Up</option>
          <option value="INTERESTED">Interested</option>
          <option value="CONVERTED">Converted</option>
        </select>

        {/* Selected count info */}
        <div className="bg-slate-50 border border-slate-200 rounded-[8px] p-2 flex items-center justify-center font-bold text-slate-700">
          Selected: {selectedLeadIds.length} leads
        </div>
      </div>

      {/* Assignment Actions Panel */}
      <div className="bg-slate-100 border border-slate-200 rounded-[12px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-slate-500" />
          <span className="font-bold text-slate-700">Route Selected Leads:</span>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="bg-white border border-slate-350 rounded-[8px] py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple w-full sm:w-48"
          >
            <option value="">-- Unassign / Free Lead --</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
          
          <button
            onClick={handleBulkAssign}
            disabled={assigning || selectedLeadIds.length === 0}
            className="bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold py-2 px-4 rounded-[8px] transition-all disabled:opacity-50 min-h-[38px] flex items-center justify-center whitespace-nowrap"
          >
            {assigning ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Apply Assignment'
            )}
          </button>
        </div>
      </div>

      {/* Table Leads List */}
      <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">Querying lead pool...</div>
          ) : filteredLeads.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length}
                      className="rounded text-brand-purple focus:ring-brand-purple"
                    />
                  </th>
                  <th className="p-4">Lead Name / Business</th>
                  <th className="p-4">Mobile</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Assigned Agent</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLeads.map((lead) => {
                  const isChecked = selectedLeadIds.includes(lead._id);
                  return (
                    <tr key={lead._id} className={`hover:bg-slate-50 transition-colors ${isChecked ? 'bg-purple-50/20' : ''}`}>
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectLead(lead._id, e.target.checked)}
                          className="rounded text-brand-purple focus:ring-brand-purple"
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-slate-900">{lead.displayName}</p>
                          {lead.businessName && lead.businessName !== lead.displayName && (
                            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{lead.businessName}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono font-medium text-slate-800">{lead.mobile || <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded font-sans text-[10px] font-bold">INCOMPLETE</span>}</td>
                      <td className="p-4 capitalize">{lead.city || '—'}</td>
                      <td className="p-4 truncate max-w-[150px]" title={lead.gmbCategory}>{lead.gmbCategory || '—'}</td>
                      <td className="p-4">
                        {lead.assignedTo ? (
                          <span className="font-semibold text-slate-950 bg-slate-100 px-2.5 py-1 rounded-[6px]">
                            {lead.assignedTo.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          lead.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'INCOMPLETE' ? 'bg-red-100 text-red-800' :
                          lead.status === 'FOLLOW_UP' ? 'bg-amber-100 text-amber-800' :
                          lead.status === 'INTERESTED' ? 'bg-indigo-100 text-indigo-800' :
                          lead.status === 'CONVERTED' ? 'bg-green-100 text-green-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-4 text-[10px] font-bold text-slate-500">{lead.source}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <Layers className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-xs">No leads matching the active filters were found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignLeadsPage;
