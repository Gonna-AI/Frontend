import React, { useState, useEffect } from 'react';
import { FileCheck, Search, Filter, CheckCircle, XCircle, AlertCircle, MoreVertical, Download, History, Eye, User, Calendar, Clock, Shield, Sun, Moon } from 'lucide-react';
import { adminApi, API_BASE_URL } from '../config/api';
import { useLanguage } from '../contexts/LanguageContext';

// Add type definitions to fix type errors
interface Document {
  id: string;
  title: string;
  status: 'pending' | 'verified' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  submittedBy: string;
  submittedAt: string;
  ticketId: string;
  type: string;
  size: string;
  lastReviewed: string | null;
  hash: string;
  documents?: Array<{
    document_id: string;
    document_name: string;
    uploaded_at: string;
    is_verified: boolean;
    document_hash?: string;
  }>;
}

// Add a type for grouped documents
interface GroupedDocument {
  client_name: string;
  ticket_id: string;
  priority_level: string;
  grievance_type: string;
  documents: Array<{
    document_id: string;
    document_name: string;
    uploaded_at: string;
    is_verified: boolean;
  }>;
}

const AdminDashboard = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all'
  });
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  // Add new state for API data
  const [apiDocuments, setApiDocuments] = useState([]);
  const [apiStats, setApiStats] = useState({
    total_documents: 0,
    verified_today: 0,
    pending_review: 0,
    clients_verified_today: 0
  });

  // Add new state for tracking verified clients
  const [verifiedClientsToday, setVerifiedClientsToday] = useState(0);

  // Add new state for blockchain info
  const [blockchainInfo, setBlockchainInfo] = useState<{
    hash: string;
    uploader: string;
    timestamp: number;
    isVerified: boolean;
    verifier: string;
    verificationTime: number;
  } | null>(null);

  // Add new state for search
  const [searchTerm, setSearchTerm] = useState('');

  // Add function to filter documents
  const filteredDocuments = documents.filter(doc => {
    // Search filter
    const searchMatch = searchTerm === '' ||
      doc.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const statusMatch = filters.status === 'all' || doc.status === filters.status;

    // Priority filter
    const priorityMatch = filters.priority === 'all' || doc.priority === filters.priority;

    return searchMatch && statusMatch && priorityMatch;
  });

  // Add useEffect for API data
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getPendingDocuments();

      // Group documents by client
      const groupedDocs = response.data.documents.reduce((acc, doc) => {
        const key = doc.ticket_id;
        if (!acc[key]) {
          acc[key] = {
            client_name: doc.client_name,
            ticket_id: doc.ticket_id,
            priority_level: doc.priority_level,
            grievance_type: doc.grievance_type,
            documents: []
          };
        }
        acc[key].documents.push({
          document_id: doc.document_id,
          document_name: doc.document_name,
          uploaded_at: doc.uploaded_at,
          is_verified: doc.is_verified
        });
        return acc;
      }, {});

      const convertedDocs = Object.values(groupedDocs).map(group => ({
        id: group.ticket_id,
        title: group.client_name,
        status: 'pending',
        priority: group.priority_level.toLowerCase(),
        submittedBy: group.client_name,
        submittedAt: group.documents[0].uploaded_at,
        ticketId: group.ticket_id,
        type: group.grievance_type,
        documents: group.documents.map(doc => ({
          ...doc,
          document_hash: doc.document_hash
        }))
      }));

      // Count total pending clients
      const totalPendingClients = Object.keys(groupedDocs).length;

      setDocuments(convertedDocs);
      setApiStats({
        ...response.data.statistics,
        pending_review: totalPendingClients,
        clients_verified_today: response.data.statistics.clients_verified_today || 0
      });

    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getThemeColors = () => ({
    background: isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50',
    text: isDarkMode ? 'text-white' : 'text-gray-800',
    cardBg: isDarkMode ? 'bg-black/40' : 'bg-white',
    border: isDarkMode ? 'border-white/10' : 'border-gray-200',
    inputBg: isDarkMode ? 'bg-black/40' : 'bg-white',
    inputBorder: isDarkMode ? 'border-purple-500/20' : 'border-purple-200',
    secondaryText: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    searchInput: isDarkMode ? 'bg-black/40' : 'bg-white',
    searchText: isDarkMode ? 'text-white' : 'text-gray-800',
    searchPlaceholder: isDarkMode ? 'placeholder-gray-500' : 'placeholder-gray-400',
    selectBg: isDarkMode ? 'bg-black/40' : 'bg-white',
    selectText: isDarkMode ? 'text-white' : 'text-gray-800',
    statsBg: isDarkMode ? 'bg-purple-500/5' : 'bg-purple-50',
    statsBorder: isDarkMode ? 'border-purple-500/20' : 'border-purple-100',
    statsText: isDarkMode ? 'text-gray-400' : 'text-gray-600',
  });

  const theme = getThemeColors();

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'rejected':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    }
  };

  const getPriorityColor = (priority: Document['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      default:
        return 'text-green-400';
    }
  };

  // Add function to fetch blockchain info
  const fetchBlockchainInfo = async (documentId: string) => {
    try {
      // Find the document hash from the selected document
      const selectedDoc = selectedDocument?.documents?.find(doc => doc.document_id === documentId);
      if (!selectedDoc?.document_hash) {
        console.error('No document hash found');
        return;
      }

      const response = await adminApi.getBlockchainInfo(selectedDoc.document_hash);
      setBlockchainInfo(response.data);
    } catch (error) {
      console.error('Error fetching blockchain info:', error);
      setBlockchainInfo(null);
    }
  };

  // Update the Blockchain Information section in the document details modal
  const renderBlockchainInfo = () => (
    <div className={`${theme.statsBg} border ${theme.statsBorder} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">{t('documents.blockchain.details')}</h3>
        <button
          onClick={() => {
            const docHash = selectedDocument?.documents?.[0]?.document_hash;
            if (docHash) {
              fetchBlockchainInfo(docHash);
            } else {
              console.error('No document hash available');
            }
          }}
          className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
        >
          <History className="h-4 w-4" />
        </button>
      </div>

      {blockchainInfo ? (
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-start gap-4">
            <span className={theme.secondaryText}>{t('documents.blockchain.hash')}</span>
            <span className="font-mono text-right break-all">{blockchainInfo.hash}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className={theme.secondaryText}>{t('documents.blockchain.status')}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${blockchainInfo.isVerified
              ? 'bg-green-500/20 text-green-400'
              : 'bg-yellow-500/20 text-yellow-400'
              }`}>
              {blockchainInfo.isVerified ? t('documents.blockchain.verified') : t('documents.blockchain.pending')}
            </span>
          </div>

          <div className="flex justify-between items-start gap-4">
            <span className={theme.secondaryText}>{t('documents.blockchain.uploader')}</span>
            <span className="font-mono text-right break-all">{blockchainInfo.uploader}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className={theme.secondaryText}>{t('documents.blockchain.uploadTime')}</span>
            <span>{new Date(blockchainInfo.timestamp * 1000).toLocaleString()}</span>
          </div>

          {blockchainInfo.isVerified && (
            <>
              <div className="flex justify-between items-start gap-4">
                <span className={theme.secondaryText}>{t('documents.blockchain.verifier')}</span>
                <span className="font-mono text-right break-all">{blockchainInfo.verifier}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className={theme.secondaryText}>{t('documents.blockchain.verificationTime')}</span>
                <span>{new Date(blockchainInfo.verificationTime * 1000).toLocaleString()}</span>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className={`${theme.secondaryText} text-sm`}>
            {t('documents.blockchain.refresh')}
          </p>
        </div>
      )}
    </div>
  );

  // Update handleVerify to handle statistics
  const handleVerify = async (ticketId: string) => {
    try {
      const clientDocs = documents.find(d => d.ticketId === ticketId);
      if (clientDocs && clientDocs.documents) {
        // First verify documents normally
        await Promise.all(
          clientDocs.documents.map(doc =>
            adminApi.verifyDocument(doc.document_id)
          )
        );

        // Then verify on blockchain
        await Promise.all(
          clientDocs.documents.map(async doc => {
            const blockchainResponse = await adminApi.verifyBlockchain(doc.document_id);
            if (blockchainResponse.data.success) {
              // Refresh blockchain info if the current document is selected
              if (selectedDocument?.document_id === doc.document_id) {
                await fetchBlockchainInfo(doc.document_id);
              }
            }
          })
        );

        // Update UI and stats
        setApiStats(prev => ({
          ...prev,
          clients_verified_today: prev.clients_verified_today + 1
        }));

        setDocuments(prevDocs =>
          prevDocs.map(doc =>
            doc.ticketId === ticketId
              ? { ...doc, status: 'verified' }
              : doc
          )
        );

        // Emit an event that the client can listen to (optional, using WebSocket)
        if (socket) {
          socket.emit('document_status_changed', {
            ticket_id: ticketId,
            status: 'verified'
          });
        }
      }
    } catch (error) {
      console.error('Error verifying documents:', error);
    }
  };

  // Update handleReject to handle statistics
  const handleReject = async (ticketId: string) => {
    try {
      const clientDocs = documents.find(d => d.ticketId === ticketId);
      if (clientDocs && clientDocs.documents) {
        await Promise.all(
          clientDocs.documents.map(doc =>
            adminApi.rejectDocument(doc.document_id)
          )
        );

        setDocuments(prevDocs =>
          prevDocs.map(doc =>
            doc.ticketId === ticketId
              ? { ...doc, status: 'rejected' }
              : doc
          )
        );

        // Emit an event that the client can listen to (optional, using WebSocket)
        if (socket) {
          socket.emit('document_status_changed', {
            ticket_id: ticketId,
            status: 'rejected'
          });
        }
      }
    } catch (error) {
      console.error('Error rejecting documents:', error);
    }
  };

  // Add download handler
  const handleDownload = async (ticketId: string) => {
    try {
      const response = await adminApi.downloadDocuments(ticketId);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `documents_${ticketId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading documents:', error);
    }
  };

  // Add this new function after the handleDownload function
  const handleExportReports = () => {
    try {
      // Convert documents data to CSV format
      const headers = ['Ticket ID', 'Client Name', 'Status', 'Priority', 'Type', 'Submission Date', 'Documents'];
      const csvData = [
        headers.join(','),
        ...documents.map(doc => [
          doc.ticketId,
          doc.submittedBy,
          doc.status,
          doc.priority,
          doc.type,
          new Date(doc.submittedAt).toLocaleString(),
          doc.documents?.map(d => d.document_name).join(';')
        ].join(','))
      ].join('\n');

      // Create and trigger download
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `documents_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting reports:', error);
    }
  };

  // Update statistics section
  const renderStatistics = () => {
    // Calculate completion percentage
    const totalClients = apiStats.pending_review + apiStats.clients_verified_today;
    const completionPercentage = totalClients > 0
      ? Math.round((apiStats.clients_verified_today / totalClients) * 100)
      : 0;

    return (
      <div className={`${theme.cardBg} backdrop-blur-xl border ${theme.border} rounded-xl p-4`}>
        <h2 className="text-lg font-semibold mb-4">{t('documents.statistics')}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 ${theme.statsBg} border ${theme.statsBorder} rounded-lg`}>
              <div className={`text-2xl font-bold ${theme.text}`}>{apiStats.pending_review}</div>
              <div className={theme.statsText}>{t('documents.stats.pending')}</div>
            </div>
            <div className={`p-3 ${theme.statsBg} border ${theme.statsBorder} rounded-lg`}>
              <div className={`text-2xl font-bold ${theme.text}`}>{apiStats.clients_verified_today}</div>
              <div className={theme.statsText}>{t('documents.stats.verified')}</div>
            </div>
          </div>
          <div className={`p-3 ${theme.statsBg} border ${theme.statsBorder} rounded-lg`}>
            <div className={theme.statsText}>{t('documents.stats.progress')}</div>
            <div className={`h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden mt-2`}>
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <div className={theme.statsText}>{completionPercentage}% {t('documents.stats.complete')}</div>
              <div className={theme.statsText}>
                {apiStats.clients_verified_today} / {totalClients} {t('documents.stats.clients')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Update document preview modal
  const renderDocumentPreview = (doc: any) => {
    const fileExtension = doc.document_name.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);

    if (isImage) {
      return (
        <img
          src={`${API_BASE_URL}/api/documents/${doc.document_id}/preview`}
          alt={doc.document_name}
          className="max-w-full h-auto rounded-lg"
          onError={(e: any) => {
            e.target.onerror = null;
            e.target.src = ''; // Remove broken image
            e.target.alt = 'Failed to load image';
          }}
        />
      );
    }

    return (
      <div className={`aspect-video ${isDarkMode ? 'bg-black/60' : 'bg-gray-200'} rounded-lg flex flex-col items-center justify-center p-4`}>
        <FileCheck className={`h-12 w-12 ${theme.secondaryText} mb-2`} />
        <p className="text-sm text-gray-400">{t('documents.preview.notAvailable').replace('{ext}', fileExtension || '')}</p>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text} p-6 transition-colors duration-200`}>
      {/* Purple gradient background */}
      <div
        className={`absolute inset-0 opacity-30 ${isDarkMode ? '' : 'opacity-10'}`}
        style={{
          background: 'radial-gradient(circle at center, rgba(147,51,234,0.5) 0%, rgba(147,51,234,0.2) 40%, transparent 100%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 464 468"
              className="w-11 h-11"
              aria-label="ClerkTree Logo"
            >
              <path
                fill={isDarkMode ? "white" : "black"}
                d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"

              />
            </svg>
            <div className="flex flex-col">
              <span className={`text-2xl font-bold ${theme.text}`}>ClerkTree</span>
              <span className={`text-sm ${theme.secondaryText}`}>{t('documents.adminTitle')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4">
            {/* Dashboard Link */}
            <button
              onClick={() => window.location.href = '/dashboard'}
              className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode
                ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              aria-label="Go to Dashboard"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode
                ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`${theme.cardBg} backdrop-blur-xl border ${theme.border} rounded-xl p-4 mb-6`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <div className="w-full sm:flex-1 sm:min-w-[200px]">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.secondaryText} h-4 w-4`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('documents.searchPlaceholder')}
                  className={`w-full pl-10 pr-4 py-2 ${theme.searchInput} border ${theme.inputBorder} rounded-lg ${theme.searchText} ${theme.searchPlaceholder} focus:outline-none focus:border-purple-500/50`}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className={`flex-1 sm:flex-none px-4 py-2 ${theme.selectBg} border ${theme.inputBorder} rounded-lg ${theme.selectText} focus:outline-none focus:border-purple-500/50`}
              >
                <option value="all">{t('documents.statusAll')}</option>
                <option value="pending">{t('documents.status.pending')}</option>
                <option value="verified">{t('documents.status.verified')}</option>
                <option value="rejected">{t('documents.status.rejected')}</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className={`flex-1 sm:flex-none px-4 py-2 ${theme.selectBg} border ${theme.inputBorder} rounded-lg ${theme.selectText} focus:outline-none focus:border-purple-500/50`}
              >
                <option value="all">{t('documents.priorityAll')}</option>
                <option value="high">{t('documents.priority.high')}</option>
                <option value="medium">{t('documents.priority.medium')}</option>
                <option value="low">{t('documents.priority.low')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          {/* Documents List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className={`p-4 rounded-xl ${theme.cardBg} border ${theme.border}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{doc.submittedBy}</h3>
                    <p className="text-sm text-gray-400">{t('documents.ticket')} {doc.ticketId}</p>
                    <p className="text-sm text-gray-400">{t('documents.type')} {doc.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${doc.priority === 'high'
                      ? 'bg-red-500/20 text-red-400'
                      : doc.priority === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                      }`}>
                      {doc.priority}
                    </span>
                    {doc.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleVerify(doc.ticketId)}
                          className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                          title="Verify All"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleReject(doc.ticketId)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          title="Reject All"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc.ticketId)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                          title="Download All"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Documents list */}
                <div className={`mt-4 p-3 ${theme.statsBg} border ${theme.statsBorder} rounded-lg`}>
                  <div className="text-sm font-medium mb-2">{t('documents.uploadedDocs')}</div>
                  <div className="space-y-2">
                    {doc.documents?.map((file) => (
                      <div key={file.document_id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-purple-400" />
                          <span>{file.document_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">
                            {new Date(file.uploaded_at).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedDocument({
                                ...doc,
                                document_id: file.document_id,
                                document_name: file.document_name
                              });
                              setShowDetails(true);
                            }}
                            className={`p-2 hover:${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'} rounded transition-colors`}
                          >
                            <Eye className={`h-4 w-4 ${theme.text}`} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Statistics and Quick Actions */}
          <div className="space-y-6 lg:col-span-1">
            {/* Statistics */}
            {renderStatistics()}

            {/* Quick Actions */}
            <div className={`${theme.cardBg} backdrop-blur-xl border ${theme.border} rounded-xl p-4`}>
              <h2 className="text-lg font-semibold mb-4">{t('documents.quickActions')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                <button
                  onClick={handleExportReports}
                  className={`w-full p-2 ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'} ${isDarkMode ? 'text-purple-300' : 'text-purple-600'} rounded-lg hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2`}
                >
                  <Download className="h-4 w-4" />
                  {t('documents.exportReports')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Details Modal */}
      {showDetails && selectedDocument && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6">
          <div className={`${theme.cardBg} border ${theme.border} rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-4 md:p-6 border-b ${theme.border}`}>
              <h2 className="text-xl font-semibold truncate">{selectedDocument.document_name}</h2>
              <button
                onClick={() => setShowDetails(false)}
                className={`${theme.text} hover:${isDarkMode ? 'text-gray-300' : 'text-gray-600'} flex-shrink-0`}
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className={`text-sm ${theme.secondaryText}`}>{t('documents.modal.submissionDate')}</label>
                      <p className="font-medium">
                        {new Date(selectedDocument.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className={`text-sm ${theme.secondaryText}`}>{t('documents.modal.status')}</label>
                      <p className="font-medium">{t('documents.status.pending')}</p>
                    </div>
                  </div>

                  {/* Document Preview */}
                  <div className={`${theme.statsBg} border ${theme.statsBorder} rounded-lg p-4`}>
                    <h3 className="text-lg font-medium mb-3">{t('documents.modal.preview')}</h3>
                    {renderDocumentPreview(selectedDocument)}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Document Details */}
                  <div className={`${theme.statsBg} border ${theme.statsBorder} rounded-lg p-4`}>
                    <h3 className="text-lg font-medium mb-3">{t('documents.modal.details')}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={theme.secondaryText}>{t('documents.modal.client')}</span>
                        <span>{selectedDocument.submittedBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme.secondaryText}>{t('documents.modal.ticketId')}</span>
                        <span>{selectedDocument.ticketId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme.secondaryText}>{t('documents.modal.docType')}</span>
                        <span>{selectedDocument.type || 'N/A'}</span>
                      </div>
                      {selectedDocument.documents?.[0]?.document_hash && (
                        <div className="flex justify-between">
                          <span className={theme.secondaryText}>{t('documents.blockchain.hash')}</span>
                          <span className="font-mono text-xs break-all">
                            {selectedDocument.documents[0].document_hash}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Review History */}
                  <div className={`${theme.statsBg} border ${theme.statsBorder} rounded-lg p-4`}>
                    <h3 className="text-lg font-medium mb-3">{t('documents.modal.history')}</h3>
                    <div className="text-sm text-gray-400 text-center py-4">
                      {t('documents.modal.noHistory')}
                    </div>
                  </div>

                  {/* Blockchain Information */}
                  {renderBlockchainInfo()}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`border-t ${theme.border} p-4 md:p-6 flex-shrink-0`}>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDetails(false)}
                  className={`flex-1 py-2 ${isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-200 text-gray-600'} rounded-lg hover:${isDarkMode ? 'bg-gray-500/30' : 'bg-gray-300'} transition-colors`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

