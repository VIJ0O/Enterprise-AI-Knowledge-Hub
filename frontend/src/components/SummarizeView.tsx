import React, { useState, useEffect } from 'react';
import { AlignLeft, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { api, DocumentItem } from '../utils/api';

export const SummarizeView: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [customText, setCustomText] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listDocuments().then(res => setDocuments(res.documents || [])).catch(() => {});
  }, []);

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId && !customText.trim()) return;

    try {
      setLoading(true);
      const res = await api.summarize(selectedDocId || undefined, customText || undefined);
      setSummary(res.summary);
    } catch (err: any) {
      alert(err.message || 'Summarization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <AlignLeft className="w-6 h-6 text-cyan-400" />
          Enterprise Document Summarization
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Generate factually grounded executive summaries, key policy takeaways, and operational timelines.
        </p>

        <form onSubmit={handleSummarize} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Option A: Select an authorized document
              </label>
              <select
                value={selectedDocId}
                onChange={e => {
                  setSelectedDocId(e.target.value);
                  if (e.target.value) setCustomText('');
                }}
                className="w-full bg-black/40 border border-white/10 text-sm text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Choose Document --</option>
                {documents.map(d => (
                  <option key={d.id} value={d.id}>{d.title} ({d.department} • {d.current_version})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Option B: Or paste custom text excerpt
              </label>
              <textarea
                rows={3}
                value={customText}
                onChange={e => {
                  setCustomText(e.target.value);
                  if (e.target.value) setSelectedDocId('');
                }}
                placeholder="Paste contract clauses, policy updates, or meeting minutes here..."
                className="w-full bg-black/40 border border-white/10 text-sm text-gray-300 rounded-xl p-3 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || (!selectedDocId && !customText.trim())}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Summarizing...' : 'Generate Executive Summary'}
            </button>
          </div>
        </form>
      </div>

      {/* Summary Output */}
      <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col overflow-hidden">
        <h3 className="text-lg font-semibold text-white mb-4">Executive Grounded Summary</h3>
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
          {summary ? (
            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {summary}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 text-sm">
              Select a document or provide text above to generate summary.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
