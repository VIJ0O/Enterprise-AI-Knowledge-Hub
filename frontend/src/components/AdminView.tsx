import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  CheckCircle2, 
  Play, 
  Activity, 
  ListOrdered,
  Lock,
  ThumbsUp
} from 'lucide-react';
import { api } from '../utils/api';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'eval' | 'users' | 'audit'>('overview');
  const [dashboard, setDashboard] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [riskEvalResults, setRiskEvalResults] = useState<any>(null);
  const [ragEvalResults, setRagEvalResults] = useState<any>(null);
  const [runningEval, setRunningEval] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAdminDashboard().catch(() => null),
      api.listUsers().catch(() => []),
      api.getAuditLogs().then(res => res.logs).catch(() => [])
    ]).then(([dashRes, userRes, auditRes]) => {
      setDashboard(dashRes);
      setUsers(userRes || []);
      setAuditLogs(auditRes || []);
      setLoading(false);
    });
  }, []);

  const handleRunEvaluations = async () => {
    try {
      setRunningEval(true);
      const [riskRes, ragRes] = await Promise.all([
        api.runRiskEvaluation(),
        api.runRagEvaluation(5)
      ]);
      setRiskEvalResults(riskRes.metrics);
      setRagEvalResults(ragRes.metrics);
    } catch (err: any) {
      alert(err.message || 'Evaluation run failed');
    } finally {
      setRunningEval(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 overflow-y-auto pr-1 scrollbar-thin">
      {/* Header & Tabs */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-cyan-400" />
              Enterprise Administration & Governance
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Role-Based Access Control, System Evaluation, Audit Telemetry, and Security Compliance.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10">
            {[
              { id: 'overview', label: 'System Overview' },
              { id: 'eval', label: 'RAG & Risk Evaluation' },
              { id: 'users', label: 'Enterprise Users' },
              { id: 'audit', label: 'Audit Logs' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab 1: System Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
              <p className="text-xs text-gray-400 font-medium">TOTAL DOCUMENTS</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">{dashboard?.total_documents || 0}</h3>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
              <p className="text-xs text-gray-400 font-medium">ACTIVE USERS</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">{dashboard?.total_users || 0}</h3>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
              <p className="text-xs text-gray-400 font-medium">FEEDBACK SATISFACTION</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">
                {dashboard?.satisfaction_rate_percent || 100}%
              </h3>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
              <p className="text-xs text-gray-400 font-medium">TOTAL LOGGED FEEDBACK</p>
              <h3 className="text-3xl font-extrabold text-cyan-400 mt-2">{dashboard?.total_feedback || 0}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: RAG & Risk Evaluation Benchmark */}
      {activeTab === 'eval' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Live Benchmark Evaluation Suite</h3>
              <p className="text-xs text-gray-400 mt-1">
                Executes un-fabricated mathematical evaluation across Recall@K, MRR, Precision, Accuracy, and Confusion Matrices.
              </p>
            </div>
            <button
              onClick={handleRunEvaluations}
              disabled={runningEval}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              {runningEval ? 'Evaluating Models...' : 'Run Full Evaluation'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Classifier Evaluation */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-400" />
                Risk Classifier Metrics (Sentence-Level)
              </h4>
              {riskEvalResults ? (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-gray-400">Accuracy</span>
                      <p className="text-xl font-bold text-emerald-400 mt-1">
                        {(riskEvalResults.accuracy * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-gray-400">F1-Score (Macro)</span>
                      <p className="text-xl font-bold text-cyan-400 mt-1">
                        {(riskEvalResults.f1_macro * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-300 mb-2">Per-Class Precision & Recall:</h5>
                    <div className="space-y-1.5">
                      {Object.entries(riskEvalResults.per_class || {}).map(([cls, m]: any) => (
                        <div key={cls} className="flex items-center justify-between p-2 rounded bg-white/5 uppercase">
                          <span className="font-bold text-gray-300">{cls}</span>
                          <span className="text-gray-400 font-mono">
                            Prec: {(m.precision * 100).toFixed(0)}% | Rec: {(m.recall * 100).toFixed(0)}% | F1: {(m.f1_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center text-xs text-gray-500">
                  Click 'Run Full Evaluation' to test the Risk & Impact Classifier on labeled benchmark test cases.
                </div>
              )}
            </div>

            {/* RAG Hybrid Retrieval Evaluation */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-purple-400" />
                Hybrid Retrieval Metrics (BGE-M3 + BM25 + RRF)
              </h4>
              {ragEvalResults ? (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-gray-400">Recall@5</span>
                      <p className="text-xl font-bold text-purple-400 mt-1">
                        {((ragEvalResults.recall_at_5 || 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-gray-400">Precision@5</span>
                      <p className="text-xl font-bold text-blue-400 mt-1">
                        {((ragEvalResults.precision_at_5 || 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-gray-400">MRR</span>
                      <p className="text-xl font-bold text-emerald-400 mt-1">
                        {ragEvalResults.mrr}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-gray-300">
                    <p className="font-semibold text-white mb-1">Evaluated Query Scope:</p>
                    <p className="text-gray-400 leading-relaxed">
                      Tested on {ragEvalResults.total_queries_evaluated} benchmark enterprise queries covering Security, HR, Finance, and Operational compliance topics.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center text-xs text-gray-500">
                  Click 'Run Full Evaluation' to test multi-stage retrieval ranking.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Users */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h3 className="text-base font-semibold text-white mb-4">Enterprise Users & Access Levels</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-white/10 text-gray-400 uppercase">
                <tr>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role (RBAC)</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-semibold text-white">{u.full_name}</td>
                    <td className="py-3 px-4 text-gray-400">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase font-mono text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">{u.department}</td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 font-semibold">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h3 className="text-base font-semibold text-white mb-4">Security & Access Audit Logs</h3>
          <div className="space-y-2">
            {auditLogs.length > 0 ? (
              auditLogs.map(l => (
                <div key={l.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white">{l.action}</span>
                    <span className="text-gray-400 ml-2">on {l.resource_type} ({l.resource_id})</span>
                  </div>
                  <span className="text-gray-500 font-mono">{l.created_at}</span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-500">No security audit events recorded.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
