import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, Shield, Building, X } from 'lucide-react';
import { api, User } from '../utils/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('employee');
  const [department, setDepartment] = useState('General');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({
          email,
          password,
          full_name: fullName,
          role,
          department
        });
        onSuccess(res.user);
      } else {
        const res = await api.login(email, password);
        onSuccess(res.user);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-white/20 shadow-2xl relative bg-zinc-950/90">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/25">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            {isRegister ? 'Create Enterprise Account' : 'Enterprise Sign In'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {isRegister
              ? 'Join your company workspace with RBAC role authorization'
              : 'Sign in to access authorized company documents & RAG intelligence'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="block text-gray-400 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 mb-1">Role (RBAC)</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-gray-300 rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR</option>
                  <option value="finance">Finance</option>
                  <option value="it">IT</option>
                  <option value="administrator">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="e.g. Legal, IT, HR"
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/25 transition-all mt-4 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-cyan-400 hover:underline"
          >
            {isRegister
              ? 'Already have an account? Sign in'
              : "Don't have an enterprise account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};
