import { useState, useEffect } from 'react';
import { Document } from '../utils/types';
import * as api from '../utils/api';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      setError(null);
      const docs = await api.getDocuments();
      setDocuments(docs);
    } catch (err) {
      setError('Failed to load documents. Please make sure the backend server is running.');
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        // Add the document to the list with processing status immediately
        const tempDoc: Document = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          status: 'processing'
        };
        setDocuments((prev) => [...prev, tempDoc]);

        // Upload and process the document
        const doc = await api.uploadDocument(file);
        
        // Update the document in the list with the new data
        setDocuments((prev) =>
          prev.map((d) => (d.id === tempDoc.id ? doc : d))
        );
        
        // Poll for status updates in case processing takes time
        let retries = 0;
        const pollInterval = setInterval(async () => {
          try {
            const docs = await api.getDocuments();
            setDocuments(docs);
            const updatedDoc = docs.find((d) => d.id === doc.id);
            if (updatedDoc && updatedDoc.status !== 'processing') {
              clearInterval(pollInterval);
            }
            retries++;
            if (retries > 30) {
              clearInterval(pollInterval);
            }
          } catch {
            clearInterval(pollInterval);
          }
        }, 1000);
      }
    } catch (err) {
      setError('Failed to upload document. Please try again.');
      console.error('Failed to upload document:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      setError(null);
      await api.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      setError('Failed to delete document. Please try again.');
      console.error('Failed to delete document:', err);
    }
  };

  return {
    documents,
    loading,
    uploading,
    error,
    handleUpload,
    handleDelete,
    refresh: loadDocuments,
  };
};
