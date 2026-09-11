import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import ChatInterface, { ChatMsg } from './components/ChatInterface';
import DocumentUploader from './components/DocumentUploader';
import { DocumentViewer } from './components/DocumentViewer';
import { RiskDashboard } from './components/RiskDashboard';
import { SearchInspector } from './components/SearchInspector';
import { CompareView } from './components/CompareView';
import { SummarizeView } from './components/SummarizeView';
import { AdminView } from './components/AdminView';
import { AuthModal } from './components/AuthModal';
import ThreeScene from './components/ThreeScene';
import { api, DocumentItem, User } from './utils/api';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('chat');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize Auth & Documents
  useEffect(() => {
    api.getMe()
      .then(user => setCurrentUser(user))
      .catch(() => {
        // Not logged in or dev mode
        setCurrentUser({
          id: 'dev_user_01',
          email: 'admin@edi-globe.local',
          full_name: 'Lead Compliance Architect',
          role: 'administrator',
          department: 'Enterprise Security'
        });
      });

    loadDocuments();
    loadConversations();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await api.listDocuments();
      setDocuments(res.documents || []);
    } catch (err) {
      console.warn('Failed to load documents list:', err);
    }
  };

  const loadConversations = async () => {
    try {
      const res = await api.listConversations();
      setConversations(res || []);
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMsg = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.sendChat(text, currentConvId);
      setCurrentConvId(res.conversation_id);

      const assistantMsg: ChatMsg = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: res.answer,
        sources: res.sources,
        confidence: res.confidence,
        rewritten_query: res.rewritten_query,
        latency_seconds: res.latency_seconds,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMsg]);
      loadConversations();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error generating AI response');
      const errorMsg: ChatMsg = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: `Error: ${err.message || 'Could not connect to document intelligence backend.'}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleUploadDocument = async (file: File, department: string, accessLevel: string) => {
    try {
      await api.uploadDocument(file, department, accessLevel);
      await loadDocuments();
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await api.deleteDocument(docId);
      await loadDocuments();
      if (selectedDocId === docId) setSelectedDocId(null);
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleOpenViewer = (docId: string) => {
    setSelectedDocId(docId);
    setCurrentView('viewer');
  };

  const handleNewChat = () => {
    setCurrentConvId(undefined);
    setMessages([]);
    setCurrentView('chat');
  };

  const handleSelectConv = async (convId: string) => {
    setCurrentConvId(convId);
    try {
      const res = await api.getConversation(convId);
      if (res && res.messages) {
        setMessages(res.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          sources: m.sources,
          timestamp: m.created_at
        })));
      }
    } catch (err) {
      console.error('Failed to load conversation history:', err);
    }
    setCurrentView('chat');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'viewer':
        return (
          <DocumentViewer
            documentId={selectedDocId || (documents[0]?.id || '')}
            onBack={() => setCurrentView('documents')}
          />
        );
      case 'documents':
        return (
          <DocumentUploader
            documents={documents}
            onUpload={handleUploadDocument}
            onDelete={handleDeleteDocument}
            onOpenViewer={handleOpenViewer}
          />
        );
      case 'risk':
        return (
          <RiskDashboard
            onSelectDocument={handleOpenViewer}
          />
        );
      case 'search':
        return <SearchInspector />;
      case 'compare':
        return <CompareView />;
      case 'summarize':
        return <SummarizeView />;
      case 'admin':
        return <AdminView />;
      case 'chat':
      default:
        return (
          <ChatInterface
            messages={messages}
            isLoading={isChatLoading}
            onSendMessage={handleSendMessage}
            conversationId={currentConvId}
            onSelectDocument={handleOpenViewer}
          />
        );
    }
  };

  return (
    <div className="relative h-screen overflow-hidden bg-[#020617] text-gray-100 font-sans">
      {/* 3D Interactive Background Globe */}
      <ThreeScene />

      {/* Backdrop Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_top,_rgba(6,182,212,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(147,51,234,0.12),_transparent_50%)]"
      />

      <div className="h-screen flex relative z-10 p-4 gap-4">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onViewChange={(v) => {
            setCurrentView(v);
            if (v !== 'viewer') setSelectedDocId(null);
          }}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={() => {
            api.setToken(null);
            setCurrentUser(null);
          }}
          conversations={conversations}
          currentConvId={currentConvId}
          onSelectConv={handleSelectConv}
          onNewChat={handleNewChat}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView + (selectedDocId || '')}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="h-full min-w-0 flex flex-col"
            >
              {renderCurrentView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Auth / RBAC Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
};

export default App;
