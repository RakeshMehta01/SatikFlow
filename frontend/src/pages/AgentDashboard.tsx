import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  PhoneCall,
  Calendar,
  Sparkles,
  AlertCircle,
  FileQuestion,
  Users,
  CheckSquare,
  Award,
  ArrowRight
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

interface AgentDashboardStats {
  myAssignedLeads: number;
  incompleteLeads: number;
  callsPending: number;
  callsDoneToday: number;
  followUpsDueToday: number;
  interestedLeads: number;
  convertedLeads: number;
}

export const AgentDashboard: React.FC = () => {
  usePageTitle('Agent Dashboard');
  const [stats, setStats] = useState<AgentDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/agent');
        setStats(res.data);
      } catch (err: any) {
        console.error('Error fetching agent dashboard stats:', err);
        setError('Failed to load calling metrics. Check if backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
        <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Fetching your calling analytics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-[12px] flex items-center space-x-3">
        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
        <div>
          <h4 className="font-bold">Sync Error</h4>
          <p className="text-xs text-red-600 mt-0.5">{error || 'Could not fetch your statistics'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-950 to-navy-900 text-white rounded-[12px] p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/20 rounded-full filter blur-2xl"></div>

        <div className="relative z-10 space-y-4 max-w-xl text-left">
          <div className="inline-flex items-center space-x-1.5 bg-brand-purple/30 border border-brand-purple/40 text-brand-purple-light text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Your Dialing Cockpit</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Review your assigned leads, call results, schedule necessary callbacks and keep converting warm prospects into customers.
          </p>
          <div className="pt-2">
            <Link
              to="/agent/calling-workspace"
              className="inline-flex items-center bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-bold px-5 py-2.5 rounded-[8px] transition-all duration-150 shadow-md shadow-brand-purple/35 min-h-[40px] uppercase tracking-wider"
            >
              <span>Open Calling Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Row 1: Active Dials Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calls Done Today */}
        <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm space-y-2 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calls Made Today</span>
            <div className="p-2 bg-purple-50 rounded-lg text-brand-purple"><PhoneCall className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.callsDoneToday}</p>
          <div className="text-[10px] text-slate-400 font-medium">Daily Dial Target Progress</div>
        </div>

        {/* Followups due today */}
        <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm space-y-2 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Follow-Ups Today</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Calendar className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.followUpsDueToday}</p>
          <div className="text-[10px] text-slate-400 font-medium">Callbacks scheduled for today</div>
        </div>

        {/* Interested Leads */}
        <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm space-y-2 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Warm Leads</span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Award className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.interestedLeads}</p>
          <div className="text-[10px] text-slate-400 font-medium">Interested prospect accounts</div>
        </div>

        {/* Converted Leads */}
        <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm space-y-2 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Conversions</span>
            <div className="p-2 bg-green-50 rounded-lg text-green-600"><CheckSquare className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.convertedLeads}</p>
          <div className="text-[10px] text-slate-400 font-medium">Closed deals successfully won</div>
        </div>
      </div>

      {/* Row 2: Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Assigned */}
        <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm space-y-2 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Assigned Leads</span>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Users className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.myAssignedLeads}</p>
          <div className="text-[10px] text-slate-400 font-medium">Leads in your local directory</div>
        </div>

        {/* Calls Pending */}
        <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm space-y-2 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calls Pending</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileQuestion className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.callsPending}</p>
          <div className="text-[10px] text-slate-400 font-medium">Assigned leads never dialed</div>
        </div>

        {/* Incomplete Leads */}
        <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm space-y-2 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Incomplete Leads</span>
            <div className="p-2 bg-red-50 rounded-lg text-red-600"><AlertCircle className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.incompleteLeads}</p>
          <div className="text-[10px] text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded inline-block">Need details / mobile update</div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-6 text-left space-y-4">
        <h4 className="font-bold text-slate-900 text-sm">Quick Calling Tip</h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          Before clicking <strong>Save & Next</strong>, make sure to log the calling response correctly (e.g. Busy, Not Picked, Contacted) and input a follow-up date/time if the prospect asks you to callback later. For incomplete leads with missing phone numbers, double check their Google Maps link or Website from the workspace preview to gather contact details!
        </p>
      </div>
    </div>
  );
};

export default AgentDashboard;
