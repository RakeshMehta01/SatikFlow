import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  UserPlus,
  Edit2,
  ToggleLeft,
  ToggleRight,
  X,
  AlertCircle,
  CheckCircle2,
  Mail,
  Phone,
  Lock
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

interface AgentUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export const UsersPage: React.FC = () => {
  usePageTitle('Users & Agents');
  const [users, setUsers] = useState<AgentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AgentUser | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMsg('Failed to query registered calling agents.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: AgentUser) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setPassword(''); // Leave blank unless changing
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (editingUser) {
        // Edit agent
        const payload: any = { name, email, phone };
        if (password) payload.password = password; // Only update if filled
        
        await api.put(`/users/${editingUser._id}`, payload);
        setSuccessMsg(`Successfully updated credentials for agent: ${name}`);
      } else {
        // Create agent
        if (!password) {
          setErrorMsg('Password is required for new agents');
          setSubmitting(false);
          return;
        }
        await api.post('/users', { name, email, phone, password, role: 'AGENT' });
        setSuccessMsg(`Successfully registered new calling agent: ${name}`);
      }

      setIsModalOpen(false);
      fetchUsers(); // Refresh table
    } catch (error: any) {
      console.error('Error submitting user:', error);
      setErrorMsg(error.response?.data?.message || 'Error occurred while saving agent profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: AgentUser) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    
    try {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const res = await api.patch(`/users/${user._id}/status`, { status: newStatus });
      const updatedUser = res.data;
      
      setSuccessMsg(`Agent status set to: ${updatedUser.status} for ${user.name}`);
      fetchUsers(); // Refresh
    } catch (error: any) {
      console.error('Error toggling status:', error);
      setErrorMsg(error.response?.data?.message || 'Could not update agent status');
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">Team User Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Register calling agents, edit logins, and manage active permissions.</p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold py-2 px-4 rounded-[8px] transition-all shadow-md shadow-brand-purple/20 min-h-[38px] flex items-center"
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          Add Calling Agent
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-emerald-700 p-4 rounded-[12px] flex items-center space-x-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-xs font-semibold">{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-[12px] flex items-center space-x-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-xs font-semibold">{errorMsg}</p>
        </div>
      )}

      {/* Agents Table List */}
      <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">Fetching registered users...</div>
          ) : users.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                  <th className="p-4">User Name</th>
                  <th className="p-4">Email Login</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Role Permission</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{u.name}</td>
                    <td className="p-4 text-slate-500 font-mono">{u.email}</td>
                    <td className="p-4 text-slate-500 font-mono">{u.phone || '—'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'MANAGER'
                          ? 'bg-purple-100 text-brand-purple'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => u.role !== 'MANAGER' && handleToggleStatus(u)}
                        disabled={u.role === 'MANAGER'}
                        className="focus:outline-none disabled:opacity-50 min-h-[32px] min-w-[32px] flex items-center justify-center mx-auto"
                        title={u.role === 'MANAGER' ? 'Cannot deactivate manager' : 'Toggle status'}
                      >
                        {u.status === 'ACTIVE' ? (
                          <ToggleRight className="w-8 h-8 text-emerald-500 hover:text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-slate-350 hover:text-slate-400" />
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="inline-flex items-center text-xs font-semibold text-brand-purple hover:text-brand-purple-hover bg-brand-purple/10 hover:bg-brand-purple/20 px-2.5 py-1.5 rounded-[6px] transition-all min-h-[32px]"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        Edit Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">No calling agents registered yet.</div>
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

          {/* Modal box */}
          <div className="bg-white rounded-[12px] border border-slate-200 shadow-2xl p-6 w-full max-w-md z-10 space-y-4 relative animate-scaleUp text-xs">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-2 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                {editingUser ? 'Edit Agent Profile' : 'Register New Agent'}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Fill in login details to initialize agent dialing sessions.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              {/* Name */}
              <div>
                <label className="block font-bold text-slate-600 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alice Smith"
                  className="w-full rounded-[8px] border border-slate-300 py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-bold text-slate-600 mb-1.5">Email (Login ID)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@company.com"
                    className="pl-9 w-full rounded-[8px] border border-slate-350 py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block font-bold text-slate-600 mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 99999 88888"
                    className="pl-9 w-full rounded-[8px] border border-slate-350 py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-bold text-slate-600 mb-1.5">
                  Password {editingUser && <span className="text-slate-400 font-normal">(Fill only to modify)</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 w-full rounded-[8px] border border-slate-350 py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    required={!editingUser}
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-brand-purple hover:bg-brand-purple-hover text-white font-bold py-2.5 rounded-[8px] shadow-md shadow-brand-purple/20 transition-all disabled:opacity-50 min-h-[40px] flex items-center justify-center"
                >
                  {submitting ? 'Saving...' : 'Apply Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-slate-350 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-[8px] min-h-[40px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
