import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UploadCloud,
  UserPlus,
  List,
  Calendar,
  BarChart2,
  Users,
  PhoneCall,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Bell
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
}

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Define sidebar navigation based on role
  const managerItems: SidebarItem[] = [
    { name: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Upload Leads', path: '/manager/upload-leads', icon: UploadCloud },
    { name: 'Assign Leads', path: '/manager/assign-leads', icon: UserPlus },
    { name: 'Leads', path: '/manager/leads', icon: List },
    { name: 'Follow-Ups', path: '/manager/follow-ups', icon: Calendar },
    { name: 'Reports', path: '/manager/reports', icon: BarChart2 },
    { name: 'Users (Agents)', path: '/manager/users', icon: Users },
  ];

  const agentItems: SidebarItem[] = [
    { name: 'Dashboard', path: '/agent/dashboard', icon: LayoutDashboard },
    { name: 'Calling Workspace', path: '/agent/calling-workspace', icon: PhoneCall },
    { name: 'My Leads', path: '/agent/leads', icon: List },
    { name: 'Follow-Ups', path: '/agent/follow-ups', icon: Calendar },
    { name: 'Reports', path: '/agent/reports', icon: BarChart2 },
  ];

  const navItems = user?.role === 'MANAGER' ? managerItems : agentItems;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* 1. Desktop Sidebar (Deep Navy Background) */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy-950 text-slate-100 flex-shrink-0 border-r border-navy-900 shadow-xl">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-navy-900 justify-between flex-shrink-0">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-purple via-indigo-600 to-purple-500 flex items-center justify-center font-bold text-white shadow-md shadow-brand-purple/25 ring-2 ring-white/10 animate-logo-pulse animate-gradient-shift group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5 text-white group-hover:animate-phone-ring" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 5.5A4 4 0 0 1 12 4a4 4 0 0 1 4 4c0 3-8 3-8 6a4 4 0 0 0 4 4 4 4 0 0 0 3.5-1.5" />
                <circle cx="8.5" cy="5.5" r="1.5" fill="currentColor" />
                <circle cx="15.5" cy="18.5" r="1.5" fill="currentColor" />
              </svg>
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  active
                    ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/20'
                    : 'text-slate-400 hover:bg-navy-900 hover:text-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-105 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Sidebar Footer */}
        <div className="p-4 border-t border-navy-900 bg-navy-950/60">
          <div className="flex items-center space-x-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center font-bold text-brand-purple text-sm">
              {user?.name.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{user?.role.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10 flex-shrink-0">
          {/* Left Side: Mobile Menu Button */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Quick Stats or Greeting */}
            <div className="hidden sm:block ml-4 text-sm font-medium text-slate-600">
              Welcome back, <span className="text-slate-900 font-semibold">{user?.name}</span>
            </div>
          </div>

          {/* Right Side: Search / Actions / User Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications Button */}
            <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors duration-150">
              <Bell className="w-5 h-5" />
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-150 focus:outline-none min-h-[44px] px-3"
              >
                <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center font-bold text-white text-xs shadow-sm">
                  {user?.name.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden md:block text-sm font-semibold text-slate-700">{user?.name}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-30 transform origin-top-right transition-all">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to={user?.role === 'MANAGER' ? '/manager/dashboard' : '/agent/dashboard'}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2 text-slate-400" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left font-medium border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* 3. Mobile Navigation Drawer (Overlay Modal) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Drawer menu */}
          <div className="relative flex flex-col w-64 max-w-xs bg-navy-950 text-slate-100 h-full shadow-2xl z-10 transition-transform transform translate-x-0 duration-300">
            {/* Close Button */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-navy-900">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-purple via-indigo-600 to-purple-500 flex items-center justify-center font-bold text-white shadow-md ring-2 ring-white/10 animate-logo-pulse animate-gradient-shift">
                  <svg className="w-5 h-5 text-white animate-phone-ring" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 5.5A4 4 0 0 1 12 4a4 4 0 0 1 4 4c0 3-8 3-8 6a4 4 0 0 0 4 4 4 4 0 0 0 3.5-1.5" />
                    <circle cx="8.5" cy="5.5" r="1.5" fill="currentColor" />
                    <circle cx="15.5" cy="18.5" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <div className="flex items-center">
                  <span className="font-extrabold text-lg text-white tracking-tight">SatikFlow</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-purple-light bg-brand-purple/25 border border-brand-purple-light/25 px-1.5 py-0.5 rounded-[4px] ml-1.5">CRM</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-navy-900 hover:text-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-brand-purple text-white shadow-md'
                        : 'text-slate-400 hover:bg-navy-900 hover:text-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-navy-900 bg-navy-950/60">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-brand-purple flex items-center justify-center font-bold text-white text-sm">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate capitalize">{user?.role.toLowerCase()}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center px-4 py-2.5 text-sm bg-navy-900 hover:bg-red-950 hover:text-red-200 border border-navy-800 hover:border-red-900 rounded-lg text-slate-300 font-medium transition-all duration-150 min-h-[44px]"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
