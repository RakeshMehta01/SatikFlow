import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Phone,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  AlertCircle,
  FileCheck2,
  FileQuestion,
  UserCheck
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import usePageTitle from '../hooks/usePageTitle';

interface AgentPerformance {
  agentId: string;
  name: string;
  email: string;
  totalAssigned: number;
  callsDoneToday: number;
  totalCalls: number;
  interestedCount: number;
  convertedCount: number;
}

interface DashboardStats {
  totalLeads: number;
  assignedLeads: number;
  unassignedLeads: number;
  incompleteLeads: number;
  callsDoneToday: number;
  followUpsDueToday: number;
  interestedLeads: number;
  convertedLeads: number;
  agentPerformance: AgentPerformance[];
}

export const ManagerDashboard: React.FC = () => {
  usePageTitle('Manager Dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/manager');
        setStats(res.data);
      } catch (err: any) {
        console.error('Error fetching manager dashboard stats:', err);
        setError('Failed to load dashboard metrics. Check if backend is active.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
        <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Aggregating dashboard analytics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-[12px] flex items-center space-x-3">
        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
        <div>
          <h4 className="font-bold">Database Sync Failed</h4>
          <p className="text-xs text-red-600 mt-0.5">{error || 'Could not fetch CRM statistics'}</p>
        </div>
      </div>
    );
  }

  // Prepping chart data
  const chartData = stats.agentPerformance.map(agent => ({
    name: agent.name.split(' ')[0], // First name
    'Calls Today': agent.callsDoneToday,
    'Total Calls': agent.totalCalls,
    'Conversions': agent.convertedCount
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">SatikFlow CRM Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time oversight of calling agents, lead mappings & conversion pipelines.</p>
        </div>
        <div className="bg-brand-purple/10 text-brand-purple border border-brand-purple/20 px-3 py-1.5 rounded-[8px] flex items-center text-xs font-semibold">
          <Sparkles className="w-4 h-4 mr-1.5" />
          Manager Workspace
        </div>
      </div>

      {/* Row 1: Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Leads</span>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Layers className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.totalLeads}</p>
          <div className="text-[10px] text-slate-400 font-medium">Imported from GMB / Files</div>
        </div>

        {/* Assigned Leads */}
        <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Leads</span>
            <div className="p-2 bg-purple-50 rounded-lg text-brand-purple"><UserCheck className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.assignedLeads}</p>
          <span className="text-[10px] bg-purple-100 text-brand-purple px-2 py-0.5 rounded font-bold">
            {stats.totalLeads > 0 ? Math.round((stats.assignedLeads / stats.totalLeads) * 100) : 0}% Allocated
          </span>
        </div>

        {/* Unassigned Leads */}
        <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unassigned</span>
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><FileQuestion className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.unassignedLeads}</p>
          <div className="text-[10px] text-slate-400 font-medium">Pending queue allocation</div>
        </div>

        {/* Incomplete Leads */}
        <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Incomplete Leads</span>
            <div className="p-2 bg-red-50 rounded-lg text-red-600"><AlertCircle className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.incompleteLeads}</p>
          <div className="text-[10px] text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded inline-block">Missing mobile / contact info</div>
        </div>
      </div>

      {/* Row 2: Activities Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calls Done Today */}
        <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calls Today</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Phone className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.callsDoneToday}</p>
          <div className="text-[10px] text-slate-400 font-medium">Completed by agents today</div>
        </div>

        {/* Followups due today */}
        <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Follow-Ups Today</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Calendar className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.followUpsDueToday}</p>
          <div className="text-[10px] text-slate-400 font-medium">Callbacks scheduled for today</div>
        </div>

        {/* Interested Leads */}
        <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interested Leads</span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.interestedLeads}</p>
          <div className="text-[10px] text-slate-400 font-medium">Warm prospects waiting closure</div>
        </div>

        {/* Converted Leads */}
        <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Converted Leads</span>
            <div className="p-2 bg-green-50 rounded-lg text-green-600"><FileCheck2 className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.convertedLeads}</p>
          <div className="text-[10px] text-slate-400 font-medium">Closed deals successfully won</div>
        </div>
      </div>

      {/* Row 3: Graph and Table Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call performance charts */}
        <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-slate-900">Agent Calling Performance</h4>
              <p className="text-[10px] text-slate-500">Comparing call volume and conversions across agents.</p>
            </div>
          </div>

          <div className="h-64 mt-4 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={11} stroke="#64748b" tickLine={false} />
                  <YAxis fontSize={11} stroke="#64748b" tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#c084fc' }}
                  />
                  <Bar dataKey="Calls Today" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Total Calls" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Conversions" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">No active agent performance data available yet</div>
            )}
          </div>
        </div>

        {/* Status Breakdown Sidebar (Quick overview list) */}
        <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900">CRM Conversion Health</h4>
            <p className="text-[10px] text-slate-500">Summary of warm leads and conversions.</p>
          </div>
          <div className="space-y-4 my-4 flex-1 flex flex-col justify-center">
            {/* Conversion rate */}
            <div className="text-center pb-4 border-b border-slate-100">
              <span className="text-slate-400 block text-xs font-semibold">Total Conversion Rate</span>
              <span className="text-4xl font-extrabold text-brand-purple">
                {stats.totalLeads > 0 ? Math.round((stats.convertedLeads / stats.totalLeads) * 100) : 0}%
              </span>
            </div>
            {/* Mini stats list */}
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Interested rate</span>
                <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {stats.totalLeads > 0 ? Math.round((stats.interestedLeads / stats.totalLeads) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Incomplete rate</span>
                <span className="font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                  {stats.totalLeads > 0 ? Math.round((stats.incompleteLeads / stats.totalLeads) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Agent Performance Table */}
      <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h4 className="font-bold text-slate-900">Team Activity Breakdown</h4>
          <p className="text-xs text-slate-500 mt-0.5">Calling volume and active lead pipeline ownership by calling agent.</p>
        </div>

        <div className="overflow-x-auto">
          {stats.agentPerformance.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                  <th className="p-4">Agent Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4 text-center">Assigned Leads</th>
                  <th className="p-4 text-center">Calls Done Today</th>
                  <th className="p-4 text-center">Total Lifetime Calls</th>
                  <th className="p-4 text-center">Interested Leads</th>
                  <th className="p-4 text-center">Converted Leads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stats.agentPerformance.map((agent) => (
                  <tr key={agent.agentId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{agent.name}</td>
                    <td className="p-4 text-slate-500">{agent.email}</td>
                    <td className="p-4 text-center font-semibold">{agent.totalAssigned}</td>
                    <td className="p-4 text-center text-brand-purple font-semibold">{agent.callsDoneToday}</td>
                    <td className="p-4 text-center font-medium">{agent.totalCalls}</td>
                    <td className="p-4 text-center text-indigo-700 font-semibold">{agent.interestedCount}</td>
                    <td className="p-4 text-center text-emerald-600 font-bold">{agent.convertedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No agents registered. Go to Users page to create calling agent profiles.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
