/**
 * Enterprise Document Intelligence & Advanced RAG API Client
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'employee' | 'manager' | 'hr' | 'finance' | 'it' | 'administrator';
  department: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  filename: string;
  file_type?: string;
  file_size?: number;
  department: string;
  access_level: string;
  current_version: string;
  created_at: string;
}

export interface Citation {
  document_id: string;
  document_name: string;
  version: string;
  page: number;
  section: string;
  snippet: string;
  score: number;
}

export interface ChatResponse {
  answer: string;
  sources: Citation[];
  confidence: number;
  retrieved_documents: any[];
  conversation_id: string;
  session_id?: string;
  latency_seconds: number;
  rewritten_query?: string;
}

export interface RiskHighlight {
  id?: string;
  text: string;
  severity: 'red' | 'yellow' | 'green' | 'neutral';
  category: string;
  reason: string;
  confidence: number;
  page: number;
  sentence_index?: number;
  metadata?: any;
}

export interface RiskAnalysisResponse {
  document_id: string;
  document_name: string;
  highlights: RiskHighlight[];
  summary: {
    total_sentences: number;
    red_count: number;
    yellow_count: number;
    green_count: number;
    neutral_count: number;
    overall_risk_level: string;
    categories: Record<string, number>;
    high_risk_items: RiskHighlight[];
  };
}

export interface SearchHit {
  chunk_id: string;
  document_id: string;
  document_name: string;
  page: number;
  section: string;
  text: string;
  semantic_score: number;
  bm25_score: number;
  fused_score: number;
  reranker_score: number;
}

class ApiService {
  private token: string | null = localStorage.getItem('auth_token');

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      console.warn(`API request to ${endpoint} failed:`, err.message);
      throw err;
    }
  }

  // Auth
  async login(email: string, password: string) {
    const res = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async register(data: { email: string; password: string; full_name: string; role: string; department: string }) {
    const res = await this.request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Documents
  async uploadDocument(file: File, department: string, accessLevel: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('department', department);
    formData.append('access_level', accessLevel);

    return this.request<any>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async listDocuments(department?: string): Promise<{ documents: DocumentItem[]; total: number }> {
    const query = department ? `?department=${encodeURIComponent(department)}` : '';
    return this.request<{ documents: DocumentItem[]; total: number }>(`/documents${query}`);
  }

  async getDocument(id: string): Promise<any> {
    return this.request<any>(`/documents/${id}`);
  }

  async deleteDocument(id: string) {
    return this.request<any>(`/documents/${id}`, { method: 'DELETE' });
  }

  // Chat & RAG
  async sendChat(question: string, conversationId?: string, documentIds?: string[]): Promise<ChatResponse> {
    return this.request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({
        question,
        conversation_id: conversationId,
        document_ids: documentIds,
      }),
    });
  }

  async listConversations(): Promise<any[]> {
    return this.request<any[]>('/chat/conversations');
  }

  async getConversation(id: string): Promise<any> {
    return this.request<any>(`/chat/conversations/${id}`);
  }

  // Search Inspection
  async search(query: string, limit = 10, documentIds?: string[]): Promise<SearchHit[]> {
    return this.request<SearchHit[]>('/search', {
      method: 'POST',
      body: JSON.stringify({ query, limit, document_ids: documentIds }),
    });
  }

  // Summarize & Compare
  async summarize(documentId?: string, text?: string): Promise<{ summary: string }> {
    return this.request<{ summary: string }>('/summarize', {
      method: 'POST',
      body: JSON.stringify({ document_id: documentId, text }),
    });
  }

  async compare(documentIds: string[], topic: string): Promise<{ comparison: string; topic: string }> {
    return this.request<{ comparison: string; topic: string }>('/compare', {
      method: 'POST',
      body: JSON.stringify({ document_ids: documentIds, topic }),
    });
  }

  // Risk Analysis
  async analyzeDocumentRisk(documentId: string): Promise<any> {
    return this.request<any>(`/analysis/document/${documentId}`, { method: 'POST' });
  }

  async getDocumentRiskAnalysis(documentId: string, severity?: string, category?: string): Promise<RiskAnalysisResponse> {
    const params = new URLSearchParams();
    if (severity && severity !== 'all') params.append('severity', severity);
    if (category && category !== 'all') params.append('category', category);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<RiskAnalysisResponse>(`/analysis/document/${documentId}${qs}`);
  }

  async getRiskStats(): Promise<any> {
    return this.request<any>('/analysis/stats');
  }

  // Feedback
  async submitFeedback(data: {
    question: string;
    answer: string;
    is_positive: boolean;
    feedback_text?: string;
    conversation_id?: string;
    sources?: any[];
    latency_seconds?: number;
  }) {
    return this.request<any>('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin & Evaluation
  async getAdminDashboard(): Promise<any> {
    return this.request<any>('/admin/dashboard');
  }

  async listUsers(): Promise<any[]> {
    return this.request<any[]>('/admin/users');
  }

  async getAuditLogs(): Promise<any> {
    return this.request<any>('/admin/audit-logs');
  }

  async deleteConversation(id: string): Promise<any> {
    return this.request<any>(`/chat/conversations/${id}`, { method: 'DELETE' });
  }

  async runRiskEvaluation(): Promise<any> {
    return this.request<any>('/evaluation/risk');
  }

  async runRagEvaluation(k = 5): Promise<any> {
    return this.request<any>(`/evaluation/rag?k=${k}`);
  }
}

export const api = new ApiService();

// Export named function wrappers for backwards compatibility
export const getDocuments = async (opts?: any): Promise<any> => {
  const res = await api.listDocuments(opts);
  return res.documents || [];
};
export const uploadDocument = (file: File, department?: string, access_level?: string) => api.uploadDocument(file, department || 'General', access_level || 'internal');
export const deleteDocument = (id: string) => api.deleteDocument(id);
export const sendMessage = (message: string, conversation_id?: string, options?: any) => api.sendChat(message, conversation_id, options?.document_ids);
export const getChatSessions = () => api.listConversations();
export const deleteChatSession = (id: string) => api.deleteConversation(id);
export const exportMetadata = async () => ({ status: 'success', data: {} });
export const importMetadata = async (_data: any) => ({ status: 'success', imported_documents: 0, imported_sessions: 0 });
export const deleteAllDocuments = async () => ({ status: 'success', count: 0 });


