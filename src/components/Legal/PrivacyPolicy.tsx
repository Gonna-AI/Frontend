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
      content: `1.1 In this Privacy Policy ("Policy"), the following terms shall have the following meanings unless the context requires otherwise:

"Personal Data" means any information relating to an identified or identifiable natural person ("Data Subject"); an identifiable natural person is one who can be identified, directly or indirectly, in particular by reference to an identifier such as a name, an identification number, location data, an online identifier or to one or more factors specific to the physical, physiological, genetic, mental, economic, cultural or social identity of that natural person.

1.2 This Policy applies to all Personal Data processed by Us through Your use of Our Services, websites, applications, and other digital platforms (collectively, the "Services").

1.3 By accessing or using Our Services, You acknowledge that You have read and understood this Privacy Policy and agree to the collection, use, and disclosure of Your Personal Data as described herein.`
    },
    {
      title: "2. INFORMATION COLLECTION AND PROCESSING",
      content: `2.1 Categories of Personal Data Collected

2.1.1 Information You Provide to Us:
(a) Account and Profile Information: When You register for Our Services, We collect Your name, email address, password, and other registration information;
(b) Communication Data: Information You provide when communicating with Us, including customer support inquiries and feedback;
(c) Transaction Data: Information related to Your purchases and billing, including payment card details and billing address.

2.1.2 Information Automatically Collected:
(a) Device and Usage Data: Including but not limited to Your IP address, browser type and version, operating system, device identifiers, and interaction patterns with Our Services;
(b) Location Data: Approximate location derived from IP address;
(c) Cookie and Tracking Data: Information collected through cookies, web beacons, and similar technologies as detailed in Our Cookie Policy.

2.2 Legal Basis for Processing

2.2.1 We process Your Personal Data on the following legal bases:
(a) Performance of a contract with You;
(b) Our legitimate interests;
(c) Compliance with legal obligations;
(d) Your consent, where specifically requested.`
    },
    {
      title: "3. USE AND DISCLOSURE OF PERSONAL DATA",
      content: `3.1 Purposes of Processing

3.1.1 We process Your Personal Data for the following purposes:
(a) To provide and maintain Our Services;
(b) To process Your transactions and manage Your account;
(c) To communicate with You regarding Service updates, security alerts, and support messages;
(d) To detect, prevent, and address technical issues, fraud, or other illegal activities;
(e) To analyze and improve Our Services;
(f) To comply with legal obligations.

3.2 Information Sharing and Disclosure

3.2.1 We may share Your Personal Data with:
(a) Service Providers: Third-party vendors who assist in providing Our Services;
(b) Business Partners: In connection with offering co-branded services or products;
(c) Legal Requirements: When required by applicable law, regulation, or legal process;
(d) Business Transfers: In connection with a merger, acquisition, or sale of assets.

3.2.2 All third parties are contractually obligated to protect Your Personal Data and may only process it for specified purposes.`
    },
    {
      title: "4. DATA RETENTION AND SECURITY",
      content: `4.1 Data Retention

4.1.1 We retain Your Personal Data for as long as necessary to:
(a) Provide Our Services to You;
(b) Comply with legal obligations;
(c) Resolve disputes;
(d) Enforce Our agreements.

4.2 Security Measures

4.2.1 We implement appropriate technical and organizational measures to protect Your Personal Data, including:
(a) Encryption of data in transit and at rest;
(b) Regular security assessments and penetration testing;
(c) Access controls and authentication mechanisms;
(d) Physical and environmental security measures.

4.2.2 While We strive to protect Your Personal Data, no method of transmission over the Internet or electronic storage is 100% secure. Therefore, We cannot guarantee absolute security.`
    },
    {
      title: "5. YOUR RIGHTS AND CHOICES",
      content: `5.1 Data Subject Rights

5.1.1 You have the following rights regarding Your Personal Data:
(a) Right to Access: Obtain confirmation of whether We process Your Personal Data and request copies of such data;
(b) Right to Rectification: Request correction of inaccurate data or completion of incomplete data;
(c) Right to Erasure: Request deletion of Personal Data in certain circumstances;
(d) Right to Restrict Processing: Limit Our processing of Your Personal Data;
(e) Right to Data Portability: Receive Your Personal Data in a structured, commonly used format;
(f) Right to Object: Object to processing based on legitimate interests or direct marketing.

5.2 Exercise of Rights

5.2.1 To exercise Your rights:
(a) Submit a request through Our privacy portal;
(b) Contact Our Data Protection Officer at privacy@example.com;
(c) Response will be provided within 30 days unless extended by applicable law.`
    },
    {
      title: "6. INTERNATIONAL TRANSFERS",
      content: `6.1 Cross-border Data Transfers

6.1.1 We may transfer Your Personal Data to countries outside Your jurisdiction. When We do so, We ensure appropriate safeguards are in place, including:
(a) Standard contractual clauses approved by relevant data protection authorities;
(b) Binding corporate rules for transfers within Our corporate group;
(c) Other legally approved transfer mechanisms.

6.1.2 By using Our Services, You consent to the transfer of Your Personal Data to countries that may have different data protection laws than Your jurisdiction.`
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
                For privacy-related inquiries, please contact{' '}
                <a 
                  href="mailto:privacy@example.com"
                  className={cn(
                    "underline hover:no-underline transition-all duration-200",
                    isDark ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"
                  )}
                >
                  us
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