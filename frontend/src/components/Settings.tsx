import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Palette,
  MessageSquare,
  Database,
  Shield,
  Code2,
  Save,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { AppSettings } from '../utils/types';
import * as api from '../utils/api';

interface SettingsProps {
  settings: AppSettings;
  onSettingsChange: (newSettings: Partial<AppSettings>) => void;
  onSave?: () => void;
  onReset?: () => void;
  onRefresh?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSettingsChange, onSave, onReset, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle switch component
  const Toggle = ({ value, onChange, label, description }: { value: boolean; onChange: () => void; label: string; description?: string }) => (
    <div className="flex items-center justify-between">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative w-14 h-7 rounded-full transition-colors ${
          value ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
          value ? 'translate-x-7' : 'translate-x-1'
        }`} />
      </button>
    </div>
  );

  // Status notification helper
  const showStatus = (message: string, type: 'success' | 'error') => {
    setStatusMessage(message);
    setStatusType(type);
    setTimeout(() => {
      setStatusMessage(null);
      setStatusType(null);
    }, 4000);
  };

  // Export metadata handler
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await api.exportMetadata();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knowledge-hub-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showStatus('Export successful!', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showStatus('Export failed. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Import metadata handler
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = await api.importMetadata(data);
      showStatus(`Successfully imported ${result.imported_documents} documents and ${result.imported_sessions} sessions!`, 'success');
      onRefresh?.();
    } catch (error) {
      console.error('Import failed:', error);
      showStatus('Import failed. Please check the file format.', 'error');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  // Delete all documents handler
  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL documents? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await api.deleteAllDocuments();
      showStatus(`Successfully deleted ${result.count} documents!`, 'success');
      onRefresh?.();
    } catch (error) {
      console.error('Delete failed:', error);
      showStatus('Delete failed. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'chat', name: 'Chat', icon: MessageSquare },
    { id: 'rag', name: 'RAG', icon: Database },
    { id: 'storage', name: 'Storage', icon: Database },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'developer', name: 'Developer', icon: Code2 }
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Customize your AI knowledge hub experience</p>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-b-2 border-indigo-600 dark:border-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
                  </div>
                  <select
                    value={settings.theme}
                    onChange={(e) => onSettingsChange({ theme: e.target.value as any })}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <Toggle
                  value={settings.autoSave}
                  onChange={() => onSettingsChange({ autoSave: !settings.autoSave })}
                  label="Auto Save"
                  description="Automatically save changes"
                />

                <Toggle
                  value={settings.notifications}
                  onChange={() => onSettingsChange({ notifications: !settings.notifications })}
                  label="Notifications"
                  description="Receive notifications"
                />
              </motion.div>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Color</label>
                  <div className="flex gap-3">
                    {['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'].map((color) => (
                      <button
                        key={color}
                        onClick={() => onSettingsChange({ primaryColor: color })}
                        className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                          settings.primaryColor === color ? 'border-gray-800 dark:border-white' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Animation Speed</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Adjust UI animation speed</p>
                  </div>
                  <select
                    value={settings.animationSpeed}
                    onChange={(e) => onSettingsChange({ animationSpeed: e.target.value as any })}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="slow">Slow</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Chat Settings */}
            {activeTab === 'chat' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Temperature</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Controls randomness (0-2)</p>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) => onSettingsChange({ temperature: parseFloat(e.target.value) })}
                    className="w-48"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Tokens</label>
                  <input
                    type="number"
                    value={settings.maxTokens}
                    onChange={(e) => onSettingsChange({ maxTokens: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <Toggle
                  value={settings.streamingMode}
                  onChange={() => onSettingsChange({ streamingMode: !settings.streamingMode })}
                  label="Streaming Mode"
                  description="Stream responses in real-time"
                />
              </motion.div>
            )}

            {/* RAG Settings */}
            {activeTab === 'rag' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chunk Size</label>
                  <input
                    type="number"
                    value={settings.chunkSize}
                    onChange={(e) => onSettingsChange({ chunkSize: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chunk Overlap</label>
                  <input
                    type="number"
                    value={settings.chunkOverlap}
                    onChange={(e) => onSettingsChange({ chunkOverlap: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Similarity Top K</label>
                  <input
                    type="number"
                    value={settings.similarityTopK}
                    onChange={(e) => onSettingsChange({ similarityTopK: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </motion.div>
            )}

            {/* Storage Settings */}
            {activeTab === 'storage' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Status Message */}
                {statusMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg flex items-center ${
                      statusType === 'success' 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    {statusType === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mr-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`font-medium ${statusType === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                      {statusMessage}
                    </span>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <button
                      onClick={handleExport}
                      disabled={isExporting}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
                    >
                      {isExporting ? (
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-5 h-5 mr-2" />
                      )}
                      {isExporting ? 'Exporting...' : 'Export Metadata'}
                    </button>
                    <button
                      onClick={handleImportClick}
                      disabled={isImporting}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                    >
                      {isImporting ? (
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5 mr-2" />
                      )}
                      {isImporting ? 'Importing...' : 'Import Metadata'}
                    </button>
                  </div>

                  <button
                    onClick={handleDeleteAll}
                    disabled={isDeleting}
                    className="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
                  >
                    {isDeleting ? (
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5 mr-2" />
                    )}
                    {isDeleting ? 'Deleting...' : 'Delete All Documents'}
                  </button>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />

                {/* Instructions */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">How it works</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Export: Saves all your documents and chat sessions to a JSON file</li>
                    <li>• Import: Loads documents and chat sessions from a previously exported JSON file</li>
                    <li>• Delete All: Permanently removes all uploaded documents (chat sessions remain)</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">OpenAI API Key</label>
                  <div className="relative">
                    <input
                      type={showOpenAiKey ? "text" : "password"}
                      value={settings.openAiApiKey}
                      onChange={(e) => onSettingsChange({ openAiApiKey: e.target.value })}
                      className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="sk-..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showOpenAiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Your API key is stored locally in your browser and never shared.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Google Gemini API Key</label>
                  <div className="relative">
                    <input
                      type={showGeminiKey ? "text" : "password"}
                      value={settings.geminiApiKey}
                      onChange={(e) => onSettingsChange({ geminiApiKey: e.target.value })}
                      className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter your Gemini API key"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showGeminiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Your API key is stored locally in your browser and never shared.</p>
                </div>
              </motion.div>
            )}

            {/* Developer Settings */}
            {activeTab === 'developer' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Toggle
                  value={settings.debugMode}
                  onChange={() => onSettingsChange({ debugMode: !settings.debugMode })}
                  label="Debug Mode"
                  description="Enable debug logging"
                />

                <button className="flex items-center justify-center w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Rebuild Index
                </button>
              </motion.div>
            )}

            {/* Save & Reset Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <button
                  onClick={onSave}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Settings
                </button>
                <button
                  onClick={onReset}
                  className="flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Reset
                </button>
              </div>
              <div className="mt-4 flex items-center text-green-600 dark:text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Settings auto-saved locally
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
