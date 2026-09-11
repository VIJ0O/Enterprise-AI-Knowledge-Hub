import { useState, useEffect } from 'react';
import { ChatSession, Message } from '../utils/types';
import * as api from '../utils/api';

export const useChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = async () => {
    try {
      setError(null);
      const s = await api.getChatSessions();
      setSessions(s);
    } catch (err) {
      setError('Failed to load chat sessions.');
      console.error('Failed to load chat sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const createNewSession = () => {
    const session: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setSessions([session, ...sessions]);
    setCurrentSessionId(session.id);
    setError(null);
  };

  const deleteSession = async (sessionId: string) => {
    try {
      setError(null);
      await api.deleteChatSession(sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }
    } catch (err) {
      setError('Failed to delete chat session.');
      console.error('Failed to delete session:', err);
    }
  };

  const sendMessage = async (content: string) => {
    const sessionId = currentSessionId ?? Date.now().toString();

    if (!currentSessionId) {
      const session: ChatSession = {
        id: sessionId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
      };
      setSessions((prev) => [session, ...prev]);
      setCurrentSessionId(sessionId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    // Optimistic update
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              title: s.messages.length === 0 ? content.slice(0, 30) + '...' : s.title,
              messages: [...s.messages, userMessage],
            }
          : s
      )
    );

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.sendMessage(content, sessionId);
      
      // Update the session with the real ID if a new one was created
      if (!currentSessionId) {
        setCurrentSessionId(response.session_id);
      }

      await loadSessions();
    } catch (err) {
      setError('Failed to send message. Please check your API key and try again.');
      console.error('Failed to send message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  return {
    sessions,
    currentSessionId,
    currentSession,
    isLoading,
    loadingSessions,
    error,
    setCurrentSessionId,
    createNewSession,
    deleteSession,
    sendMessage,
    refresh: loadSessions,
  };
};
