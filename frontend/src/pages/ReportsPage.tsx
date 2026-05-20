import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  AlertTriangle,
  Layers,
  AlertCircle
} from 'lucide-react';

interface ManagerReportStats {
  leadsByStatus: Record<string, number>;
  pendingFollowUps: number;
  missedFollowUps: number;
  incompleteLeadsCount: number;
  agentBreakdown: {
    agentId: string;
    name: string;
    email: string;
    status: string;
    callsDone: number;
    interestedCount: number;
    convertedCount: number;
    incompleteAssigned: number;
  }[];
}

interface AgentReportStats {
  callsDone: number;
  followUps: number;
  interestedCount: number;
  convertedCount: number;
  incompleteAssigned: number;
  leadsByStatus: Record<string, number>;
}

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [managerData, setManagerData] = useState<ManagerReportStats | null>(null);
  const [agentData, setAgentData] = useState<AgentReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [user]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (user?.role === 'MANAGER') {
        const res = await api.get('/reports/manager');
        setManagerData(res.data);
      } else {
        const res = await api.get('/reports/agent');
        setAgentData(res.data);
      }
    } catch (err: any) {
      console.error('Error fetching reports data:', err);
      setError('Failed to fetch CRM reporting summary.');
    } finally {
      setLoading(false);
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    NEW: '#3b82f6',
    INCOMPLETE: '#ef4444',
    NOT_PICKED: '#64748b',
    BUSY: '#f59e0b',
    CONTACTED: '#a855f7',
    FOLLOW_UP: '#f59e0b',
    INTERESTED: '#6366f1',
    CONVERTED: '#10b981',
    NOT_INTERESTED: '#94a3b8',
    INVALID_NUMBER: '#dc2626'
  };

  const getPieChartData = (leadsByStatus: Record<string, number>) => {
    return Object.entries(leadsByStatus)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        name: key,
        value,
        color: STATUS_COLORS[key] || '#94a3b8'
      }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
        <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Compiling reports metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-[12px] flex items-center space-x-3 text-left">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <span className="text-xs font-semibold">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">CRM Analytics & Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">Statistical insights, status distribution and team efficiency logs.</p>
        </div>
        <div className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-3 py-1.5 rounded-[8px] flex items-center text-xs font-semibold">
          <TrendingUp className="w-4 h-4 mr-1.5" />
          Analytics Center
        </div>
      </div>

      {/* --- MANAGER REPORTS VIEW --- */}
      {user?.role === 'MANAGER' && managerData && (
        <div className="space-y-6">
          {/* Row 1: Follow up warning cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Missed Callbacks</span>
                <span className="text-3xl font-extrabold text-red-600 mt-1 block">{managerData.missedFollowUps}</span>
                <span className="text-[9px] text-red-400 font-medium bg-red-50 px-1.5 py-0.5 rounded">Overdue - Action needed</span>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-full"><AlertTriangle className="w-5 h-5" /></div>
            </div>

            <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Pending Callbacks</span>
                <span className="text-3xl font-extrabold text-amber-600 mt-1 block">{managerData.pendingFollowUps}</span>
                <span className="text-[9px] text-slate-400 font-medium">Scheduled for future date</span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-full"><Calendar className="w-5 h-5" /></div>
            </div>

            <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Incomplete CRM Profiles</span>
                <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{managerData.incompleteLeadsCount}</span>
                <span className="text-[9px] text-slate-400 font-medium">Leads missing phone info</span>
              </div>
              <div className="p-3 bg-slate-100 text-slate-600 rounded-full"><Layers className="w-5 h-5" /></div>
            </div>
          </div>

          {/* Row 2: Status Pie Chart Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pie Chart Card */}
            <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Leads Distribution by Status</h4>
                <p className="text-[10px] text-slate-500">Visual mapping of active lead states in the CRM.</p>
              </div>
              
              <div className="h-64 mt-4 flex items-center justify-center">
                {getPieChartData(managerData.leadsByStatus).length > 0 ? (
                  <div className="w-full h-full flex flex-col sm:flex-row items-center justify-around">
                    <div className="w-48 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getPieChartData(managerData.leadsByStatus)}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {getPieChartData(managerData.leadsByStatus).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Chart Legend */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
                      {getPieChartData(managerData.leadsByStatus).map(item => (
                        <div key={item.name} className="flex items-center space-x-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="font-medium truncate max-w-[120px]">{item.name}: <strong>{item.value}</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">No lead data to display charts</span>
                )}
              </div>
            </div>

            {/* Manager conversion totals */}
            <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm flex flex-col justify-between text-xs text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Target Performance Rates</h4>
                <p className="text-[10px] text-slate-500">Conversion percentages against master records.</p>
              </div>
              <div className="space-y-4 my-4 flex-1 flex flex-col justify-center">
                {/* Dial Ratio */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Warm Leads Ratio</span>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {Object.values(managerData.leadsByStatus).reduce((a, b) => a + b, 0) > 0
                      ? Math.round(((managerData.leadsByStatus['INTERESTED'] || 0) / Object.values(managerData.leadsByStatus).reduce((a, b) => a + b, 0)) * 100)
                      : 0}%
                  </span>
                </div>
                {/* Converted Ratio */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Sales Closed Ratio</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {Object.values(managerData.leadsByStatus).reduce((a, b) => a + b, 0) > 0
                      ? Math.round(((managerData.leadsByStatus['CONVERTED'] || 0) / Object.values(managerData.leadsByStatus).reduce((a, b) => a + b, 0)) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Agent Breakdown Leaderboard */}
          <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm">Agent Performance Leaderboard</h4>
              <p className="text-xs text-slate-500 mt-0.5">Calling dials, interested rates, and sales conversions by agent user.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                    <th className="p-4">Agent Name</th>
                    <th className="p-4 text-center">Dials Logged</th>
                    <th className="p-4 text-center text-indigo-700">Interested Leads</th>
                    <th className="p-4 text-center text-emerald-600">Converted Leads</th>
                    <th className="p-4 text-center text-red-500">Incomplete Assigned</th>
                    <th className="p-4 text-center">Conversion Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {managerData.agentBreakdown.map(agent => {
                    const ratio = agent.callsDone > 0 ? Math.round((agent.convertedCount / agent.callsDone) * 100) : 0;
                    return (
                      <tr key={agent.agentId} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{agent.name}</td>
                        <td className="p-4 text-center text-brand-purple font-semibold">{agent.callsDone}</td>
                        <td className="p-4 text-center font-semibold text-indigo-600">{agent.interestedCount}</td>
                        <td className="p-4 text-center font-bold text-emerald-600">{agent.convertedCount}</td>
                        <td className="p-4 text-center font-semibold text-red-500">{agent.incompleteAssigned}</td>
                        <td className="p-4 text-center font-bold text-slate-800 bg-slate-50/50">{ratio}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- AGENT REPORTS VIEW --- */}
      {user?.role === 'AGENT' && agentData && (
        <div className="space-y-6 text-left">
          {/* Row 1: Agent Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm space-y-2">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">My Calls Completed</span>
              <span className="text-3xl font-extrabold text-slate-900 block">{agentData.callsDone}</span>
              <div className="text-[10px] text-slate-400">Total calls recorded in logs</div>
            </div>

            <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm space-y-2">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Scheduled Callbacks</span>
              <span className="text-3xl font-extrabold text-amber-600 block">{agentData.followUps}</span>
              <div className="text-[10px] text-slate-400">Callbacks in calendar</div>
            </div>

            <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm space-y-2">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Interested Prospects</span>
              <span className="text-3xl font-extrabold text-indigo-600 block">{agentData.interestedCount}</span>
              <div className="text-[10px] text-slate-400">Warm prospect leads</div>
            </div>

            <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm space-y-2">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">My Closed Sales</span>
              <span className="text-3xl font-extrabold text-emerald-600 block">{agentData.convertedCount}</span>
              <div className="text-[10px] text-slate-400">Closed won conversions</div>
            </div>
          </div>

          {/* Row 2: Agent Leads status chart breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pie chart */}
            <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm lg:col-span-2">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">My Leads Status Breakdown</h4>
                <p className="text-[10px] text-slate-500">Distribution of leads assigned to you by category.</p>
              </div>

              <div className="h-64 mt-4 flex items-center justify-center">
                {getPieChartData(agentData.leadsByStatus).length > 0 ? (
                  <div className="w-full h-full flex flex-col sm:flex-row items-center justify-around">
                    <div className="w-48 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getPieChartData(agentData.leadsByStatus)}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {getPieChartData(agentData.leadsByStatus).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
                      {getPieChartData(agentData.leadsByStatus).map(item => (
                        <div key={item.name} className="flex items-center space-x-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="font-medium truncate max-w-[120px]">{item.name}: <strong>{item.value}</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">No active lead status breakdown found.</span>
                )}
              </div>
            </div>

            {/* Performance health block */}
            <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm flex flex-col justify-between text-xs text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Personal Dialing Health</h4>
                <p className="text-[10px] text-slate-500">Summary of conversion success.</p>
              </div>
              <div className="space-y-4 my-4 flex-1 flex flex-col justify-center">
                <div className="text-center pb-4 border-b border-slate-100">
                  <span className="text-slate-400 block font-semibold">My Conversion Rate</span>
                  <span className="text-4xl font-extrabold text-emerald-600 block mt-1">
                    {agentData.callsDone > 0 ? Math.round((agentData.convertedCount / agentData.callsDone) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Incomplete Leads Assigned</span>
                  <span className="font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded">{agentData.incompleteAssigned}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
