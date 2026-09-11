import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  Activity,
  Layers
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { api } from '../utils/api';

export const RiskDashboard: React.FC<{ onSelectDocument?: (docId: string) => void }> = ({ onSelectDocument }) => {
  const [stats, setStats] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getRiskStats().catch(() => null),
      api.listDocuments().then(res => res.documents).catch(() => [])
    ]).then(([statsRes, docsRes]) => {
      setStats(statsRes);
      setDocuments(docsRes || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const redCount = stats?.red_count || 0;
  const yellowCount = stats?.yellow_count || 0;
  const greenCount = stats?.green_count || 0;

  const severityPieData = [
    { name: 'High Risk (Red)', value: redCount, color: '#EF4444' },
    { name: 'Warning (Yellow)', value: yellowCount, color: '#F59E0B' },
    { name: 'Positive (Green)', value: greenCount, color: '#10B981' },
  ].filter(d => d.value > 0);

  const categoryBarData = Object.entries(stats?.categories || {}).map(([cat, count]) => ({
    category: cat,
    count: count as number,
  }));

  return (
    <div className="flex flex-col h-full gap-6 overflow-y-auto pr-1 scrollbar-thin">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-red-400" />
          Enterprise Risk & Impact Intelligence
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Automated sentence-by-sentence compliance, operational risk, and security vulnerability surveillance.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-red-500/30 bg-red-950/20 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-red-300 uppercase tracking-wider">🔴 High Risk Severity</span>
            <h3 className="text-3xl font-extrabold text-red-400 mt-2">{redCount}</h3>
            <p className="text-xs text-red-300/70 mt-1">Critical security, legal & compliance markers</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
            <ShieldAlert className="w-6 h-6 text-red-400" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-amber-950/20 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">🟡 Warning / Moderate Concern</span>
            <h3 className="text-3xl font-extrabold text-amber-400 mt-2">{yellowCount}</h3>
            <p className="text-xs text-amber-300/70 mt-1">Operational delays, friction & uncertainty</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">🟢 Positive / Beneficial Impact</span>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">{greenCount}</h3>
            <p className="text-xs text-emerald-300/70 mt-1">Cost savings, employee benefits & optimizations</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-cyan-400" />
            Severity Distribution
          </h3>
          <div className="h-64">
            {severityPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {severityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-gray-500">
                No risk records found. Upload documents to generate risk telemetry.
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            Impact Distribution by Category
          </h3>
          <div className="h-64">
            {categoryBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBarData}>
                  <XAxis dataKey="category" stroke="#888" fontSize={11} />
                  <YAxis stroke="#888" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-gray-500">
                No categorical risk data recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documents Surveillance List */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h3 className="text-base font-semibold text-white mb-4">Inspected Enterprise Documents</h3>
        <div className="space-y-3">
          {documents.map(d => (
            <div
              key={d.id}
              onClick={() => onSelectDocument && onSelectDocument(d.id)}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/40 cursor-pointer flex items-center justify-between transition-all"
            >
              <div>
                <h4 className="text-sm font-semibold text-white">{d.title}</h4>
                <p className="text-xs text-gray-400">{d.department} • Version {d.current_version} • {d.access_level}</p>
              </div>
              <button className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30">
                Open Highlight Viewer →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
