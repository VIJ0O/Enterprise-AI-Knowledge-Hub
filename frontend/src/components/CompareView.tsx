import React, { useState, useEffect } from 'react';
import { Layers, ArrowRightLeft, Sparkles, CheckSquare, Square, FileText } from 'lucide-react';
import { api, DocumentItem } from '../utils/api';

export const CompareView: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [topic, setTopic] = useState('');
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listDocuments().then(res => setDocuments(res.documents || [])).catch(() => {});
  }, []);

  const toggleSelectDoc = (id: string) => {
    if (selectedDocIds.includes(id)) {
      setSelectedDocIds(selectedDocIds.filter(d => d !== id));
    } else {
      setSelectedDocIds([...selectedDocIds, id]);
    }
  };

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDocIds.length < 2 || !topic.trim()) return;

    try {
      setLoading(true);
      const res = await api.compare(selectedDocIds, topic);
      setComparisonResult(res.comparison);
    } catch (err: any) {
      alert(err.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <ArrowRightLeft className="w-6 h-6 text-purple-400" />
          Multi-Document Reasoning & Comparison
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Synthesize policies across multiple documents, identify version differences, and detect explicit contradictions.
        </p>

        <form onSubmit={handleCompare} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              1. Select at least 2 documents to compare:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {documents.map(d => {
                const isSelected = selectedDocIds.includes(d.id);
                return (
                  <div
                    key={d.id}
                    onClick={() => toggleSelectDoc(d.id)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-purple-950/30 border-purple-500 text-white'
                        : 'bg-white/[0.02] border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-purple-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-600 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate text-white">{d.title}</p>
                      <p className="text-[11px] text-gray-500">{d.department} • {d.current_version}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Enter comparison topic (e.g., Annual Leave entitlement differences, Security credential revocation, Remote work allowances)..."
              className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
            />
            <button
              type="submit"
              disabled={loading || selectedDocIds.length < 2 || !topic.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Synthesizing...' : 'Compare Documents'}
            </button>
          </div>
        </form>
      </div>

      {/* Comparison Analysis Output */}
      <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col overflow-hidden">
        <h3 className="text-lg font-semibold text-white mb-4">Cross-Document Synthesis</h3>
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
          {comparisonResult ? (
            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {comparisonResult}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 text-sm">
              Select 2 or more documents and specify a topic to generate structured comparative analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
