import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Trash2, CheckCircle2, AlertTriangle, Shield, Building, Sparkles } from 'lucide-react';
import { DocumentItem } from '../utils/api';

interface DocumentUploaderProps {
  documents: DocumentItem[];
  onUpload: (file: File, department: string, accessLevel: string) => Promise<void>;
  onDelete: (docId: string) => void;
  onOpenViewer: (docId: string) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  documents,
  onUpload,
  onDelete,
  onOpenViewer,
}) => {
  const [department, setDepartment] = useState('General');
  const [accessLevel, setAccessLevel] = useState('public');
  const [isUploading, setIsUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'text/csv': ['.csv'],
    },
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setIsUploading(true);
        for (const file of acceptedFiles) {
          await onUpload(file, department, accessLevel);
        }
        setIsUploading(false);
      }
    },
  });

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-1 scrollbar-thin">
      {/* Header & Meta Config */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Enterprise Document Hub</h2>
            <p className="text-sm text-gray-400 mt-1">
              Ingest PDF, DOCX, TXT, CSV, or Markdown files with smart chunking, BGE-M3 indexing, and automated risk analysis.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Target Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="bg-black/50 border border-white/10 text-xs text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
              >
                <option value="General">General</option>
                <option value="HR">HR Policies</option>
                <option value="Finance">Finance & Accounting</option>
                <option value="IT">IT Infrastructure</option>
                <option value="Security">Cybersecurity</option>
                <option value="Legal">Legal & Compliance</option>
                <option value="Operations">Operations / SOPs</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Access Level (RBAC)</label>
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
                className="bg-black/50 border border-white/10 text-xs text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
              >
                <option value="public">Public (All Roles)</option>
                <option value="internal">Internal (Employees+)</option>
                <option value="confidential">Confidential (Managers+)</option>
                <option value="restricted">Restricted (Admin & IT Only)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            isDragActive
              ? 'border-cyan-500 bg-cyan-950/20 shadow-inner'
              : 'border-white/15 hover:border-cyan-500/50 hover:bg-white/[0.02]'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3 shadow-lg shadow-cyan-500/10">
              <Upload className={`w-6 h-6 text-cyan-400 ${isUploading ? 'animate-bounce' : ''}`} />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {isUploading ? 'Ingesting, Chunking & Indexing...' : isDragActive ? 'Drop files to upload' : 'Click or drag documents to upload'}
            </h3>
            <p className="text-xs text-gray-400 max-w-md">
              Extracts text, splits sentences, builds BGE-M3 dense embeddings, BM25 inverted index, and runs RED/YELLOW/GREEN risk surveillance.
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Documents Table */}
      <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
          <span>Authorized Knowledge Base ({documents.length})</span>
        </h3>

        <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-white truncate">{doc.title}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {doc.current_version}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                    <span>{doc.department}</span>
                    <span>•</span>
                    <span className="uppercase text-[11px] font-mono text-purple-300">{doc.access_level}</span>
                    <span>•</span>
                    <span>{formatFileSize(doc.file_size)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenViewer(doc.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Highlight Viewer
                </button>
                <button
                  onClick={() => onDelete(doc.id)}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {documents.length === 0 && (
            <div className="text-center py-16 text-gray-500 text-xs">
              No documents in knowledge base yet. Upload documents above to begin intelligent search and risk profiling.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentUploader;
