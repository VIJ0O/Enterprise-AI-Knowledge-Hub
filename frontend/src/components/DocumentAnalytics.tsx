import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Calendar,
  Type,
  AlignLeft,
  FileSearch,
  Database,
  Activity,
  Clock,
  Hash,
  BookOpen,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Document } from '../utils/types';

interface DocumentAnalyticsProps {
  doc: Document;
}

const DocumentAnalytics: React.FC<DocumentAnalyticsProps> = ({ doc }) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateReadingTime = (words: number = 0): number => Math.ceil(words / 200);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Document Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Detailed analysis for: {doc.name}</p>
        </motion.div>

        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <FileText className="w-6 h-6 text-indigo-500 mr-2" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Document Name', value: doc.name, icon: FileText },
              { label: 'File Type', value: doc.type.split('/')[1]?.toUpperCase() || doc.type, icon: FileText },
              { label: 'MIME Type', value: doc.type, icon: FileSearch },
              { label: 'File Size', value: formatBytes(doc.size), icon: Database },
              { label: 'Upload Date', value: new Date(doc.uploadedAt).toLocaleString(), icon: Calendar },
              { label: 'Language', value: doc.language || 'English', icon: Type }
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center mb-2">
                  <item.icon className="w-4 h-4 text-indigo-500 mr-2" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.label}</span>
                </div>
                <p className="text-gray-800 dark:text-white text-sm truncate">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Content Analysis */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <AlignLeft className="w-6 h-6 text-purple-500 mr-2" />
            Content Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Pages', value: doc.pages || 1, icon: BookOpen, color: 'text-blue-500' },
              { label: 'Total Characters', value: doc.characters || Math.floor(doc.size / 2), icon: Type, color: 'text-purple-500' },
              { label: 'Total Words', value: doc.words || Math.floor(doc.size / 5), icon: Hash, color: 'text-cyan-500' },
              { label: 'Est. Reading Time', value: `${calculateReadingTime(doc.words || Math.floor(doc.size / 5))} min`, icon: Clock, color: 'text-green-500' }
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-3">
                  <item.icon className={`w-5 h-5 ${item.color} mr-2`} />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Processing Info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <Database className="w-6 h-6 text-cyan-500 mr-2" />
            Processing & Storage
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Number of Chunks', value: doc.chunks || Math.floor(doc.size / 1000) + 1, icon: Database },
              { label: 'Chunk Size', value: `${doc.chunkSize || 1000} tokens`, icon: Hash },
              { label: 'Chunk Overlap', value: `${doc.chunkOverlap || 200} tokens`, icon: AlignLeft },
              { label: 'Embedding Model', value: doc.embeddingModel || 'text-embedding-ada-002', icon: Activity },
              { label: 'Total Embeddings', value: doc.totalEmbeddings || doc.chunks || Math.floor(doc.size / 1000) + 1, icon: Activity },
              { label: 'Vector Count', value: doc.vectorCount || doc.chunks || Math.floor(doc.size / 1000) + 1, icon: Database }
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center mb-2">
                  <item.icon className="w-4 h-4 text-cyan-500 mr-2" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.label}</span>
                </div>
                <p className="text-gray-800 dark:text-white text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Status & Usage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <Activity className="w-6 h-6 text-green-500 mr-2" />
            Status & Usage
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Upload Status', value: 'Success', icon: CheckCircle2, color: 'text-green-500' },
              { label: 'Processing Status', value: doc.status === 'ready' ? 'Complete' : doc.status, icon: doc.status === 'ready' ? CheckCircle2 : XCircle, color: doc.status === 'ready' ? 'text-green-500' : 'text-yellow-500' },
              { label: 'Index Status', value: 'Indexed', icon: CheckCircle2, color: 'text-green-500' },
              { label: 'OCR Status', value: doc.ocrStatus || 'Not Available', icon: FileSearch, color: 'text-gray-500' },
              { label: 'Number of Searches', value: doc.searchCount || 0, icon: Activity, color: 'text-blue-500' },
              { label: 'Number of AI Chats', value: doc.chatCount || 0, icon: Activity, color: 'text-purple-500' },
              { label: 'Source Usage Count', value: doc.sourceUsageCount || 0, icon: Activity, color: 'text-cyan-500' },
              { label: 'Last Query Time', value: doc.lastQueryTime ? new Date(doc.lastQueryTime).toLocaleString() : 'Never', icon: Clock, color: 'text-gray-500' }
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-3">
                  <item.icon className={`w-5 h-5 ${item.color} mr-2`} />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.label}</span>
                </div>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentAnalytics;
