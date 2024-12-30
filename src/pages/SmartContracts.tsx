import React, { useState, useEffect } from 'react';
import { FileCheck, Upload, CheckCircle, XCircle, Activity, User, Clock, FileText, X } from 'lucide-react';
import { ticketApi } from '../config/api';

const DocumentVerification = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [ticketId, setTicketId] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(true);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Placeholder recent verifications
  const recentVerifications = [
    {
      documentName: "Medical_Report_123.pdf",
      status: "Verified",
      timestamp: "2024-12-30 14:30",
      hash: "0x1234...5678",
    },
    {
      documentName: "Insurance_Claim_456.pdf",
      status: "Processing",
      timestamp: "2024-12-30 14:25",
      hash: "0x5678...9012",
    }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setVerificationStatus(null);
  };

  const handleVerification = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVerificationStatus({
        success: true,
        documentHash: "0x" + Math.random().toString(36).substr(2, 40),
        transactionHash: "0x" + Math.random().toString(36).substr(2, 40),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setVerificationStatus({
        success: false,
        error: "Verification failed. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTicketVerification = async () => {
    if (!ticketId) return;
    
    setIsLoading(true);
    try {
      const response = await ticketApi.getDetails(ticketId);
      
      if (response.data) {
        setUserInfo({
          name: response.data.user || 'Anonymous',
          email: response.data.email || 'N/A',
          phone: response.data.phone || 'N/A',
          ticketStatus: 'Active',
          ticketId: ticketId,
          createdAt: response.data.timestamp,
          totalDocuments: 15,
          verifiedDocuments: 12,
          pendingDocuments: 3,
          lastActivity: '2024-12-30 15:45'
        });
        setShowTicketModal(false);
      }
    } catch (error) {
      console.error('Ticket verification failed:', error);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToChatInterface = () => {
    window.location.href = '/chat';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-10 relative bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
      {/* Enhanced gradient background */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(circle at top, rgba(147,51,234,0.3) 0%, rgba(147,51,234,0.1) 40%, transparent 100%), radial-gradient(circle at bottom, rgba(88,28,135,0.2) 0%, transparent 100%)',
          filter: 'blur(60px)',
        }}
      />

      {/* User Details Popup */}
      {showUserDetails && userInfo && (
        <div className="absolute top-24 right-6 w-80 bg-black/90 border border-purple-500/30 rounded-xl shadow-xl z-50">
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">User Details</h3>
              <button onClick={() => setShowUserDetails(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-gray-400 text-sm">Contact Information</p>
                <p className="text-white">{userInfo.name}</p>
                <p className="text-gray-300 text-sm">{userInfo.email}</p>
                <p className="text-gray-300 text-sm">{userInfo.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 text-sm">Account Status</p>
                <p className="text-green-400 font-medium">{userInfo.ticketStatus}</p>
                <p className="text-gray-300 text-sm">Created: {new Date(userInfo.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 text-sm">Document Statistics</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-purple-500/10 rounded-lg p-2">
                    <p className="text-gray-400">Total</p>
                    <p className="text-white font-medium">{userInfo.totalDocuments}</p>
                  </div>
                  <div className="bg-purple-500/10 rounded-lg p-2">
                    <p className="text-gray-400">Verified</p>
                    <p className="text-green-400 font-medium">{userInfo.verifiedDocuments}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 text-sm">Last Activity</p>
                <p className="text-gray-300 text-sm">{userInfo.lastActivity}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 text-sm">Ticket ID</p>
                <p className="text-white font-mono">{userInfo.ticketId}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Verification Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-black/90 border border-purple-500/30 rounded-xl w-full max-w-md p-8 relative">
            <button 
              onClick={() => setShowTicketModal(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-semibold text-white mb-6">Verify Your Ticket</h2>
            
            <div className="space-y-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="Enter Ticket ID"
                  className="flex-1 px-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleTicketVerification}
                  disabled={isLoading || !ticketId}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify
                </button>
              </div>

              <button
                onClick={redirectToChatInterface}
                className="w-full px-6 py-3 bg-purple-600/30 text-white rounded-lg font-medium hover:bg-purple-600/50 transition-colors"
              >
                Generate New Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 shadow-lg shadow-purple-500/20">
              <FileCheck className="h-6 w-6" />
            </div>
            <span className="text-3xl font-semibold text-white">Document Verification System</span>
          </div>
          
          {/* User Info Button */}
          {userInfo && (
            <button 
              onClick={() => setShowUserDetails(!showUserDetails)}
              className="flex items-center gap-4 bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 hover:bg-purple-900/30 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600">
                <User className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">{userInfo.name}</h3>
                <p className="text-gray-400 text-sm">
                  Ticket: {userInfo.ticketId} • {userInfo.verifiedDocuments} verified
                </p>
              </div>
            </button>
          )}
        </div>

        <div className="grid gap-6">
          {/* Upload Section */}
          <div className="bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-xl overflow-hidden shadow-xl">
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Verify Document</h2>
              
              <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-10 text-center transition-colors hover:border-purple-500/50">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="fileInput"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label htmlFor="fileInput" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-4 bg-purple-600/20 rounded-full">
                      <Upload className="h-8 w-8 text-purple-400" />
                    </div>
                    <span className="text-lg text-gray-300">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-sm text-gray-500">
                      Support for PDF, DOC, DOCX, JPG, JPEG, PNG
                    </span>
                  </div>
                </label>
              </div>

              {selectedFile && (
                <div className="mt-6">
                  <p className="text-gray-400">
                    Selected file: <span className="text-white">{selectedFile.name}</span>
                  </p>
                  <button
                    onClick={handleVerification}
                    disabled={isLoading}
                    className="mt-4 w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Verify Document'}
                  </button>
                </div>
              )}

              {verificationStatus && (
                <div className={`mt-6 p-6 rounded-xl backdrop-blur-sm ${
                  verificationStatus.success 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : 'bg-red-500/10 border border-red-500/30'
                }`}>
                  {verificationStatus.success ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Verification Successful</span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-400">
                        <p>Document Hash: <span className="text-gray-300">{verificationStatus.documentHash}</span></p>
                        <p>Transaction: <span className="text-gray-300">{verificationStatus.transactionHash}</span></p>
                        <p>Timestamp: <span className="text-gray-300">{new Date(verificationStatus.timestamp).toLocaleString()}</span></p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">{verificationStatus.error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Verifications */}
            <div className="bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-xl overflow-hidden shadow-xl">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-semibold text-white">Recent Verifications</h2>
                </div>
                
                <div className="space-y-4">
                  {recentVerifications.map((verification, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 backdrop-blur-sm hover:border-purple-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300 font-medium">{verification.documentName}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          verification.status === 'Verified' 
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {verification.status}
                        </span>
                      </div>
                      <div className="text-sm space-y-1 text-gray-400">
                        <p>Hash: <span className="text-gray-300">{verification.hash}</span></p>
                        <p>Timestamp: <span className="text-gray-300">{verification.timestamp}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* User Statistics */}
            <div className="bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-xl overflow-hidden shadow-xl">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-semibold text-white">Your Documents</h2>
                </div>
                
                {userInfo ? (
                  <div className="grid gap-4">
                    <div className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/20 backdrop-blur-sm">
                      <p className="text-gray-400 mb-2">Total Documents</p>
                      <p className="text-3xl font-semibold text-white">{userInfo.totalDocuments}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/20 backdrop-blur-sm">
                        <p className="text-gray-400 mb-2">Verified</p>
                        <p className="text-3xl font-semibold text-green-400">{userInfo.verifiedDocuments}</p>
                      </div>
                      <div className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/20 backdrop-blur-sm">
                        <p className="text-gray-400 mb-2">Pending</p>
                        <p className="text-3xl font-semibold text-yellow-400">{userInfo.pendingDocuments}</p>
                      </div>
                    </div>
                    <div className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/20 backdrop-blur-sm">
                      <p className="text-gray-400 mb-2">Last Activity</p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-400" />
                        <p className="text-white">{userInfo.lastActivity}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-400">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Please verify your ticket to view document statistics</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-400 mt-8">
          Secured by Blockchain Technology • All documents are encrypted and verified
        </div>
      </div>
    </div>
  );
};

export default DocumentVerification;