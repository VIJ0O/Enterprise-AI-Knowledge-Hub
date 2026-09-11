import React from 'react';
import {
  FileText,
  MessageSquare,
  ShieldAlert,
  Search,
  ArrowRightLeft,
  AlignLeft,
  ShieldCheck,
  Plus,
  Trash2,
  Bot,
  User as UserIcon,
  LogOut,
  Layers,
  Sparkles
} from 'lucide-react';
import { User } from '../utils/api';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  conversations?: any[];
  currentConvId?: string;
  onSelectConv?: (id: string) => void;
  onNewChat?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  currentUser,
  onOpenAuth,
  onLogout,
  conversations = [],
  currentConvId,
  onSelectConv,
  onNewChat,
}) => {
  const navItems = [
    { id: 'chat', label: 'AI Chat & RAG', icon: MessageSquare },
    { id: 'documents', label: 'Documents Hub', icon: FileText },
    { id: 'viewer', label: 'Highlight Viewer', icon: Sparkles },
    { id: 'risk', label: 'Risk Intelligence', icon: ShieldAlert },
    { id: 'search', label: 'Search Inspector', icon: Search },
    { id: 'compare', label: 'Document Compare', icon: ArrowRightLeft },
    { id: 'summarize', label: 'Summarizer', icon: AlignLeft },
    { id: 'admin', label: 'Admin & Governance', icon: ShieldCheck, requiresAdmin: true },
  ];

  return (
    <div className="w-72 h-full flex flex-col border-r border-white/10 bg-zinc-950/90 glass-panel shadow-2xl">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white tracking-tight">EDI-GLOBE</h1>
            <p className="text-[11px] text-cyan-400 font-mono">Enterprise AI & RAG</p>
          </div>
        </div>
        
        <button
          onClick={onNewChat || (() => onViewChange('chat'))}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Query Session
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">
          Platform Capabilities
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        {/* Recent Chat History in Sidebar */}
        {conversations.length > 0 && currentView === 'chat' && (
          <div className="pt-4 mt-4 border-t border-white/10">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">
              Recent Conversations
            </div>
            <div className="space-y-1">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectConv && onSelectConv(c.id)}
                  className={`w-full p-2 rounded-lg text-left text-xs truncate transition-all ${
                    currentConvId === c.id
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Footer Profile & Auth Switch */}
      <div className="p-4 border-t border-white/10 bg-black/40">
        {currentUser ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentUser.full_name}</p>
                <p className="text-[10px] text-gray-400 uppercase font-mono">{currentUser.role} • {currentUser.department}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all flex items-center justify-center gap-2"
          >
            <UserIcon className="w-3.5 h-3.5" />
            Sign In / RBAC Access
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
