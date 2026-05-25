import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  Layers,
  PhoneCall,
  Calendar,
  BarChart3,
  CheckCircle,
  HelpCircle,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

export const LandingPage: React.FC = () => {
  usePageTitle('For Modern Sales Team');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqData = [
    {
      q: "Can we upload leads?",
      a: "Yes! SatikFlow CRM is specifically optimized for Excel/CSV exports. You can upload files directly, map whatever column names you have, and immediately start dialing."
    },
    {
      q: "What if some fields (like phone numbers) are missing in the import?",
      a: "The import will NOT fail! Rows missing a mobile number are imported and categorized as 'INCOMPLETE' leads. Managers and agents can view, edit, and fill in these missing details later once they find them."
    },
    {
      q: "Can agents add and edit details later?",
      a: "Absolutely. During a call in the calling workspace or on the Lead Detail page, agents can edit any of the core fields, fill in alternate numbers, email, category, or add custom fields on the fly."
    },
    {
      q: "Can the manager assign leads in bulk?",
      a: "Yes, managers have a dedicated 'Assign Leads' workspace where they can filter leads by city, category, or status, select multiple leads, and assign or reassign them to an agent in a single click."
    },
    {
      q: "Can agents see leads assigned to other agents?",
      a: "No. Security is built-in. Agents only see leads specifically assigned to them. Managers can see and manage all leads."
    },
    {
      q: "Is it mobile responsive?",
      a: "Yes. The entire SatikFlow CRM is fully responsive. Agents can call leads directly from their mobile phones, update details, and view their dashboard on any screen size."
    }
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen">
      {/* 1. Header Navigation - Transparent Floating Pill */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 flex justify-center">
        <nav className="w-full max-w-6xl bg-navy-950/70 backdrop-blur-xl border border-navy-800/80 rounded-full shadow-xl shadow-navy-950/40 px-6 py-2.5 flex items-center justify-between transition-all duration-300">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-purple via-indigo-600 to-purple-500 flex items-center justify-center font-bold text-white shadow-md shadow-brand-purple/25 ring-2 ring-white/10 animate-logo-pulse animate-gradient-shift group-hover:scale-105 transition-transform duration-200">
                <svg className="w-5 h-5 text-white group-hover:animate-phone-ring" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 5.5A4 4 0 0 1 12 4a4 4 0 0 1 4 4c0 3-8 3-8 6a4 4 0 0 0 4 4 4 4 0 0 0 3.5-1.5" />
                  <circle cx="8.5" cy="5.5" r="1.5" fill="currentColor" />
                  <circle cx="15.5" cy="18.5" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <span className="absolute -top-1.5 -right-1.5 text-[7px] font-black uppercase tracking-wide bg-gradient-to-r from-pink-500 to-rose-500 text-white px-1.5 py-0.5 rounded-full leading-none shadow-sm">beta</span>
            </div>
            <div className="flex items-center">
              <span className="font-extrabold text-lg text-white tracking-tight group-hover:text-brand-purple-light transition-colors duration-200">
                SatikFlow
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-purple-light bg-brand-purple/25 border border-brand-purple-light/25 px-1.5 py-0.5 rounded-[4px] ml-1.5">
                CRM
              </span>
            </div>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors duration-150">Features</a>
            <a href="#workflow" className="text-slate-300 hover:text-white transition-colors duration-150">Workflow</a>
            <a href="#benefits" className="text-slate-300 hover:text-white transition-colors duration-150">Role Benefits</a>
            <a href="#preview" className="text-slate-300 hover:text-white transition-colors duration-150">Preview</a>
            <a href="#faq" className="text-slate-300 hover:text-white transition-colors duration-150">FAQ</a>
          </div>

          {/* CTAs */}
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="hidden sm:flex text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider px-4 py-2 hover:bg-white/5 rounded-full transition-all duration-150 min-h-[38px] items-center"
            >
              Login
            </Link>
            <Link
              to="/login"
              className="bg-brand-purple hover:bg-brand-purple-hover text-white font-bold uppercase tracking-wider rounded-full shadow-lg shadow-brand-purple/20 hover:shadow-brand-purple/35 transition-all duration-150 flex items-center text-[10px] px-3 py-1.5 sm:text-xs sm:px-5 sm:py-2.5 sm:min-h-[38px]"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </div>

      {/* 2. Hero Section */}
      <header className="relative bg-navy-950 text-white overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-36">
        {/* Decorative Grid Lines / Glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-purple/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-brand-purple/20 border border-brand-purple/45 text-brand-purple-light text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built for Modern Sales Team</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto text-white">
            Turn LEADS into <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple-light via-purple-300 to-pink-300">real sales conversations.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            Upload flexible leads, assign it to your calling team, track every call and never miss a follow-up.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16">
            <Link
              to="/login"
              className="w-full sm:w-auto bg-brand-purple hover:bg-brand-purple-hover text-white text-base font-semibold px-8 py-3 rounded-[8px] shadow-xl shadow-brand-purple/35 transition-all duration-200 min-h-[44px] flex items-center justify-center space-x-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#preview"
              className="w-full sm:w-auto border border-slate-700 hover:border-slate-500 hover:bg-navy-900/40 text-slate-200 text-base font-medium px-8 py-3 rounded-[8px] transition-all duration-200 min-h-[44px] flex items-center justify-center"
            >
              See Dashboard
            </a>
          </div>

          {/* CRM Dashboard Mockup Card */}
          <div className="relative mx-auto max-w-4xl rounded-[12px] bg-slate-900 p-2 sm:p-3 border border-slate-800 shadow-2xl shadow-slate-950/80">
            <div className="rounded-[8px] overflow-hidden border border-slate-800 bg-navy-950">
              {/* Mockup bar */}
              <div className="h-10 bg-slate-900 flex items-center px-4 justify-between border-b border-slate-800">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs text-slate-500 font-medium font-mono">satikflow/dashboard</div>
                <div className="w-4"></div>
              </div>
              {/* Mockup body */}
              <div className="p-4 sm:p-6 text-left text-slate-300 text-xs sm:text-sm font-sans space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">Manager Dashboard</h3>
                    <p className="text-xs text-slate-500">Performance insights & Lead allocation</p>
                  </div>
                  <span className="bg-brand-purple/20 text-brand-purple-light border border-brand-purple/40 px-2.5 py-1 rounded text-xs">Live Feed</span>
                </div>
                {/* Dashboard Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Total Leads</span>
                    <span className="text-2xl font-extrabold text-white">1,482</span>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Calls Made</span>
                    <span className="text-2xl font-extrabold text-brand-purple-light">843</span>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Follow-Ups Due</span>
                    <span className="text-2xl font-extrabold text-yellow-400">54</span>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Converted</span>
                    <span className="text-2xl font-extrabold text-green-400">126</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Problem Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">The Messy Reality of leads</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-base">
            Sales teams dialing prospects struggle with scattered spreadsheets and missed opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-[12px] border border-slate-200 shadow-sm flex flex-col items-start">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-lg flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Messy & Missing Fields</h3>
            <p className="text-sm text-slate-500">
              exports have completely different columns depending on the tool. Standard CRMs reject rows if a phone or contact name is missing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[12px] border border-slate-200 shadow-sm flex flex-col items-start">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Missed Call Backs</h3>
            <p className="text-sm text-slate-500">
              Without active scheduling, agents forget callback requests, leaving interested clients hanging and leaving cash on the table.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[12px] border border-slate-200 shadow-sm flex flex-col items-start">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Zero Manager Visibility</h3>
            <p className="text-sm text-slate-500">
              When agents use paper logs or local sheets, managers cannot track how many dials were completed today or which categories convert.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Solution Section */}
      <section className="bg-slate-100 py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Designed specifically for flexible calling pipelines</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-brand-purple/10 text-brand-purple rounded-full flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Map Any Spreadsheet Format</h4>
                    <p className="text-sm text-slate-500 mt-1">Select source file, choose which column represents Mobile/Name, and click import. Unmapped fields are automatically stored as custom attributes.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 bg-brand-purple/10 text-brand-purple rounded-full flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Dedicated Calling Workspace</h4>
                    <p className="text-sm text-slate-500 mt-1">Calling agents get a simple 'Next' interface that keeps them focused on dialing and updating call results, removing visual noise.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 bg-brand-purple/10 text-brand-purple rounded-full flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Active Follow-up Alerts</h4>
                    <p className="text-sm text-slate-500 mt-1">Overdue and scheduled callbacks are flagged instantly for both agent and manager to secure every potential deal.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphics / Mockup */}
            <div className="bg-white p-6 rounded-[12px] border border-slate-200 shadow-lg">
              <span className="text-[10px] font-extrabold text-brand-purple uppercase tracking-wider block mb-2">Agent View</span>
              <h4 className="font-bold text-base text-slate-950 mb-4">Lead: Dynamic Web Solutions</h4>
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Category</span>
                    <span className="font-medium text-slate-800">Web Designer</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Mobile</span>
                    <span className="font-medium text-slate-800">98765 43210</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 flex space-x-2">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-[10px] font-bold">Rating: 4.8</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[10px] font-bold">Reviews: 34</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold py-2 px-3 rounded-[8px]">Busy / No Answer</button>
                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 px-3 rounded-[8px]">Schedule Callback</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Feature Cards Section (Pastel colors as design direction) */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Core Sales CRM Capabilities</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-base">
            Essential tools designed to help manager and agent collaborate and secure prospects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Pastel Pink */}
          <div className="bg-pastel-pink p-6 rounded-[12px] border border-pink-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center mb-4">
                <UploadCloud className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Flexible lead Upload</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Accepts csv/xlsx files containing columns of varying names. If a cell or header is missing, the CRM will successfully ingest it without throwing errors.
              </p>
            </div>
          </div>

          {/* Card 2: Pastel Blue */}
          <div className="bg-pastel-blue p-6 rounded-[12px] border border-blue-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Field Mapping</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Map custom column headers from third-party tools to standard SatikFlow fields. Unmapped fields are safely preserved inside custom JSON structures.
              </p>
            </div>
          </div>
 
          {/* Card 3: Pastel Purple */}
          <div className="bg-pastel-purple p-6 rounded-[12px] border border-purple-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-purple-100 text-brand-purple rounded-lg flex items-center justify-center mb-4">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Agent Calling Workspace</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Dial through list leads sequentially with a single click. Review listing links, ratings, categories, and take notes quickly without page-hopping.
              </p>
            </div>
          </div>
 
          {/* Card 4: Pastel Green */}
          <div className="bg-pastel-green p-6 rounded-[12px] border border-green-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Follow-Up Tracking</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Stay on top of calls callback requests. Set date/time and follow up state so that upcoming callbacks automatically sort to the top.
              </p>
            </div>
          </div>
 
          {/* Card 5: Pastel Orange */}
          <div className="bg-pastel-orange p-6 rounded-[12px] border border-orange-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Manager Dashboard</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Monitor team performance, overall conversion metrics, total call counts today, pending follow-ups, and review agent-wise productivity breakdown.
              </p>
            </div>
          </div>
 
          {/* Card 6: Pastel Yellow */}
          <div className="bg-pastel-yellow p-6 rounded-[12px] border border-yellow-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Activity Timeline</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Keep a history of call outcomes, remarks, status changes, and follow-up activities logged against every business profile for clear audit.
              </p>
            </div>
          </div>
        </div>
      </section>
 
      {/* 6. Workflow Section */}
      <section id="workflow" className="bg-slate-100 py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">How SatikFlow CRM Works</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-base">
              A structured 5-step operational pipeline to streamline call-to-close workflows.
            </p>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-brand-purple text-white flex items-center justify-center font-bold text-sm mb-4 shadow-md">1</div>
              <h4 className="font-bold text-slate-900 mb-1">Upload Data</h4>
              <p className="text-xs text-slate-500">Upload CSV, Excel, or other files.</p>
            </div>
 
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-brand-purple text-white flex items-center justify-center font-bold text-sm mb-4 shadow-md">2</div>
              <h4 className="font-bold text-slate-900 mb-1">Map Fields</h4>
              <p className="text-xs text-slate-500">Associate file headers to CRM properties.</p>
            </div>
 
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-brand-purple text-white flex items-center justify-center font-bold text-sm mb-4 shadow-md">3</div>
              <h4 className="font-bold text-slate-900 mb-1">Assign leads</h4>
              <p className="text-xs text-slate-500">Distribute leads to active calling agents.</p>
            </div>
 
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-brand-purple text-white flex items-center justify-center font-bold text-sm mb-4 shadow-md">4</div>
              <h4 className="font-bold text-slate-900 mb-1">Dial & Update</h4>
              <p className="text-xs text-slate-500">Agent calls and logs outcomes in workspace.</p>
            </div>
 
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-brand-purple text-white flex items-center justify-center font-bold text-sm mb-4 shadow-md">5</div>
              <h4 className="font-bold text-slate-900 mb-1">Manager Audits</h4>
              <p className="text-xs text-slate-500">Manager checks calls, conversions & followups.</p>
            </div>
          </div>
        </div>
      </section>
 
      {/* 7. Manager Benefits Section */}
      <section id="benefits" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-pink-600 uppercase tracking-widest block">For CRM Managers</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Lead management with full oversight</h2>
            <p className="text-slate-500">
              Say goodbye to tracking dials via messaging threads. SatikFlow lets managers inspect operations at a high level.
            </p>
            <ul className="space-y-3.5 text-sm text-slate-600">
              <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2.5 text-pink-500" /> Upload flexible, custom files without rejection</li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2.5 text-pink-500" /> Bulk-assign or reassign leads to agents with search filters</li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2.5 text-pink-500" /> Track dial count and success metrics for every team member</li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2.5 text-pink-500" /> Review conversion ratios (Interested / Converted / Busy)</li>
            </ul>
          </div>
          <div className="bg-pink-50/60 p-8 rounded-[12px] border border-pink-100 flex items-center justify-center">
            <div className="bg-white p-6 rounded-[12px] border border-slate-200 shadow-md w-full max-w-md space-y-4">
              <h4 className="font-bold text-slate-900">Manage Team</h4>
              <div className="divide-y divide-slate-100">
                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Calling Team Alice</p>
                    <p className="text-[10px] text-slate-500">Active • 42 calls today</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded font-bold">ACTIVE</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Agent Team Smith</p>
                    <p className="text-[10px] text-slate-500">Active • 28 calls today</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded font-bold">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Agent Benefits Section */}
      <section className="bg-slate-100 py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-purple-50/60 p-8 rounded-[12px] border border-purple-100 order-last lg:order-first flex items-center justify-center">
              <div className="bg-white p-6 rounded-[12px] border border-slate-200 shadow-md w-full max-w-md space-y-4">
                <h4 className="font-bold text-slate-900">Calling Workspace</h4>
                <div className="bg-slate-50 p-3.5 rounded border border-slate-200 text-xs">
                  <p className="text-[10px] text-slate-400">NEXT ASSIGNED LEAD</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">Skyline Digital Agency</p>
                  <p className="text-slate-500">Mobile: +91 98888 77777</p>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <button className="bg-slate-100 text-slate-800 text-[10px] py-1.5 rounded font-medium">Busy</button>
                  <button className="bg-slate-100 text-slate-800 text-[10px] py-1.5 rounded font-medium">No Answer</button>
                  <button className="bg-brand-purple text-white text-[10px] py-1.5 rounded font-medium">Contacted</button>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <span className="text-xs font-bold text-brand-purple uppercase tracking-widest block">For Calling Agents</span>
              <h2 className="text-3xl font-extrabold text-slate-900">Dial through leads without distraction</h2>
              <p className="text-slate-500">
                Give your agents a simplified calling layout. By displaying one prospect at a time, agents dial rapidly and record outcomes instantly.
              </p>
              <ul className="space-y-3.5 text-sm text-slate-600">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2.5 text-brand-purple" /> One-click calling workspace loads the next lead instantly</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2.5 text-brand-purple" /> Edit missing info (names/mobile numbers) on the spot</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2.5 text-brand-purple" /> Easy quick-response buttons to log calls</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2.5 text-brand-purple" /> Personal dashboard containing today's callback schedule</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-500 text-base">Everything you need to know about lead uploading and calling management.</p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-[12px] border border-slate-200 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none min-h-[48px]"
              >
                <span className="font-semibold text-slate-900 text-sm sm:text-base flex items-center">
                  <HelpCircle className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0" />
                  {faq.q}
                </span>
                {activeFaq === idx ? (
                  <Minus className="w-5 h-5 text-slate-400 flex-shrink-0 ml-4" />
                ) : (
                  <Plus className="w-5 h-5 text-slate-400 flex-shrink-0 ml-4" />
                )}
              </button>

              {activeFaq === idx && (
                <div className="px-6 pb-5 pt-0 text-slate-500 text-sm border-t border-slate-50">
                  <p className="leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 10. Final CTA Section */}
      <section className="bg-navy-950 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Start managing your leads professionally.</h2>
          <p className="text-slate-300 max-w-xl mx-auto text-base">
            Import spreadsheets, map available columns, assign calling agent logs, and boost your sales outcomes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto bg-brand-purple hover:bg-brand-purple-hover text-white text-base font-semibold px-8 py-3 rounded-[8px] transition-all min-h-[44px] flex items-center justify-center"
            >
              Get Started Now
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto border border-slate-700 hover:bg-navy-900 text-slate-200 text-base font-medium px-8 py-3 rounded-[8px] transition-all min-h-[44px] flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-purple to-purple-500 flex items-center justify-center font-bold text-white shadow-md ring-1 ring-white/10 animate-logo-pulse animate-gradient-shift">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 5.5A4 4 0 0 1 12 4a4 4 0 0 1 4 4c0 3-8 3-8 6a4 4 0 0 0 4 4 4 4 0 0 0 3.5-1.5" />
                    <circle cx="8.5" cy="5.5" r="1.5" fill="currentColor" />
                    <circle cx="15.5" cy="18.5" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <span className="absolute -top-1.5 -right-1.5 text-[7px] font-black uppercase tracking-wide bg-gradient-to-r from-pink-500 to-rose-500 text-white px-1.5 py-0.5 rounded-full leading-none shadow-sm">beta</span>
              </div>
              <span className="font-semibold text-slate-200">SatikFlow CRM</span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Sales dialing and customer relations management specifically designed for leads.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-slate-200">Features</a></li>
              <li><a href="#workflow" className="hover:text-slate-200">Workflow</a></li>
              <li><span className="text-slate-600">Pricing (MVP Free)</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-4">CRM</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-slate-200">Manager Dashboard</Link></li>
              <li><Link to="/login" className="hover:text-slate-200">Agent Dialing</Link></li>
              <li><Link to="/login" className="hover:text-slate-200">Upload CSV</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-600">About Us</span></li>
              <li><span className="text-slate-600">Privacy Policy</span></li>
              <li><span className="text-slate-600">Terms of Use</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} SatikFlow CRM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
