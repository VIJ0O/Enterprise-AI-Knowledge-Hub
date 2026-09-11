import React from 'react';
import { motion } from 'framer-motion';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  FileText,
  Database,
  MessageSquare,
  Clock,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { DashboardStats, StorageInfo, Document } from '../utils/types';

interface DashboardProps {
  docs: Document[];
  sessions: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ docs, sessions }) => {
  // Generate dummy stats
  const stats: DashboardStats = {
    totalDocuments: docs.length,
    totalChunks: docs.length * 10,
    totalEmbeddings: docs.length * 10,
    storageUsed: docs.reduce((sum, d) => sum + d.size, 0),
    totalConversations: sessions.length,
    averageResponseTime: 1.2,
    averageRetrievalTime: 0.3,
    mostAccessedDocuments: docs.slice(0, 5),
    recentUploads: docs.slice(0, 5),
    recentSearches: ['What is RAG?', 'How does AI work?', 'Document management'],
    popularQuestions: ['What is the purpose of this system?', 'How to upload documents?', 'How to use RAG?'],
    processingQueue: 0,
    systemStatus: 'online'
  };

  const storageInfo: StorageInfo = {
    totalDocuments: docs.length,
    totalStorageUsed: stats.storageUsed,
    remainingStorage: 1024 * 1024 * 1024 * 10, // 10 GB
    databaseSize: docs.length * 1024 * 10,
    vectorDatabaseSize: docs.length * 1024 * 5,
    embeddingStorage: docs.length * 1024 * 3,
    averageDocumentSize: docs.length > 0 ? stats.storageUsed / docs.length : 0,
    largestDocument: docs.length > 0 ? docs.reduce((max, d) => d.size > max.size ? d : max) : null,
    smallestDocument: docs.length > 0 ? docs.reduce((min, d) => d.size < min.size ? d : min) : null,
    storageGrowth: 5,
    uploadTrends: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      count: Math.floor(Math.random() * 10)
    }))
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  const activityData = [
    { name: 'Mon', uploads: Math.floor(Math.random() * 10), chats: Math.floor(Math.random() * 15) },
    { name: 'Tue', uploads: Math.floor(Math.random() * 10), chats: Math.floor(Math.random() * 15) },
    { name: 'Wed', uploads: Math.floor(Math.random() * 10), chats: Math.floor(Math.random() * 15) },
    { name: 'Thu', uploads: Math.floor(Math.random() * 10), chats: Math.floor(Math.random() * 15) },
    { name: 'Fri', uploads: Math.floor(Math.random() * 10), chats: Math.floor(Math.random() * 15) },
    { name: 'Sat', uploads: Math.floor(Math.random() * 5), chats: Math.floor(Math.random() * 8) },
    { name: 'Sun', uploads: Math.floor(Math.random() * 5), chats: Math.floor(Math.random() * 8) }
  ];

  const fileTypeData = [
    { name: 'PDF', value: docs.filter(d => d.type.includes('pdf')).length || 2 },
    { name: 'DOCX', value: docs.filter(d => d.type.includes('word') || d.name.endsWith('.docx')).length || 1 },
    { name: 'TXT', value: docs.filter(d => d.type.includes('text') || d.name.endsWith('.txt')).length || 1 },
    { name: 'MD', value: docs.filter(d => d.name.endsWith('.md')).length || 0 },
    { name: 'Other', value: docs.length > 0 ? docs.length - (docs.filter(d => d.type.includes('pdf') || d.type.includes('word') || d.type.includes('text') || d.name.endsWith('.md')).length) : 1 }
  ];

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const StatusIcon = () => {
    if (stats.systemStatus === 'online') return <CheckCircle2 className="text-green-500" />;
    if (stats.systemStatus === 'degraded') return <AlertCircle className="text-yellow-500" />;
    return <XCircle className="text-red-500" />;
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor your AI knowledge hub performance</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Documents', value: stats.totalDocuments, icon: FileText, color: 'from-blue-500 to-blue-600' },
            { title: 'Total Conversations', value: stats.totalConversations, icon: MessageSquare, color: 'from-purple-500 to-purple-600' },
            { title: 'Storage Used', value: formatBytes(storageInfo.totalStorageUsed), icon: Database, color: 'from-cyan-500 to-cyan-600' },
            { title: 'Average Response Time', value: `${stats.averageResponseTime}s`, icon: Clock, color: 'from-green-500 to-green-600' }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                </div>
              </div>
              <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+12% from last week</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Activity Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line type="monotone" dataKey="uploads" stroke="#6366f1" strokeWidth={2} fill="rgba(99, 102, 241, 0.1)" />
                  <Line type="monotone" dataKey="chats" stroke="#06b6d4" strokeWidth={2} fill="rgba(6, 182, 212, 0.1)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Document Types</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fileTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {fileTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recent Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Uploads</h3>
            <div className="space-y-3">
              {docs.length > 0 ? docs.slice(0, 5).map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-indigo-500 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm truncate max-w-xs">{doc.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(doc.size)}</span>
                </div>
              )) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No documents uploaded yet</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center">
                  <Activity className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-green-700 dark:text-green-300 text-sm">System Health</span>
                </div>
                <StatusIcon />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center">
                  <Database className="w-5 h-5 text-blue-500 mr-3" />
                  <span className="text-blue-700 dark:text-blue-300 text-sm">Vector Database</span>
                </div>
                <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded-full">Online</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-center">
                  <MessageSquare className="w-5 h-5 text-purple-500 mr-3" />
                  <span className="text-purple-700 dark:text-purple-300 text-sm">LLM Service</span>
                </div>
                <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-800 px-2 py-1 rounded-full">Ready</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
