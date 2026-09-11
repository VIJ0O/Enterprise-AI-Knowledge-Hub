import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  Filter, 
  FileText, 
  ChevronRight, 
  Info,
  Layers,
  Sparkles,
  RefreshCw,
  Search
} from 'lucide-react';
import { api, RiskAnalysisResponse, RiskHighlight } from '../utils/api';

interface DocumentViewerProps {
  documentId: string;
  onBack?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentId, onBack }) => {
  const [docData, setDocData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<RiskAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHighlight, setSelectedHighlight] = useState<RiskHighlight | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [analyzing, setAnalyzing] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const loadDocumentAndAnalysis = async () => {
    try {
      setLoading(true);
      const [docRes, analysisRes] = await Promise.all([
        api.getDocument(documentId),
        api.getDocumentRiskAnalysis(documentId).catch(() => null)
      ]);
      setDocData(docRes);
      setAnalysis(analysisRes);
    } catch (err) {
      console.error('Failed to load document:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      loadDocumentAndAnalysis();
    }
  }, [documentId]);

  const handleReanalyze = async () => {
    try {
      setAnalyzing(true);
      await api.analyzeDocumentRisk(documentId);
      const updated = await api.getDocumentRiskAnalysis(documentId);
      setAnalysis(updated);
    } catch (err) {
      console.error('Re-analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'red':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            HIGH RISK
          </span>
        );
      case 'yellow':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            WARNING
          </span>
        );
      case 'green':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            POSITIVE
          </span>
        );
      default:
        return null;
    }
  };

  const highlights = analysis?.highlights || [];
  const filteredHighlights = highlights.filter(h => {
    const matchSev = severityFilter === 'all' || h.severity === severityFilter;
    const matchCat = categoryFilter === 'all' || h.category === categoryFilter;
    const matchSearch = !searchFilter || h.text.toLowerCase().includes(searchFilter.toLowerCase()) || h.reason.toLowerCase().includes(searchFilter.toLowerCase());
    return matchSev && matchCat && matchSearch;
  });

  const categories = Array.from(new Set(highlights.map(h => h.category)));

  // Render highlighted page text without altering original document text
  const renderHighlightedPageText = (pageText: string, pageNum: number) => {
    const pageHighlights = highlights.filter(h => h.page === pageNum && h.severity !== 'neutral');
    if (!pageHighlights.length) {
      return <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">{pageText}</div>;
    }

    // Sort highlights by occurrence or length
    return (
      <div className="text-gray-200 whitespace-pre-wrap leading-relaxed font-sans text-sm md:text-base">
        {pageText.split('\n\n').map((paragraph, pIdx) => {
          return (
            <p key={pIdx} className="mb-4">
              {paragraph.split('. ').map((sentence, sIdx) => {
                const cleanS = sentence.trim();
                const matched = pageHighlights.find(h => 
                  cleanS.length > 15 && (cleanS.includes(h.text) || h.text.includes(cleanS))
                );

                if (matched) {
                  let colorClass = "bg-red-500/20 border-b-2 border-red-500 text-red-100 hover:bg-red-500/30";
                  if (matched.severity === 'yellow') {
                    colorClass = "bg-amber-500/20 border-b-2 border-amber-500 text-amber-100 hover:bg-amber-500/30";
                  } else if (matched.severity === 'green') {
                    colorClass = "bg-emerald-500/20 border-b-2 border-emerald-500 text-emerald-100 hover:bg-emerald-500/30";
                  }

                  return (
                    <span
                      key={sIdx}
                      onClick={() => setSelectedHighlight(matched)}
                      className={`cursor-pointer px-1 py-0.5 rounded transition-all duration-150 inline ${colorClass}`}
                      title={`Click to inspect impact: ${matched.category}`}
                    >
                      {sentence}{sentence.endsWith('.') ? ' ' : '. '}
                    </span>
                  );
                }

                return <span key={sIdx}>{sentence}{sentence.endsWith('.') ? ' ' : '. '}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header & Controls */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors border border-white/10"
            >
              ← Back
            </button>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white tracking-tight">{docData?.title || 'Document Intelligence'}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {docData?.current_version || 'v1.0'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                {docData?.department || 'General'}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Sentence-level Impact & Risk Classification with Original Text Preservation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReanalyze}
            disabled={analyzing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
            {analyzing ? 'Analyzing Sentences...' : 'Run Risk Analysis'}
          </button>
        </div>
      </div>

      {/* Risk Metrics Summary Banner */}
      {analysis?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-red-500/30 bg-red-950/20 flex items-center justify-between">
            <div>
              <p className="text-xs text-red-300 font-medium">🔴 HIGH RISK (RED)</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{analysis.summary.red_count}</p>
            </div>
            <ShieldAlert className="w-8 h-8 text-red-400/60" />
          </div>
          <div className="glass-panel p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-300 font-medium">🟡 WARNINGS (YELLOW)</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{analysis.summary.yellow_count}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-400/60" />
          </div>
          <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-300 font-medium">🟢 POSITIVE (GREEN)</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{analysis.summary.green_count}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-400/60" />
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-300 font-medium">TOTAL SENTENCES</p>
              <p className="text-2xl font-bold text-white mt-1">{analysis.summary.total_sentences || docData?.pages?.length || 0}</p>
            </div>
            <Layers className="w-8 h-8 text-gray-400/60" />
          </div>
        </div>
      )}

      {/* Main Content Area: Document Text Viewer & Inspector Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left 2 Cols: Document Reader */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Original Document Content
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500"></span> Red = High Risk</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Yellow = Warning</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Green = Positive</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin">
            {docData?.pages && docData.pages.length > 0 ? (
              docData.pages.map((p: any) => (
                <div key={p.page} className="bg-white/[0.02] border border-white/5 p-6 rounded-xl relative">
                  <div className="absolute top-4 right-4 text-xs font-mono px-2 py-1 rounded bg-white/10 text-gray-400">
                    Page {p.page}
                  </div>
                  {renderHighlightedPageText(p.text, p.page)}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">No page content available for this document.</div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Filterable Findings & Selected Highlight Detail */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col overflow-hidden">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Impact Findings & Inspector
          </h3>

          {/* Filtering Bar */}
          <div className="space-y-3 mb-4">
            <div className="flex gap-2">
              {['all', 'red', 'yellow', 'green'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                    severityFilter === sev
                      ? 'bg-cyan-500 text-black font-bold shadow'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-xs text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Highlight Detail Inspector Card */}
          <AnimatePresence>
            {selectedHighlight && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 rounded-xl border bg-black/60 shadow-xl border-cyan-500/40 relative"
              >
                <button
                  onClick={() => setSelectedHighlight(null)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white text-xs"
                >
                  ✕
                </button>

                <div className="flex items-center justify-between mb-2">
                  {getSeverityBadge(selectedHighlight.severity)}
                  <span className="text-xs font-mono text-cyan-400">
                    {Math.round(selectedHighlight.confidence * 100)}% Confidence
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-400 font-medium">Category: </span>
                    <span className="text-white font-semibold">{selectedHighlight.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Location: </span>
                    <span className="text-gray-300">Page {selectedHighlight.page}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-gray-300 italic mb-1">"{selectedHighlight.text}"</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block mb-1">Impact Reason:</span>
                    <p className="text-gray-200 leading-relaxed bg-black/40 p-2 rounded border border-white/5">
                      {selectedHighlight.reason}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Findings List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
            {filteredHighlights.length > 0 ? (
              filteredHighlights.map((h, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedHighlight(h)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedHighlight?.text === h.text
                      ? 'border-cyan-500 bg-cyan-950/30'
                      : h.severity === 'red'
                      ? 'border-red-500/20 bg-red-950/10 hover:border-red-500/40'
                      : h.severity === 'yellow'
                      ? 'border-amber-500/20 bg-amber-950/10 hover:border-amber-500/40'
                      : 'border-emerald-500/20 bg-emerald-950/10 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    {getSeverityBadge(h.severity)}
                    <span className="text-gray-400">Page {h.page}</span>
                  </div>
                  <p className="text-xs text-gray-200 line-clamp-2 mb-1">{h.text}</p>
                  <p className="text-[11px] text-gray-400 flex items-center justify-between">
                    <span>{h.category}</span>
                    <span className="font-mono text-gray-500">{Math.round(h.confidence * 100)}%</span>
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-gray-500">
                No highlighted statements matching current filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
