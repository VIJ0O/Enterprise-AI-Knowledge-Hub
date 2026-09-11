import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  FileText, 
  Loader2, 
  ThumbsUp, 
  ThumbsDown, 
  Check, 
  ShieldAlert, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api, Citation } from '../utils/api';

export interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Citation[];
  confidence?: number;
  rewritten_query?: string;
  latency_seconds?: number;
  timestamp: string;
  feedback?: 'positive' | 'negative';
}

interface ChatInterfaceProps {
  messages: ChatMsg[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  conversationId?: string;
  onSelectDocument?: (docId: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  conversationId,
  onSelectDocument,
}) => {
  const [input, setInput] = useState('');
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleFeedback = async (msg: ChatMsg, isPositive: boolean) => {
    msg.feedback = isPositive ? 'positive' : 'negative';
    try {
      await api.submitFeedback({
        question: 'User Query',
        answer: msg.content,
        is_positive: isPositive,
        conversation_id: conversationId,
        sources: msg.sources,
        latency_seconds: msg.latency_seconds,
      });
    } catch (err) {
      console.error('Feedback submission failed:', err);
    }
  };

  const toggleSourceExpand = (msgId: string) => {
    setExpandedSources(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div className="h-full flex flex-col glass-panel border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/20">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Enterprise Document Intelligence & RAG
            </h2>
            <p className="text-sm text-gray-400 max-w-lg mb-6 leading-relaxed">
              Ask natural-language questions across authorized company policies, technical manuals, and SOPs. Grounded answers with verified citations and hallucination protection.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full text-left text-xs">
              {[
                "What happens if an employee fails mandatory security training?",
                "What is the standard processing time for finance reimbursements?",
                "What benefits do employees receive for security certifications?",
                "Compare leave policies across our HR documentation."
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(example)}
                  className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-gray-300 text-left transition-all hover:border-cyan-500/40"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-3xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl rounded-tr-sm p-4 shadow-xl'
                      : 'bg-zinc-900/90 border border-white/10 text-gray-100 rounded-2xl rounded-tl-sm p-5 shadow-xl'
                  }`}
                >
                  {/* Rewritten Query Pill */}
                  {message.role === 'assistant' && message.rewritten_query && message.rewritten_query !== '' && (
                    <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 text-[11px] text-cyan-300 border border-cyan-500/20">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Search Formulation: "{message.rewritten_query}"</span>
                    </div>
                  )}

                  {/* Main Answer Content */}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {message.content}
                  </div>

                  {/* Assistant Footer: Sources, Confidence, Feedback */}
                  {message.role === 'assistant' && (
                    <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-3">
                      {/* Telemetry row */}
                      <div className="flex flex-wrap items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                          {message.confidence !== undefined && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono">
                              {Math.round(message.confidence * 100)}% Confidence
                            </span>
                          )}
                          {message.latency_seconds !== undefined && (
                            <span className="text-[11px] text-gray-500 font-mono">
                              {message.latency_seconds}s latency
                            </span>
                          )}
                        </div>

                        {/* Feedback Rating */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-500">Helpful?</span>
                          <button
                            onClick={() => handleFeedback(message, true)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              message.feedback === 'positive'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400'
                            }`}
                            title="Helpful Answer"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleFeedback(message, false)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              message.feedback === 'negative'
                                ? 'bg-red-500/20 border-red-500 text-red-400'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400'
                            }`}
                            title="Unhelpful Answer"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Source Citations Drawer */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-1">
                          <button
                            onClick={() => toggleSourceExpand(message.id)}
                            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{message.sources.length} Grounded Source Citations</span>
                            {expandedSources[message.id] ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {expandedSources[message.id] && (
                            <div className="mt-2 space-y-2">
                              {message.sources.map((src, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs"
                                >
                                  <div className="flex items-center justify-between font-semibold text-white mb-1">
                                    <span className="flex items-center gap-1.5 text-cyan-300">
                                      <FileText className="w-3.5 h-3.5" />
                                      {src.document_name}
                                    </span>
                                    <span className="text-[11px] font-mono text-gray-400">
                                      Page {src.page} • {src.version || 'v1.0'}
                                    </span>
                                  </div>
                                  {src.section && (
                                    <p className="text-[11px] text-gray-400 mb-1">Section: {src.section}</p>
                                  )}
                                  <p className="text-gray-300 italic text-[11px] bg-white/[0.02] p-2 rounded border border-white/5">
                                    "{src.snippet}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                    <UserIcon className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-zinc-900/90 border border-white/10 rounded-2xl rounded-tl-sm p-4 shadow-xl flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span className="text-xs text-gray-400 font-mono">
                    Searching vectors & BGE reranking context...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a factual question based on authorized company documents..."
              className="w-full pl-5 pr-14 py-3.5 rounded-xl border border-white/10 bg-black/50 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm shadow-inner"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
