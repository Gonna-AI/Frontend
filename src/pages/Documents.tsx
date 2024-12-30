import React, { useState } from 'react';
import { FileCheck, Search, Filter, CheckCircle, XCircle, AlertCircle, MoreVertical, Download, History, Eye, User, Calendar, Clock, Shield, Sun, Moon } from 'lucide-react';

const AdminDashboard = () => {
  const [documents, setDocuments] = useState([
    {
      id: '1',
      title: 'Medical_Claim_2024.pdf',
      status: 'pending',
      priority: 'high',
      submittedBy: 'John Doe',
      submittedAt: '2024-03-15 14:30',
      ticketId: 'TKT-001',
      type: 'Medical Claim',
      size: '2.4 MB',
      lastReviewed: null,
      hash: '0x1234...5678'
    },
    {
      id: '2',
      title: 'Insurance_Policy.docx',
      status: 'verified',
      priority: 'medium',
      submittedBy: 'Jane Smith',
      submittedAt: '2024-03-14 09:15',
      ticketId: 'TKT-002',
      type: 'Insurance',
      size: '1.8 MB',
      lastReviewed: '2024-03-14 10:30',
      hash: '0x5678...9012'
    },
    {
      id: '3',
      title: 'Hospital_Bills.pdf',
      status: 'rejected',
      priority: 'low',
      submittedBy: 'Mike Johnson',
      submittedAt: '2024-03-13 16:45',
      ticketId: 'TKT-003',
      type: 'Medical Claim',
      size: '3.1 MB',
      lastReviewed: '2024-03-13 17:30',
      hash: '0x9012...3456'
    }
  ]);

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    type: 'all'
  });
  const [isDarkMode, setIsDarkMode] = useState(true);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'rejected':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      default:
        return 'text-green-400';
    }
  };

  const handleVerify = (docId) => {
    setDocuments(docs => 
      docs.map(doc => 
        doc.id === docId 
          ? { ...doc, status: 'verified', lastReviewed: new Date().toISOString() }
          : doc
      )
    );
  };

  const handleReject = (docId) => {
    setDocuments(docs => 
      docs.map(doc => 
        doc.id === docId 
          ? { ...doc, status: 'rejected', lastReviewed: new Date().toISOString() }
          : doc
      )
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
            <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">Admin Document Review</h1>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDarkMode 
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
              <span>System Active</span>
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
                  placeholder="Search documents, users, or ticket IDs..."
                  className={`w-full pl-10 pr-4 py-2 ${theme.searchInput} border ${theme.inputBorder} rounded-lg ${theme.searchText} ${theme.searchPlaceholder} focus:outline-none focus:border-purple-500/50`}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-4">
              {['Status', 'Priority', 'Type'].map((filterName) => (
                <select
                  key={filterName}
                  className={`flex-1 sm:flex-none px-4 py-2 ${theme.selectBg} border ${theme.inputBorder} rounded-lg ${theme.selectText} focus:outline-none focus:border-purple-500/50`}
                >
                  <option value="all">{filterName}: All</option>
                </select>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          {/* Documents List */}
          <div className="lg:col-span-2 space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`${theme.cardBg} backdrop-blur-xl border ${theme.border} rounded-xl p-4`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                  <div className="flex items-start gap-3 mb-2 sm:mb-0">
                    <FileCheck className="h-8 w-8 text-purple-400 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">{doc.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mt-1">
                        <span>Ticket: {doc.ticketId}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{doc.type}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{doc.size}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(doc.status)}`}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                    <span className={`text-sm ${getPriorityColor(doc.priority)}`}>
                      {doc.priority.charAt(0).toUpperCase() + doc.priority.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-400">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-0">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {doc.submittedBy}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(doc.submittedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    {doc.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleVerify(doc.id)}
                          className={`flex-1 sm:flex-none px-3 py-1 ${isDarkMode ? 'bg-green-500/20' : 'bg-green-100'} ${isDarkMode ? 'text-green-400' : 'text-green-600'} rounded-lg hover:bg-green-500/30 transition-colors`}
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleReject(doc.id)}
                          className={`flex-1 sm:flex-none px-3 py-1 ${isDarkMode ? 'bg-red-500/20' : 'bg-red-100'} ${isDarkMode ? 'text-red-400' : 'text-red-600'} rounded-lg hover:bg-red-500/30 transition-colors`}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Reviewed: {new Date(doc.lastReviewed).toLocaleTimeString()}
                      </div>
                    )}
                    
                    <button
                      onClick={() => {
                        setSelectedDocument(doc);
                        setShowDetails(true);
                      }}
                      className={`p-1 hover:${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} rounded transition-colors`}
                      aria-label="View document details"
                    >
                      <Eye className={`h-4 w-4 ${theme.text}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Statistics and Quick Actions */}
          <div className="space-y-6 lg:col-span-1">
            {/* Statistics */}
            <div className={`${theme.cardBg} backdrop-blur-xl border ${theme.border} rounded-xl p-4`}>
              <h2 className="text-lg font-semibold mb-4">Statistics</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 ${theme.statsBg} border ${theme.statsBorder} rounded-lg`}>
                    <div className={`text-2xl font-bold ${theme.text}`}>24</div>
                    <div className={theme.statsText}>Pending Review</div>
                  </div>
                  <div className={`p-3 ${theme.statsBg} border ${theme.statsBorder} rounded-lg`}>
                    <div className={`text-2xl font-bold ${theme.text}`}>156</div>
                    <div className={theme.statsText}>Verified Today</div>
                  </div>
                </div>
                <div className={`p-3 ${theme.statsBg} border ${theme.statsBorder} rounded-lg`}>
                  <div className={theme.statsText}>Review Timeline</div>
                  <div className={`h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div className="h-full w-3/4 bg-purple-500 rounded-full"></div>
                  </div>
                  <div className={theme.statsText}>75% Complete</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`${theme.cardBg} backdrop-blur-xl border ${theme.border} rounded-xl p-4`}>
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                <button className={`w-full p-2 ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'} ${isDarkMode ? 'text-purple-300' : 'text-purple-600'} rounded-lg hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2`}>
                  <Download className="h-4 w-4" />
                  Export Reports
                </button>
                <button className={`w-full p-2 ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'} ${isDarkMode ? 'text-purple-300' : 'text-purple-600'} rounded-lg hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2`}>
                  <History className="h-4 w-4" />
                  View Audit Log
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Details Modal */}
      {showDetails && selectedDocument && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6">
          <div className={`
            ${theme.cardBg} 
            ${isDarkMode ? 'bg-[rgb(10,10,10)]' : 'bg-white/95'}
            border 
            ${theme.border} 
            rounded-xl 
            w-full 
            h-[calc(100vh-2rem)] 
            md:h-[calc(100vh-4rem)] 
            md:max-h-[900px] 
            overflow-hidden 
            flex 
            flex-col
          `}>
            <div className={`flex items-center justify-between p-4 md:p-6 border-b ${theme.border}`}>
              <h2 className="text-xl font-semibold">Document Details</h2>
              <button 
                onClick={() => setShowDetails(false)}
                className={`${theme.text} hover:${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="h-full md:grid md:grid-cols-2 md:gap-6">
                {/* Left Column */}
                <div className="space-y-4 mb-6 md:mb-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className={`text-sm ${theme.secondaryText}`}>Submission Date</label>
                      <p className="font-medium">{new Date(selectedDocument.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Document Preview */}
                  <div className={`${theme.statsBg} border ${theme.statsBorder} rounded-lg p-4`}>
                    <h3 className="text-lg font-medium mb-3">Document Preview</h3>
                    <div className={`aspect-video ${isDarkMode ? 'bg-black/60' : 'bg-gray-200'} rounded-lg flex items-center justify-center`}>
                      <FileCheck className={`h-12 w-12 ${theme.secondaryText}`} />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Review History */}
                  <div className={`${theme.statsBg} border ${theme.statsBorder} rounded-lg p-4`}>
                    <h3 className="text-lg font-medium mb-3">Review History</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <History className="h-4 w-4 text-purple-400" />
                          <span>Initial Submission</span>
                        </div>
                        <span className={theme.secondaryText}>{selectedDocument.submittedAt}</span>
                      </div>
                      {selectedDocument.lastReviewed && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span>Document Reviewed</span>
                          </div>
                          <span className={theme.secondaryText}>{selectedDocument.lastReviewed}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Blockchain Information */}
                  <div className={`${theme.statsBg} border ${theme.statsBorder} rounded-lg p-4`}>
                    <h3 className="text-lg font-medium mb-3">Blockchain Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={theme.secondaryText}>Document Hash:</span>
                        <span className="font-mono">{selectedDocument.hash}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme.secondaryText}>Block Number:</span>
                        <span className="font-mono">12345678</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme.secondaryText}>Transaction Hash:</span>
                        <span className="font-mono">0xabcd...efgh</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className={`border-t ${theme.border} p-4 md:p-6`}>
              <div className="flex gap-3">
                {selectedDocument.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleVerify(selectedDocument.id);
                        setShowDetails(false);
                      }}
                      className={`flex-1 py-2 ${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'} rounded-lg hover:${isDarkMode ? 'bg-green-500/30' : 'bg-green-200'} transition-colors flex items-center justify-center gap-2`}
                    >
                      <CheckCircle className="h-4 w-4" />                   </button>
                    <button
                      onClick={() => {
                        handleReject(selectedDocument.id);
                        setShowDetails(false);
                      }}
                      className={`flex-1 py-2 ${isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'} rounded-lg hover:${isDarkMode ? 'bg-red-500/30' : 'bg-red-200'} transition-colors flex items-center justify-center gap-2`}
                    >
                      <XCircle className="h-4 w-4" />
                     
                    </button>
                  </>
                )}
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

