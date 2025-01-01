import React from 'react';
import { ArrowLeft, Sun, Moon, Lock, ChevronDown } from 'lucide-react';

const PrivacyPolicy = () => {
  const [isDark, setIsDark] = React.useState(false);
  const [expandedSection, setExpandedSection] = React.useState(null);
  
  const cn = (...classes) => {
    return classes.filter(Boolean).join(' ');
  };

  const sections = [
    {
        title: "1. DEFINITIONS AND SCOPE",
        content: `1.1 Key Definitions
  
  "Personal Data" means any information relating to an identified or identifiable natural person, including but not limited to:
  (a) Customer identification information
  (b) Claims documentation and details
  (c) Health and medical information
  (d) Financial records and information
  (e) Contact information and preferences
  (f) Authentication credentials
  (g) System usage patterns and history
  
  "Sensitive Data" includes:
  (a) Medical records and health information
  (b) Financial account details
  (c) Government-issued identification numbers
  (d) Biometric data
  (e) Protected health information under HIPAA
  
  "Processing" means any operation performed on Personal Data, including:
  (a) Collection and recording
  (b) Organization and structuring
  (c) Storage and retrieval
  (d) AI analysis and automated processing
  (e) Transmission and disclosure
  (f) Deletion and destruction
  
  1.2 Scope of Policy
  
  This Privacy Policy applies to:
  (a) All users of our AI-powered claims processing system
  (b) All data processed through our platform
  (c) All related services and features
  (d) All jurisdictions where our service operates
  (e) All forms of data collection and processing`
      },
      {
        title: "2. DATA COLLECTION AND SOURCES",
        content: `2.1 Categories of Data Collected
  
  2.1.1 Claims Processing Data:
  (a) Policy information and details
  (b) Claim documentation and evidence
  (c) Assessment reports and evaluations
  (d) Payment and settlement information
  (e) Historical claims data
  
  2.1.2 User Account Data:
  (a) Professional credentials
  (b) Authentication information
  (c) System access logs
  (d) Usage patterns and preferences
  (e) Training and certification records
  
  2.1.3 Technical Data:
  (a) Device information and identifiers
  (b) IP addresses and location data
  (c) Browser type and settings
  (d) Operating system information
  (e) Network connection details
  
  2.2 Collection Methods
  
  2.2.1 Direct Collection:
  (a) User input and submissions
  (b) Account registration
  (c) File uploads
  (d) Communication records
  (e) Training interactions
  
  2.2.2 Automated Collection:
  (a) AI processing systems
  (b) Analytics tools
  (c) Cookies and tracking technologies
  (d) System logs
  (e) Security monitoring
  
  2.3 Data Source Categories:
  (a) Insurance providers
  (b) Healthcare providers
  (c) Financial institutions
  (d) Government agencies
  (e) Third-party service providers`
      },
      {
        title: "3. USE OF PERSONAL DATA",
        content: `3.1 Primary Processing Purposes
  
  3.1.1 Claims Processing:
  (a) Claim verification and validation
  (b) Risk assessment and analysis
  (c) Fraud detection and prevention
  (d) Payment processing
  (e) Documentation management
  
  3.1.2 Service Optimization:
  (a) AI model training and improvement
  (b) System performance enhancement
  (c) User experience optimization
  (d) Process automation refinement
  (e) Quality control measures
  
  3.1.3 Compliance and Reporting:
  (a) Regulatory compliance
  (b) Audit trail maintenance
  (c) Legal requirement fulfillment
  (d) Industry standard adherence
  (e) Statistical reporting
  
  3.2 Legal Bases for Processing
  
  3.2.1 Contractual Necessity:
  (a) Service provision
  (b) Account management
  (c) Payment processing
  (d) Communication delivery
  
  3.2.2 Legal Obligations:
  (a) Insurance regulations
  (b) Data protection laws
  (c) Financial reporting requirements
  (d) Healthcare information standards
  
  3.2.3 Legitimate Interests:
  (a) Fraud prevention
  (b) Security maintenance
  (c) Service improvement
  (d) Research and development`
      },
      {
        title: "4. DATA SHARING AND DISCLOSURE",
        content: `4.1 Categories of Recipients
  
  4.1.1 Service Providers:
  (a) Cloud infrastructure providers
  (b) Payment processors
  (c) Analytics services
  (d) Security vendors
  (e) Professional service providers
  
  4.1.2 Business Partners:
  (a) Insurance companies
  (b) Healthcare providers
  (c) Financial institutions
  (d) Audit firms
  (e) Legal advisors
  
  4.1.3 Regulatory Bodies:
  (a) Insurance regulators
  (b) Data protection authorities
  (c) Healthcare oversight agencies
  (d) Financial regulators
  
  4.2 Data Transfer Safeguards
  
  4.2.1 International Transfers:
  (a) Standard contractual clauses
  (b) Adequacy decisions
  (c) Binding corporate rules
  (d) Security certifications
  
  4.2.2 Third-Party Requirements:
  (a) Data processing agreements
  (b) Security assessments
  (c) Compliance verifications
  (d) Regular audits`
      },
      {
        title: "5. DATA SECURITY",
        content: `5.1 Technical Measures
  
  5.1.1 Infrastructure Security:
  (a) Encryption in transit and at rest
  (b) Firewalls and intrusion detection
  (c) Access controls and authentication
  (d) Backup and recovery systems
  (e) Network segmentation
  
  5.1.2 Application Security:
  (a) Secure development practices
  (b) Vulnerability scanning
  (c) Penetration testing
  (d) Code reviews
  (e) Security patches
  
  5.2 Organizational Measures
  
  5.2.1 Access Management:
  (a) Role-based access control
  (b) Authentication requirements
  (c) Access review procedures
  (d) Account termination process
  
  5.2.2 Employee Controls:
  (a) Security training
  (b) Confidentiality agreements
  (c) Background checks
  (d) Security awareness programs
  
  5.3 Incident Response
  
  5.3.1 Breach Procedures:
  (a) Detection and assessment
  (b) Containment measures
  (c) Notification procedures
  (d) Recovery processes`
      },
      {
        title: "6. DATA RETENTION AND DELETION",
        content: `6.1 Retention Periods
  
  6.1.1 Claims Data:
  (a) Active claims: Duration of processing
  (b) Closed claims: 7 years minimum
  (c) Disputed claims: Until resolution plus 7 years
  (d) Regulatory requirements: As mandated
  
  6.1.2 Account Data:
  (a) Active accounts: Duration of service
  (b) Inactive accounts: 2 years
  (c) Audit logs: 7 years
  (d) Training records: 5 years
  
  6.2 Deletion Procedures
  
  6.2.1 Data Removal:
  (a) Secure erasure protocols
  (b) Media sanitization
  (c) Archive purging
  (d) Backup cleanup
  
  6.2.2 Retention Exceptions:
  (a) Legal holds
  (b) Regulatory requirements
  (c) Contractual obligations
  (d) Technical constraints`
      },
      {
        title: "7. USER RIGHTS AND CHOICES",
        content: `7.1 Data Subject Rights
  
  7.1.1 Access Rights:
  (a) Data copy requests
  (b) Processing information
  (c) Recipients disclosure
  (d) Retention periods
  
  7.1.2 Control Rights:
  (a) Rectification requests
  (b) Processing restrictions
  (c) Portability options
  (d) Deletion requests
  
  7.2 Exercise of Rights
  
  7.2.1 Request Procedures:
  (a) Verification requirements
  (b) Response timeframes
  (c) Format options
  (d) Appeal process
  
  7.2.2 Limitations:
  (a) Legal restrictions
  (b) Technical constraints
  (c) Third-party rights
  (d) Legitimate business needs`
      },
      {
        title: "8. COMPLIANCE AND ACCOUNTABILITY",
        content: `8.1 Regulatory Framework
  
  8.1.1 Applicable Laws:
  (a) Data protection regulations
  (b) Insurance laws
  (c) Healthcare privacy rules
  (d) Industry standards
  
  8.1.2 Compliance Measures:
  (a) Policy implementation
  (b) Training programs
  (c) Audit procedures
  (d) Documentation maintenance
  
  8.2 Governance Structure
  
  8.2.1 Responsibilities:
  (a) Data Protection Officer
  (b) Privacy team
  (c) Security team
  (d) Compliance officers
  
  8.2.2 Assessment Procedures:
  (a) Impact assessments
  (b) Risk evaluations
  (c) Compliance audits
  (d) Regular reviews`
      },
      {
        title: "9. CONTACT AND COMPLAINTS",
        content: `9.1 Contact Information
  
  9.1.1 Privacy Inquiries:
  (a) Data Protection Officer
  (b) Privacy team
  (c) Support channels
  (d) Legal department
  
  9.1.2 Complaint Procedures:
  (a) Internal resolution process
  (b) Escalation paths
  (c) External resources
  (d) Regulatory contacts
  
  9.2 Updates and Notifications
  
  9.2.1 Policy Changes:
  (a) Review procedures
  (b) Update notifications
  (c) Version control
  (d) Archive maintenance`
      }
  ];

  const GlassContainer = ({ children, className }) => (
    <div className={cn(
      "relative overflow-hidden",
      "rounded-xl p-6",
      isDark 
        ? "bg-black/20 border border-white/10" 
        : "bg-white/60 border border-black/5",
      "transition-all duration-200",
      className
    )}>
      {children}
    </div>
  );

  const IconContainer = ({ children }) => (
    <div className={cn(
      "w-12 h-12 rounded-xl flex items-center justify-center",
      isDark 
        ? "bg-black/20 border border-white/10" 
        : "bg-white/60 border border-black/5"
    )}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-400/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/40 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className={cn(
        "relative min-h-screen p-4 md:p-6 backdrop-blur-sm transition-colors duration-300",
        isDark ? "bg-black/50" : "bg-white/50"
      )}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200",
                isDark 
                  ? "bg-black/20 hover:bg-black/30 text-white border border-white/10" 
                  : "bg-white/60 hover:bg-white/70 text-black border border-black/5"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={() => setIsDark(!isDark)}
              className={cn(
                "p-3 rounded-xl transition-all duration-200",
                isDark 
                  ? "bg-black/20 hover:bg-black/30 text-white border border-white/10" 
                  : "bg-white/60 hover:bg-white/70 text-black border border-black/5"
              )}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Main Card */}
          <GlassContainer>
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
              <IconContainer>
                <Lock className={cn(
                  "w-6 h-6",
                  isDark ? "text-purple-400" : "text-purple-600"
                )} />
              </IconContainer>
              <div>
                <h1 className={cn(
                  "text-2xl font-semibold",
                  isDark ? "text-white" : "text-black"
                )}>
                  Privacy Policy
                </h1>
                <p className={isDark ? "text-white/60" : "text-black/60"}>
                  Last Updated: December 28, 2024
                </p>
              </div>
            </div>

            {/* Legal Notice */}
            <div className={cn(
              "p-4 rounded-xl mb-6",
              isDark 
                ? "bg-blue-500/20 border border-blue-500/20" 
                : "bg-blue-500/10 border border-blue-500/10"
            )}>
              <p className={cn(
                "text-sm",
                isDark ? "text-blue-200" : "text-blue-700"
              )}>
                PLEASE READ THIS PRIVACY POLICY CAREFULLY. THIS POLICY DESCRIBES HOW WE COLLECT, USE, AND HANDLE YOUR PERSONAL INFORMATION WHEN YOU USE OUR SERVICES.
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-4">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-xl transition-all duration-200",
                    isDark 
                      ? "bg-black/20 hover:bg-black/30 border border-white/10" 
                      : "bg-white/60 hover:bg-white/70 border border-black/5"
                  )}
                >
                  <button
                    onClick={() => setExpandedSection(expandedSection === index ? null : index)}
                    className="w-full px-4 py-4 flex items-center justify-between"
                  >
                    <h2 className={cn(
                      "text-lg font-semibold text-left",
                      isDark ? "text-white" : "text-black"
                    )}>
                      {section.title}
                    </h2>
                    <ChevronDown 
                      className={cn(
                        "w-5 h-5 transition-transform",
                        isDark ? "text-white/60" : "text-black/60",
                        expandedSection === index ? "transform rotate-180" : ""
                      )} 
                    />
                  </button>
                  {expandedSection === index && (
                    <div className={cn(
                      "px-4 pb-4",
                      "font-mono text-sm whitespace-pre-wrap",
                      isDark ? "text-white/60" : "text-black/60"
                    )}>
                      {section.content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className={cn(
              "mt-8 pt-6 border-t",
              isDark ? "border-white/10" : "border-black/5"
            )}>
              <p className={cn(
                "text-center text-sm",
                isDark ? "text-white/40" : "text-black/40"
              )}>
                BY USING OUR SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTOOD THIS PRIVACY POLICY AND CONSENT TO THE COLLECTION AND USE OF YOUR INFORMATION AS DESCRIBED HEREIN.
              </p>
              <p className={cn(
                "text-center mt-4",
                isDark ? "text-white/60" : "text-black/60"
              )}>
                For privacy-related inquiries, please contact us:  {' '}
                <a 
                  href="mailto:contact@clerktree.com"
                  className={cn(
                    "underline hover:no-underline transition-all duration-200",
                    isDark ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"
                  )}
                >
                  contact@clerktree.com
                </a>
              </p>
            </div>
          </GlassContainer>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;