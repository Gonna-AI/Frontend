import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Shield, ChevronDown } from 'lucide-react';

const TermsOfService = () => {
  const [isDark, setIsDark] = React.useState(false);
  const [expandedSection, setExpandedSection] = React.useState(null);

  const cn = (...classes) => {
    return classes.filter(Boolean).join(' ');
  };

  const sections = [
    {
      title: "1. DEFINITIONS AND INTERPRETATION",
      content: `1.1 In these Terms of Service ("Terms") and all documents incorporated herein by reference, the following words and expressions have the following meanings:
  
  "Agreement" means collectively these Terms of Service, Privacy Policy, and any other documents incorporated by reference herein;
  
  "Service" means any and all services, features, content, and functionality provided through our AI-powered claims processing platform, including:
  (a) Our claims management system;
  (b) AI-powered analysis and processing tools;
  (c) Customer service interaction management;
  (d) Automated scheduling systems;
  (e) Knowledge base and documentation systems;
  (f) Any related websites, applications, and digital platforms;
  
  "User", "You", or "Your" refers to the individual, entity, or organization accessing the Service, including claims processing agents, administrators, and authorized personnel;
  
  "We", "Us", "Our", or "Company" refers to [Company Name], a corporation organized under the laws of [Jurisdiction];
  
  "Claims Data" means all information, documentation, and data related to insurance claims processed through the Service;
  
  "AI System" means our proprietary artificial intelligence and machine learning systems used for claims processing, analysis, and automation.
  
  1.2 The headings in this Agreement are for convenience only and shall not affect interpretation. Words importing the singular shall include the plural and vice versa.
  
  1.3 In the event of any conflict between these Terms and any other document incorporated herein by reference, these Terms shall prevail to the extent of the inconsistency.`
    },
    {
      title: "2. ACCEPTANCE AND ELIGIBILITY",
      content: `2.1 BY ACCESSING OR USING THE SERVICE IN ANY WAY, YOU:
  
  (a) REPRESENT AND WARRANT THAT:
      (i) You have reached the legal age of majority in your jurisdiction;
      (ii) You have the capacity to enter into binding obligations;
      (iii) You are an authorized representative of your organization with authority to bind it;
      (iv) You have completed all required training for using AI-assisted claims processing systems.
  
  (b) AGREE TO BE BOUND BY:
      (i) These Terms of Service;
      (ii) Our Privacy Policy;
      (iii) All applicable laws and regulations;
      (iv) All security and data protection requirements.
  
  2.2 User Eligibility Requirements:
  (a) Must be a verified claims processing professional;
  (b) Must complete mandatory system training;
  (c) Must maintain required certifications and credentials;
  (d) Must comply with all applicable insurance regulations.
  
  2.3 Account Requirements:
  (a) One account per authorized user;
  (b) Accurate and current professional credentials;
  (c) Valid organizational email address;
  (d) Completed verification process.`
    },
    {
      title: "3. SERVICE ACCESS AND MODIFICATIONS",
      content: `3.1 Service Access:
  (a) Access is granted on a subscription basis;
  (b) Requires valid authentication credentials;
  (c) Subject to usage limitations and quotas;
  (d) May be restricted based on jurisdiction or role.
  
  3.2 Modifications to Service:
  We reserve the right to modify, update, or discontinue the Service at our discretion:
  (a) System updates and improvements;
  (b) AI model refinements;
  (c) Interface modifications;
  (d) Feature additions or removals;
  (e) Processing workflow changes;
  (f) Security enhancements.
  
  3.3 System Availability:
  (a) We strive for 99.9% uptime but do not guarantee continuous availability;
  (b) Scheduled maintenance windows will be communicated in advance;
  (c) Emergency updates may be deployed without notice;
  (d) Service may be interrupted for security or compliance reasons.
  
  3.4 Version Control:
  (a) Only authorized versions of the Service may be used;
  (b) Automatic updates may be required;
  (c) Legacy versions may be deprecated;
  (d) Compatibility requirements must be maintained.`
    },
    {
      title: "4. DATA HANDLING AND PRIVACY",
      content: `4.1 Data Processing:
  (a) All Claims Data processed according to applicable laws;
  (b) Strict confidentiality maintained;
  (c) Data encryption in transit and at rest;
  (d) Regular security audits and compliance checks.
  
  4.2 Data Rights:
  (a) Company retains rights to aggregated and anonymized data;
  (b) Training data used for AI system improvement;
  (c) Analytics data used for service optimization;
  (d) Audit logs maintained for compliance.
  
  4.3 Privacy Compliance:
  (a) GDPR compliance where applicable;
  (b) HIPAA compliance for health-related claims;
  (c) State and federal privacy regulations;
  (d) Industry-specific data protection requirements.
  
  4.4 Data Retention:
  (a) Claims Data retained per regulatory requirements;
  (b) Audit logs maintained for 7 years;
  (c) User activity records preserved as required;
  (d) Backup data maintained securely.`
    },
    {
      title: "5. USER OBLIGATIONS AND RESTRICTIONS",
      content: `5.1 User Responsibilities:
  (a) Maintain accurate credentials;
  (b) Ensure secure access to the Service;
  (c) Report security incidents promptly;
  (d) Complete required training;
  (e) Verify AI processing results;
  (f) Maintain data accuracy.
  
  5.2 Prohibited Activities:
  Users shall not:
  (a) Share access credentials;
  (b) Bypass security measures;
  (c) Modify AI processing results;
  (d) Extract data unauthorized;
  (e) Interface with other systems without permission;
  (f) Upload malicious content.
  
  5.3 Security Requirements:
  (a) Multi-factor authentication use;
  (b) Regular password updates;
  (c) Secure workstation maintenance;
  (d) Encrypted communications;
  (e) Clean desk policy compliance.
  
  5.4 Performance Standards:
  (a) Maintain processing accuracy;
  (b) Meet response time requirements;
  (c) Follow quality control procedures;
  (d) Adhere to compliance checklist.`
    },
    {
      title: "6. INTELLECTUAL PROPERTY",
      content: `6.1 Ownership:
  (a) All Service components remain Company property;
  (b) AI models and algorithms are proprietary;
  (c) Interface designs are protected;
  (d) Documentation is copyrighted.
  
  6.2 License Grant:
  (a) Limited, non-exclusive license to use Service;
  (b) No modification rights granted;
  (c) No redistribution permitted;
  (d) No white-labeling allowed.
  
  6.3 Restrictions:
  (a) No reverse engineering;
  (b) No competitive analysis;
  (c) No unauthorized access;
  (d) No derivative works.`
    },
    {
      title: "7. LIABILITY AND INDEMNIFICATION",
      content: `7.1 Limitation of Liability:
  TO THE MAXIMUM EXTENT PERMITTED BY LAW:
  (a) No liability for indirect damages;
  (b) No liability for AI processing decisions;
  (c) Limited to direct damages;
  (d) Capped at fees paid.
  
  7.2 Indemnification:
  User shall indemnify Company against:
  (a) Unauthorized use;
  (b) Data breaches caused by User;
  (c) Regulatory violations;
  (d) Third-party claims.
  
  7.3 Insurance:
  (a) Users must maintain professional liability insurance;
  (b) Cyber insurance requirements;
  (c) Coverage minimums;
  (d) Proof of insurance.`
    },
    {
      title: "8. TERM AND TERMINATION",
      content: `8.1 Term:
  (a) Effective upon Service access;
  (b) Continues until terminated;
  (c) Subject to renewal requirements;
  (d) Minimum commitment periods.
  
  8.2 Termination Rights:
  (a) By either party with notice;
  (b) Immediate for breach;
  (c) Automatic for non-compliance;
  (d) Regulatory requirement changes.
  
  8.3 Post-Termination:
  (a) Immediate access termination;
  (b) Data preservation requirements;
  (c) Confidentiality obligations continue;
  (d) Wind-down procedures.`
    },
    {
      title: "9. GOVERNING LAW AND JURISDICTION",
      content: `9.1 Governing Law:
  (a) Laws of [Jurisdiction];
  (b) Without regard to conflicts;
  (c) Excluding UN Convention;
  (d) Local regulations apply.
  
  9.2 Dispute Resolution:
  (a) Mandatory mediation first;
  (b) Arbitration if required;
  (c) Court proceedings as last resort;
  (d) Venue restrictions.
  
  9.3 Compliance:
  (a) Industry regulations;
  (b) Data protection laws;
  (c) Insurance requirements;
  (d) Professional standards.`
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
                <Shield className={cn(
                  "w-6 h-6",
                  isDark ? "text-purple-400" : "text-purple-600"
                )} />
              </IconContainer>
              <div>
                <h1 className={cn(
                  "text-2xl font-semibold",
                  isDark ? "text-white" : "text-black"
                )}>
                  Terms of Service
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
                ? "bg-red-500/20 border border-red-500/20"
                : "bg-red-500/10 border border-red-500/10"
            )}>
              <p className={cn(
                "text-sm",
                isDark ? "text-red-200" : "text-red-700"
              )}>
                IMPORTANT LEGAL NOTICE: PLEASE READ THESE TERMS OF SERVICE CAREFULLY BEFORE USING OUR SERVICE. THESE TERMS CONSTITUTE A LEGALLY BINDING AGREEMENT.
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
                BY USING OUR SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTOOD THESE TERMS OF SERVICE AND AGREE TO BE BOUND BY THEM.
              </p>
              <p className={cn(
                "text-center mt-4",
                isDark ? "text-white/60" : "text-black/60"
              )}>
                For legal inquiries, please visit our  {''}
                <Link
                  to="/contact"
                  className={cn(
                    "underline hover:no-underline transition-all duration-200",
                    isDark ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"
                  )}
                >
                  Contact page
                </Link>
              </p>
            </div>
          </GlassContainer>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;