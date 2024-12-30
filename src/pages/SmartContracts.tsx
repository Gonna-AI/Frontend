import React, { useState, useEffect } from 'react';
import { FileCheck, Upload, CheckCircle, XCircle, Activity, Shield, GalleryVerticalEnd, X } from 'lucide-react';
import axios from 'axios';

const DocumentVerification = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [ticketId, setTicketId] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(true);

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
      // Simulate verification process
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
      const response = await axios.get(`http://localhost:5000/api/chat/history/${ticketId}`, {
        headers: {
          'X-Ticket-ID': ticketId
        }
      });
      
      if (response.data) {
        setUserInfo({
          name: response.data.user || 'Anonymous',
          email: response.data.email || 'N/A',
          phone: response.data.phone || 'N/A',
          ticketStatus: 'Active',
          createdAt: response.data.timestamp
        });
        setShowTicketModal(false); // Close modal on success
      }
    } catch (error) {
      console.error('Ticket verification failed:', error);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-10 relative bg-[#0a0a0a]">
      {/* Ticket Verification Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-black/90 border border-white/10 rounded-xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => userInfo && setShowTicketModal(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-semibold text-white mb-6">Verify Your Ticket</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="Enter Ticket ID"
                  className="flex-1 px-4 py-2 bg-black/40 border border-purple-500/20 rounded-lg text-white"
                />
                <button
                  onClick={handleTicketVerification}
                  disabled={isLoading || !ticketId}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  Verify
                </button>
              </div>

              {userInfo && (
                <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-2">User Information</h3>
                  <div className="space-y-2 text-gray-300">
                    <p>Name: {userInfo.name}</p>
                    <p>Email: {userInfo.email}</p>
                    <p>Status: <span className="text-green-400">{userInfo.ticketStatus}</span></p>
                    <p>Created: {new Date(userInfo.createdAt).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => setShowTicketModal(false)}
                    className="mt-4 w-full py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Continue to Document Verification
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Purple gradient background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at center, rgba(147,51,234,0.5) 0%, rgba(147,51,234,0.2) 40%, transparent 100%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 self-center font-medium text-white mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-600">
            <FileCheck className="h-5 w-5" />
          </div>
          <span className="text-2xl">Document Verification System</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Ticket Verification Section */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Verify Ticket</h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    placeholder="Enter Ticket ID"
                    className="flex-1 px-4 py-2 bg-black/40 border border-purple-500/20 rounded-lg text-white"
                  />
                  <button
                    onClick={handleTicketVerification}
                    disabled={isLoading || !ticketId}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    Verify
                  </button>
                </div>

                {userInfo && (
                  <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-white mb-2">User Information</h3>
                    <div className="space-y-2 text-gray-300">
                      <p>Name: {userInfo.name}</p>
                      <p>Email: {userInfo.email}</p>
                      <p>Status: <span className="text-green-400">{userInfo.ticketStatus}</span></p>
                      <p>Created: {new Date(userInfo.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Verify Document</h2>
              
              <div className="border-2 border-dashed border-purple-500/20 rounded-lg p-8 text-center">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="fileInput"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label htmlFor="fileInput" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="h-12 w-12 text-purple-400" />
                    <span className="text-gray-300">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-sm text-gray-500">
                      PDF, DOC, DOCX, JPG, JPEG, PNG
                    </span>
                  </div>
                </label>
              </div>

              {selectedFile && (
                <div className="mt-4">
                  <p className="text-gray-400">
                    Selected file: {selectedFile.name}
                  </p>
                  <button
                    onClick={handleVerification}
                    disabled={isLoading}
                    className="mt-4 w-full py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    {isLoading ? 'Processing...' : 'Verify Document'}
                  </button>
                </div>
              )}

              {verificationStatus && (
                <div className={`mt-4 p-4 rounded-lg backdrop-blur-sm ${
                  verificationStatus.success 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : 'bg-red-500/10 border border-red-500/30'
                }`}>
                  {verificationStatus.success ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span>Verification Successful</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        <p>Document Hash: {verificationStatus.documentHash}</p>
                        <p>Transaction: {verificationStatus.transactionHash}</p>
                        <p>Timestamp: {new Date(verificationStatus.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400">
                      <XCircle className="w-5 h-5" />
                      <span>{verificationStatus.error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Verifications */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Recent Verifications</h2>
              </div>
              
              <div className="space-y-4">
                {recentVerifications.map((verification, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">{verification.documentName}</span>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        verification.status === 'Verified' 
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {verification.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      <p>Hash: {verification.hash}</p>
                      <p>Timestamp: {verification.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">System Status</h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20 backdrop-blur-sm">
                <p className="text-gray-400 mb-2">Documents Verified</p>
                <p className="text-2xl font-semibold text-white">1,234</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20 backdrop-blur-sm">
                <p className="text-gray-400 mb-2">Average Time</p>
                <p className="text-2xl font-semibold text-white">2.5s</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20 backdrop-blur-sm">
                <p className="text-gray-400 mb-2">System Status</p>
                <p className="text-2xl font-semibold text-green-400">Active</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 mt-6">
          Secured by Blockchain Technology • All documents are encrypted and verified
        </div>
      </div>
    </div>
  );
};

export default DocumentVerification;