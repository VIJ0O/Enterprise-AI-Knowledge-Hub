import React, { useState } from 'react';
import { Search, Sliders, Database, Zap, Layers, FileText, ArrowUpDown } from 'lucide-react';
import { api, SearchHit } from '../utils/api';

export const SearchInspector: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setSearched(true);
      const res = await api.search(query, limit);
      setResults(res);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header & Search Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Hybrid Search & Ranking Inspector</h2>
            <p className="text-sm text-gray-400 mt-1">
              Transparent multi-stage retrieval inspection: BGE-M3 Vector Search + BM25 Lexical + RRF Fusion + BGE-Reranker v2.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">Dense Vector</span>
            <span>+</span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">BM25 Lexical</span>
            <span>→</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Reranked</span>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search company policies, technical specifications, or compliance standards..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>
          <select
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            className="bg-black/40 border border-white/10 text-xs text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Retrieving...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Results List */}
      <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col overflow-hidden">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
          <span>Retrieved Candidates ({results.length})</span>
          {searched && (
            <span className="text-xs text-gray-400 font-normal">
              Showing top rank-fused and reranked chunks
            </span>
          )}
        </h3>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin">
          {results.length > 0 ? (
            results.map((hit, idx) => (
              <div key={hit.chunk_id || idx} className="p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/40 transition-all">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-500/30">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{hit.document_name || 'Document'}</h4>
                      <p className="text-xs text-gray-400">
                        Page {hit.page} {hit.section ? `• Section: ${hit.section}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Multi-Score Matrix */}
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300" title="Dense Vector Similarity">
                      Vector: {hit.semantic_score}
                    </div>
                    <div className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300" title="BM25 Lexical Score">
                      BM25: {hit.bm25_score}
                    </div>
                    <div className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300" title="Reciprocal Rank Fusion">
                      RRF: {hit.fused_score}
                    </div>
                    <div className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold" title="Final BGE Cross-Encoder Reranker Score">
                      Reranker: {hit.reranker_score}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 text-xs text-gray-300 leading-relaxed font-sans">
                  {hit.text}
                </div>
              </div>
            ))
          ) : searched && !loading ? (
            <div className="p-12 text-center text-gray-500">No matching chunks retrieved for this query.</div>
          ) : (
            <div className="p-12 text-center text-gray-500">Enter a query above to inspect hybrid scores and ranking.</div>
          )}
        </div>
      </div>
    </div>
  );
};
