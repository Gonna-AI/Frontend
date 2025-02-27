import React, { useState, useEffect } from 'react';
import { FileCheck, Upload, CheckCircle, XCircle, Activity, User, Clock, FileText, X, AlertCircle, Loader2 } from 'lucide-react';
import { documentApi, ticketApi, setTicketHeader } from '../config/api';

// Add a type for the AI analysis response
interface AIAnalysis {
  documentCompleteness?: {
    missingInformation: string[];
    clarificationNeeded: string[];
  };
  requiredActions?: {
    specificItems: string[];
    additionalDocuments: string[];
  };
  recommendations?: {
    improvements: string[];
    nextSteps: string[];
  };
  // For the older format
  "Document Completeness"?: {
    "Missing Information": string[];
    "Clarification Needed": string[];
  };
  "Required Actions"?: {
    "Specific Items": string[];
    "Additional Documents": string[];
  };
  "Recommendations"?: {
    "Improvements": string[];
    "Next Steps": string[];
  };
}

// Add new interface for blockchain verification
interface BlockchainVerification {
  exists: boolean;
  uploader?: string;
  timestamp?: string;
  metadata?: {
    filename?: string;
    file_size?: number;
    analysis_summary?: string;
    processed_at?: string;
  };
}

const DocumentVerification = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [ticketId, setTicketId] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(true);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');

  // State for recent verifications
  const [recentVerifications, setRecentVerifications] = useState([
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
  ]);

  // Add new state for document stats
  const [documentStats, setDocumentStats] = useState({
    total: 0,
    status: 'pending' // can be 'pending', 'verified', or 'rejected'
  });

  // Add new state for blockchain verification
  const [blockchainProcessing, setBlockchainProcessing] = useState(false);
  const [blockchainResult, setBlockchainResult] = useState<BlockchainVerification | null>(null);
  const [documentHash, setDocumentHash] = useState('');

  // Fetch documents on component mount and after operations
  const fetchDocuments = async () => {
    try {
      const response = await documentApi.listDocuments();
      setDocuments(response.data.documents);
      
      // Update stats separately
      const verified = response.data.documents.filter(doc => doc.is_submitted && doc.is_verified).length;
      const pending = response.data.documents.filter(doc => doc.is_submitted && !doc.is_verified).length;
      const total = response.data.documents.length;
      
      setDocumentStats({
        total,
        status: pending > 0 ? 'pending' : verified > 0 ? 'verified' : 'rejected'
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  // Update the useEffect to not depend on userInfo changes
  useEffect(() => {
    if (userInfo) {
      // Initial fetch when user is verified
      fetchDocuments();
      
      // Optional: Set up periodic refresh (every 30 seconds)
      const interval = setInterval(fetchDocuments, 30000);
      
      // Cleanup interval on unmount
      return () => clearInterval(interval);
    }
  }, []); // Empty dependency array

  // Add useEffect to fetch verification status
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const response = await documentApi.getVerificationStatus();
        setVerificationStatus(response.data.status);
        
        // Update document stats with the new status
        setDocumentStats(prev => ({
          ...prev,
          status: response.data.status
        }));
      } catch (error) {
        console.error('Error fetching verification status:', error);
      }
    };

    if (userInfo) {
      fetchVerificationStatus();
    }
  }, [userInfo]);

  const simulateAiProcessing = async (file) => {
    setAiProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const suggestion = {
        documentType: "Medical Report",
        confidence: 92,
        sensitive: true,
        recommendations: [
          "Contains sensitive medical information",
          "Properly formatted medical report",
          "Digital signatures present"
        ]
      };
      
      setAiSuggestion(suggestion);
      setShowConfirmation(true);
    } catch (error) {
      console.error('AI processing failed:', error);
    } finally {
      setAiProcessing(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setVerificationStatus(null);
      setAiSuggestion(null);
      setShowConfirmation(false);
      
      setUploadStatus('uploading');
      try {
        // Upload the document first
        const uploadResponse = await documentApi.uploadDocument(file);
        setUploadStatus('analyzing');
        
        // Use the document_id from the upload response
        const documentId = uploadResponse.data.document_id;
        
        // Add the document to the list immediately as "Processing"
        const newDocument = {
          document_id: documentId,
          document_name: file.name,
          is_submitted: true,
          is_verified: false,
          uploaded_at: new Date().toISOString()
        };
        
        // Update documents list with the new document at the top
        setDocuments(prevDocs => [newDocument, ...prevDocs]);
        
        // Store the document ID from the upload response
        setSelectedFile({
          ...file,
          document_id: documentId  // Store the same ID here
        });
        
        const analysisResponse = await documentApi.analyzeDocuments();
        
        // Parse the JSON string from the analysis
        const parsedAnalysis = JSON.parse(analysisResponse.data.documents[0].analysis.replace(/```json\n|\n```/g, ''));
        
        setAiSuggestion(parsedAnalysis);
        setShowConfirmation(true);
        setUploadStatus('');
        
        // Set verification status with the same document ID
        setVerificationStatus({
          success: true,
          message: "Document submitted for verification successfully",
          documentId: documentId,  // Use the same ID here
          timestamp: new Date().toISOString()
        });
        
        // Fetch updated documents to ensure consistency
        await fetchDocuments();
        
      } catch (error) {
        console.error('Error processing document:', error);
        setUploadStatus('error');
      }
    }
  };

  const handleVerification = async () => {
    if (!selectedFile || !selectedFile.document_id) {
      console.error('No valid document ID found');
      return;
    }
    
    setIsLoading(true);
    try {
      // Submit document for verification
      await documentApi.submitDocuments([selectedFile.document_id]);
      
      // Update verification status with simplified information
      setVerificationStatus({
        success: true,
        message: "Document submitted for verification successfully",
        documentId: selectedFile.document_id,
        timestamp: new Date().toISOString()
      });

      // Add the new document to the documents list immediately
      const newDocument = {
        document_id: selectedFile.document_id,
        document_name: selectedFile.name,
        is_submitted: true,
        is_verified: false,
        uploaded_at: new Date().toISOString()
      };
      
      setDocuments(prevDocs => [newDocument, ...prevDocs]);
      
      // Update document stats
      setDocumentStats(prev => ({
        ...prev,
        total: prev.total + 1,
        pending: prev.pending + 1
      }));

      // Refresh full document list
      await fetchDocuments();
      
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus({
        success: false,
        error: "Submission failed. Please try again."
      });
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
      setAiSuggestion(null);
    }
  };

  const handleTicketVerification = async () => {
    if (!ticketId) return;
    
    setIsLoading(true);
    try {
      // Set the ticket ID in API headers
      setTicketHeader(ticketId);
      
      const response = await ticketApi.getDetails(ticketId);
      
      if (response.data) {
        setUserInfo({
          name: response.data.user || 'Anonymous',
          email: response.data.email || 'Email: N/A',
          phone: response.data.phone || 'Phone: N/A',
          ticketStatus: 'Active',
          ticketId: ticketId,
          createdAt: response.data.timestamp,
          totalDocuments: 15,
          verifiedDocuments: 12,
          pendingDocuments: 3,
          lastActivity: '2024-12-30 15:45'
        });
        setShowTicketModal(false);
        
        // Fetch documents after successful ticket verification
        await fetchDocuments();
      }
    } catch (error) {
      console.error('Ticket verification failed:', error);
      setUserInfo(null);
      setTicketHeader(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setAiSuggestion(null);
    setShowConfirmation(false);
  };

  const redirectToChatInterface = () => {
    window.location.href = '/chat';
  };

  const handleBlockchainVerification = async (file: File) => {
    setBlockchainProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // First store the document and get its hash
      const response = await documentApi.processBlockchain(formData);
      const documentHash = response.data.document_hash;
      setDocumentHash(documentHash);
      
      // Create new document with all necessary fields
      const newDocument = {
        document_id: documentHash,
        document_name: file.name,
        is_submitted: true,
        is_verified: false, // Document starts as unverified
        uploaded_at: new Date().toISOString(),
        document_hash: documentHash,
        blockchain_verified: false, // Document starts as unverified on blockchain
        metadata: response.data.metadata || {}
      };
      
      // Update documents list
      setDocuments(prevDocs => {
        const existingDocIndex = prevDocs.findIndex(doc => doc.document_hash === documentHash);
        if (existingDocIndex >= 0) {
          const updatedDocs = [...prevDocs];
          updatedDocs[existingDocIndex] = {
            ...updatedDocs[existingDocIndex],
            ...newDocument
          };
          return updatedDocs;
        }
        return [newDocument, ...prevDocs];
      });

      setBlockchainResult({
        exists: false,
        document_hash: documentHash,
        message: "Document successfully stored. Awaiting verification by admin."
      });
      
    } catch (error) {
      console.error('Error Uploading Document:', error);
      setBlockchainResult({
        exists: false,
        error: "Failed to store document"
      });
    } finally {
      setBlockchainProcessing(false);
    }
  };

  const renderUploadContent = () => {
    if (uploadStatus === 'uploading') {
      return (
        <div className="flex flex-col items-center space-y-3">
          <div className="p-4 bg-purple-600/20 rounded-full">
            <Upload className="h-8 w-8 text-purple-400 animate-pulse" />
          </div>
          <span className="text-lg text-gray-300">Uploading document...</span>
        </div>
      );
    }

    if (uploadStatus === 'analyzing') {
      return (
        <div className="flex flex-col items-center space-y-3">
          <div className="p-4 bg-purple-600/20 rounded-full">
            <Activity className="h-8 w-8 text-purple-400 animate-pulse" />
          </div>
          <span className="text-lg text-gray-300">Analyzing document...</span>
        </div>
      );
    }

    if (aiProcessing) {
      return (
        <div className="flex flex-col items-center space-y-3 animate-pulse">
          <div className="p-4 bg-purple-600/20 rounded-full">
            <Activity className="h-8 w-8 text-purple-400" />
          </div>
          <span className="text-lg text-gray-300">Processing document...</span>
          <span className="text-sm text-gray-500">AI analyzing content and security</span>
        </div>
      );
    }

    if (aiSuggestion && showConfirmation) {
      // Handle both new and old response formats
      const analysis = {
        missing: aiSuggestion.documentCompleteness?.missingInformation || 
                 aiSuggestion["Document Completeness"]?.["Missing Information"] || [],
        actions: aiSuggestion.requiredActions?.specificItems ||
                aiSuggestion["Required Actions"]?.["Specific Items"] || [],
        improvements: aiSuggestion.recommendations?.improvements ||
                     aiSuggestion["Recommendations"]?.["Improvements"] || []
      };

      return (
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-purple-600/20 rounded-full">
            <AlertCircle className="h-8 w-8 text-purple-400" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium text-white">AI Analysis Results</h3>
            
            {analysis.missing.length > 0 && (
              <div className="mt-4">
                <h4 className="text-purple-400 font-medium">Missing Information:</h4>
                <ul className="text-sm text-gray-400">
                  {analysis.missing.map((item, index) => (
                    <li key={index} className="mt-1">• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.actions.length > 0 && (
              <div className="mt-4">
                <h4 className="text-purple-400 font-medium">Required Actions:</h4>
                <ul className="text-sm text-gray-400">
                  {analysis.actions.map((item, index) => (
                    <li key={index} className="mt-1">• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.improvements.length > 0 && (
              <div className="mt-4">
                <h4 className="text-purple-400 font-medium">Recommendations:</h4>
                <ul className="text-sm text-gray-400">
                  {analysis.improvements.map((item, index) => (
                    <li key={index} className="mt-1">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleVerification}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Proceed with Upload
            </button>
            <button
              onClick={handleCancelUpload}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
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
    );
  };

  const renderRecentVerifications = () => (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div 
          key={doc.document_id}
          className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 backdrop-blur-sm hover:border-purple-500/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {doc.is_verified ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
              )}
              <span className="text-gray-300 font-medium">{doc.document_name}</span>
            </div>
            <div className="flex items-center gap-2">
              {doc.blockchain_verified && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 mr-2">
                  Blockchain
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                doc.is_verified 
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {doc.is_verified ? 'Verified' : 'Processing'}
              </span>
            </div>
          </div>
          <div className="text-sm space-y-1 text-gray-400">
            <p>Document ID: <span className="text-gray-300">{doc.document_id}</span></p>
            <p>Uploaded: <span className="text-gray-300">
              {new Date(doc.uploaded_at).toLocaleString()}
            </span></p>
            {(doc.document_hash || doc.blockchain_verified) && (
              <p>Hash: <span className="text-gray-300">{doc.document_hash}</span></p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderBlockchainBox = () => {
    const [showHashVerification, setShowHashVerification] = useState(false);
    const [showAIAlert, setShowAIAlert] = useState(true);
    const [showHashAlert, setShowHashAlert] = useState(true);

    return (
      <div className="bg-black/40 backdrop-blur-xl border border-blue-500/20 rounded-xl overflow-hidden shadow-xl mt-6">
        <div className="p-4 sm:p-8">
          {/* Header - Made responsive */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">Upload on Blockchain</h2>
            <button
              onClick={() => setShowHashVerification(!showHashVerification)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Verify Hash</span>
            </button>
          </div>
          
          {/* Added Dismissible Alert Messages */}
          <div className="mb-6 space-y-3">
            {showAIAlert && (
              <div className="flex items-start justify-between gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-200">
                    Note: AI analysis is not available for blockchain verification. This process only verifies document existence and authenticity.
                  </p>
                </div>
                <button 
                  onClick={() => setShowAIAlert(false)}
                  className="shrink-0 text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {showHashAlert && (
              <div className="flex items-start justify-between gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-200">
                    Important: Please save your document hash after verification. You'll need it to verify your document in the future.
                  </p>
                </div>
                <button 
                  onClick={() => setShowHashAlert(false)}
                  className="shrink-0 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Hash Verification Section - Made responsive */}
          {showHashVerification && (
            <div className="mb-8 border border-blue-500/30 rounded-xl p-4 sm:p-6 animate-fadeIn">
              <h3 className="text-lg font-medium text-white mb-4">Verify Document Hash</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter document hash to verify"
                  value={documentHash}
                  onChange={(e) => setDocumentHash(e.target.value)}
                  className="w-full flex-1 px-4 py-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={async () => {
                    if (!documentHash) return;
                    setBlockchainProcessing(true);
                    try {
                      const response = await documentApi.verifyBlockchain(documentHash);
                      setBlockchainResult(response.data);
                    } catch (error) {
                      console.error('Verification failed:', error);
                    } finally {
                      setBlockchainProcessing(false);
                    }
                  }}
                  disabled={!documentHash || blockchainProcessing}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify Hash
                </button>
              </div>
            </div>
          )}

          {/* Results Section - Added file input and fixed upload functionality */}
          <div className="border-2 border-dashed border-blue-500/30 rounded-xl p-4 sm:p-10 text-center transition-colors hover:border-blue-500/50">
            {blockchainProcessing ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-blue-600/20 rounded-full">
                  <Activity className="h-8 w-8 text-blue-400 animate-pulse" />
                </div>
                <span className="text-lg text-gray-300">Processing on Blockchain...</span>
              </div>
            ) : blockchainResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-600/20 rounded-full mx-auto w-fit">
                  {blockchainResult.exists ? (
                    <FileCheck className="h-8 w-8 text-green-400" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-blue-400" />
                  )}
                </div>
                
                <div className="text-left space-y-3">
                  <h3 className="text-lg font-medium text-white text-center mb-4">
                    Document Storage Results
                  </h3>
                  
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 space-y-2 overflow-x-auto">
                    <p className="text-gray-300 break-all">
                      <span className="text-blue-400">Document Hash:</span> {documentHash}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-blue-400">Status:</span>{' '}
                      {blockchainResult.exists ? (
                        <span className="text-green-400">Verified on Blockchain</span>
                      ) : (
                        <span className="text-blue-400">Stored Successfully - Awaiting Verification</span>
                      )}
                    </p>
                    {blockchainResult.message && (
                      <p className="text-gray-300">
                        <span className="text-blue-400">Message:</span>{' '}
                        {blockchainResult.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setBlockchainResult(null);
                    setDocumentHash('');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
                >
                  Upload Another Document
                </button>
              </div>
            ) : (
              <label htmlFor="blockchainFileInput" className="cursor-pointer">
                <input
                  type="file"
                  id="blockchainFileInput"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleBlockchainVerification(file);
                    }
                  }}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-4 bg-blue-600/20 rounded-full">
                    <Upload className="h-8 w-8 text-blue-400" />
                  </div>
                  <span className="text-lg text-gray-300">
                    Click to verify document on blockchain
                  </span>
                  <span className="text-sm text-gray-500">
                    Secure, immutable verification with blockchain technology
                  </span>
                </div>
              </label>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStatusBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return <p className="text-3xl font-semibold text-green-400">Verified</p>;
      case 'rejected':
        return <p className="text-3xl font-semibold text-red-400">Rejected</p>;
      case 'pending':
      default:
        return <p className="text-3xl font-semibold text-yellow-400">Pending Review</p>;
    }
  };

  const renderYourDocuments = () => (
    <div className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/20 backdrop-blur-sm">
      <p className="text-gray-400 mb-2">Profile Status</p>
      <div className="flex items-center gap-2">
        {renderStatusBadge()}
      </div>
    </div>
  );

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
            {/* Logo */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 464 468"
              className="w-11 h-11" 
              aria-label="ClerkTree Logo"
            >
              <path 
                fill="white"
                d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
              />
       
            </svg>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">ClerkTree</span>
              <span className="text-sm text-gray-400">Document Verification System</span>
            </div>
          </div>
          
          {/* Rest of the header content */}
          {userInfo && (
            <button 
              onClick={() => setShowUserDetails(!showUserDetails)}
              className="flex items-center gap-2 sm:gap-4 bg-purple-900/20 border border-purple-500/30 rounded-xl p-2 sm:p-4 hover:bg-purple-900/30 transition-colors"
            >
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-purple-600">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="text-left hidden xs:block">
                <h3 className="text-sm sm:text-base text-white font-medium">{userInfo.name}</h3>
                <p className="text-xs sm:text-sm text-gray-400">
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
              <h2 className="text-2xl font-semibold text-white mb-6">Upload Document</h2>
              
              <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-10 text-center transition-colors hover:border-purple-500/50">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="fileInput"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                {renderUploadContent()}
              </div>

              {verificationStatus && verificationStatus.message && (
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
                        <p>Document ID: <span className="text-gray-300">{verificationStatus.documentId}</span></p>
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

          {/* New Blockchain Verification Box */}
          {renderBlockchainBox()}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Verifications */}
            <div className="bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-xl overflow-hidden shadow-xl">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-semibold text-white">Recent Verifications</h2>
                </div>
                
                {renderRecentVerifications()}
              </div>
            </div>

            {/* Your Documents Section */}
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
                      <p className="text-3xl font-semibold text-white">{documentStats.total}</p>
                    </div>
                    {renderYourDocuments()}
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
          Clerktree • All documents are encrypted and verified
        </div>
      </div>
    </div>
  );
};

export default DocumentVerification;