export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: 'processing' | 'ready' | 'error';
  lastModified?: string;
  pages?: number;
  characters?: number;
  words?: number;
  sentences?: number;
  paragraphs?: number;
  readingTime?: number;
  chunks?: number;
  chunkSize?: number;
  chunkOverlap?: number;
  embeddingModel?: string;
  totalEmbeddings?: number;
  vectorCount?: number;
  processingTime?: number;
  language?: string;
  metadata?: Record<string, any>;
  ocrStatus?: 'available' | 'not_available' | 'processing';
  indexStatus?: 'indexed' | 'indexing' | 'failed';
  lastQueryTime?: string;
  searchCount?: number;
  chatCount?: number;
  mostReferencedPages?: number[];
  sourceUsageCount?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: string;
  confidenceScore?: number;
  isStreaming?: boolean;
}

export interface Source {
  id: string;
  documentId: string;
  documentName: string;
  content: string;
  page?: number;
  score?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  isFavorite?: boolean;
  isPinned?: boolean;
}

export interface DashboardStats {
  totalDocuments: number;
  totalChunks: number;
  totalEmbeddings: number;
  storageUsed: number;
  totalConversations: number;
  averageResponseTime: number;
  averageRetrievalTime: number;
  mostAccessedDocuments: Document[];
  recentUploads: Document[];
  recentSearches: string[];
  popularQuestions: string[];
  processingQueue: number;
  systemStatus: 'online' | 'degraded' | 'offline';
}

export interface StorageInfo {
  totalDocuments: number;
  totalStorageUsed: number;
  remainingStorage: number;
  databaseSize: number;
  vectorDatabaseSize: number;
  embeddingStorage: number;
  averageDocumentSize: number;
  largestDocument: Document | null;
  smallestDocument: Document | null;
  storageGrowth: number;
  uploadTrends: { date: string; count: number }[];
}

export interface AIRecommendations {
  suggestedQuestions: string[];
  relatedTopics: string[];
  recommendedDocuments: Document[];
  popularQuestions: string[];
  frequentlyAccessedFiles: Document[];
  recentlyViewedDocuments: Document[];
  aiInsights: string[];
  documentSummary: string;
  keyTopics: string[];
  importantKeywords: string[];
  namedEntities: string[];
  suggestedFollowUpQuestions: string[];
  knowledgeGraphSuggestions: string[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timeZone: string;
  autoSave: boolean;
  notifications: boolean;
  primaryColor: string;
  accentColor: string;
  animationSpeed: 'slow' | 'normal' | 'fast';
  sidebarStyle: 'compact' | 'normal' | 'expanded';
  defaultLLM: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  streamingMode: boolean;
  conversationMemory: number;
  recommendationsEnabled: boolean;
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;
  retrieverType: string;
  similarityTopK: number;
  similarityThreshold: number;
  vectorDatabase: string;
  uploadLimit: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  debugMode: boolean;
  logging: boolean;
  performanceMonitor: boolean;
  openAiApiKey: string;
  geminiApiKey: string;
}
