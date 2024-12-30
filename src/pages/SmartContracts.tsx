import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileCheck2, AlertCircle, ArrowRight, Activity, 
  Shield, File, Upload, RefreshCcw, Check, X,
  Info, ClipboardCheck, AlertTriangle, Clock,
  Eye, ThumbsUp, Ban, Plus, FileUp
} from 'lucide-react';

const ClaimsPortal = () => {
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [documents, setDocuments] = useState([]);

  const requiredDocuments = {
    "Health": [
      { name: "Hospital Bills", required: true },
      { name: "Medical Reports", required: true },
      { name: "Prescription Details", required: true },
      { name: "Lab Test Results", required: false },
      { name: "Doctor's Notes", required: false }
    ],
    "Auto": [
      { name: "Accident Report", required: true },
      { name: "Police Report", required: true },
      { name: "Repair Estimates", required: true },
      { name: "Vehicle Photos", required: true },
      { name: "Driver's License", required: true }
    ],
    "Property": [
      { name: "Damage Photos", required: true },
      { name: "Property Value Assessment", required: true },
      { name: "Repair Quotes", required: true },
      { name: "Ownership Documents", required: true },
      { name: "Previous Claims History", required: false }
    ]
  };

  const myClaims = [
    {
      id: "CLM001",
      type: "Health",
      title: "Hospital Expense Claim",
      description: "Emergency room visit and follow-up care",
      status: "Pending Documents",
      submissionDate: "2024-12-28",
      documentsRequired: 5,
      documentsUploaded: 3,
      claimAmount: "$2,500",
      icon: FileCheck2,
      details: {
        policyNumber: "POL123456",
        incidentDate: "2024-12-20",
        hospital: "City General Hospital"
      }
    },
    {
      id: "CLM002",
      type: "Auto",
      title: "Car Accident Claim",
      description: "Front bumper damage from collision",
      status: "Under Review",
      submissionDate: "2024-12-29",
      documentsRequired: 5,
      documentsUploaded: 5,
      claimAmount: "$3,800",
      icon: Shield,
      details: {
        policyNumber: "POL789012",
        incidentDate: "2024-12-27",
        vehicle: "Toyota Camry 2022"
      }
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "Document Uploaded",
      claimId: "CLM001",
      document: "Hospital Bills",
      timestamp: "2 minutes ago",
      status: "Success"
    },
    {
      id: 2,
      type: "Claim Submitted",
      claimId: "CLM002",
      timestamp: "1 hour ago",
      status: "Success"
    },
    {
      id: 3,
      type: "Document Required",
      claimId: "CLM001",
      document: "Medical Reports",
      timestamp: "2 hours ago",
      status: "Pending"
    }
  ];

  const handleFileUpload = (claimId, documentType, file) => {
    setIsLoading(true);
    setUploadProgress(prev => ({
      ...prev,
      [documentType]: 0
    }));

    // Simulate file upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const currentProgress = prev[documentType] || 0;
        if (currentProgress >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          setDocuments(prev => [...prev, {
            name: file.name,
            type: documentType,
            size: file.size,
            uploadDate: new Date().toISOString()
          }]);
          return prev;
        }
        return {
          ...prev,
          [documentType]: currentProgress + 10
        };
      });
    }, 300);
  };

  const handleNewClaim = () => {
    setShowNewClaimModal(true);
  };

  const handleClaimSubmit = (claimData) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      alert('Claim submitted successfully!');
      setShowNewClaimModal(false);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[rgb(10,10,10)] text-white p-8">
      {/* New Claim Modal */}
      {showNewClaimModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[rgb(20,20,20)] rounded-lg p-6 max-w-2xl w-full border border-blue-500/20"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">File New Claim</h2>
              <button 
                onClick={() => setShowNewClaimModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleClaimSubmit({
                type: e.target.claimType.value,
                description: e.target.description.value,
                amount: e.target.amount.value,
                date: e.target.date.value
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Claim Type</label>
                <select 
                  name="claimType"
                  className="w-full bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-white"
                  required
                >
                  <option value="Health">Health Insurance</option>
                  <option value="Auto">Auto Insurance</option>
                  <option value="Property">Property Insurance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea 
                  name="description"
                  className="w-full h-32 bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-white"
                  placeholder="Describe what happened..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Claim Amount</label>
                  <input 
                    type="number"
                    name="amount"
                    className="w-full bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-white"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date of Incident</label>
                  <input 
                    type="date"
                    name="date"
                    className="w-full bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Submit Claim
                    </>
                  )}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowNewClaimModal(false)}
                  className="flex-1 py-2 px-4 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showUploadModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[rgb(20,20,20)] rounded-lg p-6 max-w-4xl w-full border border-blue-500/20"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Upload Documents - {selectedClaim.id}</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Required Documents List */}
              <div className="p-4 rounded-lg bg-blue-500/10">
                <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
                <div className="space-y-3">
                  {requiredDocuments[selectedClaim.type].map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-500/5 rounded">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-blue-400" />
                        <span>{doc.name}</span>
                        {doc.required && (
                          <span className="text-xs text-red-400">Required</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {uploadProgress[doc.name] ? (
                          <div className="w-32 h-2 bg-blue-500/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${uploadProgress[doc.name]}%` }}
                            />
                          </div>
                        ) : (
                          <label className="cursor-pointer px-3 py-1 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Upload
                            <input 
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileUpload(selectedClaim.id, doc.name, e.target.files[0])}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Uploaded Documents */}
              {documents.length > 0 && (
                <div className="p-4 rounded-lg bg-blue-500/10">
                  <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
                  <div className="space-y-3">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-500/5 rounded">
                        <div className="flex items-center gap-2">
                          <FileCheck2 className="w-4 h-4 text-green-400" />
                          <div>
                            <p>{doc.name}</p>
                            <p className="text-sm text-gray-400">
                              Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button className="p-1 rounded hover:bg-blue-500/20">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <FileCheck2 className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
              My Claims Portal
            </h1>
          </div>
          <button
            onClick={handleNewClaim}
            className="py-2 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Claim
          </button>
        </div>

        {/* Claims Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {myClaims.map((claim, index) => (
            <motion.div
              key={claim.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 * (index + 1) }}
            >
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <claim.icon className="w-6 h-6 text-blue-400" />
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      claim.status === 'Pending Documents' 
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : claim.status === 'Under Review'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-green-500/20 text-green-300'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{claim.title}</h3>
                  <p className="text-gray-400">{claim.description}</p>
                </div>

                <div className="space-y-2 text-sm text-gray-400 mb-6">
                  <div className="flex justify-between">
                    <span>Claim ID:</span>
                    <span className="font-mono">{claim.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Policy Number:</span>
                    <span>{claim.details.policyNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>{claim.claimAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Documents:</span>
                    <span className="text-blue-300">{claim.documentsUploaded} / {claim.documentsRequired}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      setSelectedClaim(claim);
                      setShowUploadModal(true);
                    }}
                    className="w-full py-2 px-4 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Manage Documents
                  </button>
                  
                  <button className="w-full py-2 px-4 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12"
        >
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold">Recent Activity</h2>
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 w-full bg-blue-500/20 rounded animate-pulse" />
                ))}
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="divide-y divide-blue-500/20">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {activity.status === 'Success' && <Check className="w-4 h-4 text-green-400" />}
                        {activity.status === 'Pending' && <Clock className="w-4 h-4 text-yellow-400" />}
                        <div>
                          <p className="font-medium">{activity.type}</p>
                          <p className="text-sm text-gray-400">
                            Claim ID: <span className="font-mono">{activity.claimId}</span>
                          </p>
                          {activity.document && (
                            <p className="text-sm text-gray-400">
                              Document: {activity.document}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">{activity.timestamp}</p>
                        <p className={`text-sm ${
                          activity.status === 'Success' 
                            ? 'text-green-400' 
                            : activity.status === 'Pending'
                            ? 'text-yellow-400'
                            : 'text-blue-400'
                        }`}>
                          {activity.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No recent activity to display</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Statistics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileUp className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold">Documents Uploaded</h3>
            </div>
            <p className="text-3xl font-bold">8</p>
            <p className="text-sm text-gray-400">Total files</p>
          </div>

          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold">Pending Documents</h3>
            </div>
            <p className="text-3xl font-bold">4</p>
            <p className="text-sm text-gray-400">Awaiting upload</p>
          </div>

          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold">Active Claims</h3>
            </div>
            <p className="text-3xl font-bold">2</p>
            <p className="text-sm text-gray-400">In progress</p>
          </div>

          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold">Total Value</h3>
            </div>
            <p className="text-3xl font-bold">$6.3k</p>
            <p className="text-sm text-gray-400">Claims amount</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ClaimsPortal;

