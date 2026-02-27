import React from "react";
import { ArrowLeft, Sun, Moon, ShieldCheck, ChevronDown } from "lucide-react";

const Security = () => {
  const [isDark, setIsDark] = React.useState(false);
  const [expandedSection, setExpandedSection] = React.useState(null);

  const cn = (...classes) => {
    return classes.filter(Boolean).join(" ");
  };

  const sections = [
    {
      title: "1. SECURITY INFRASTRUCTURE",
      content: `1.1 Enterprise-Grade Security Architecture

(a) Multi-Layered Security Model:
    (i) Network security with advanced firewalls and intrusion detection/prevention systems
    (ii) Application-level security with OWASP Top 10 protection
    (iii) Data-level security with granular access controls
    (iv) Physical security for data centers and infrastructure
    (v) Personnel security with background checks and training

(b) Security Operations Center (SOC):
    (i) 24/7 security monitoring and threat detection
    (ii) Real-time incident response capabilities
    (iii) Advanced threat intelligence integration
    (iv) Security information and event management (SIEM)
    (v) Automated security orchestration and response (SOAR)

(c) Infrastructure Security:
    (i) Distributed Denial of Service (DDoS) protection
    (ii) Web application firewall (WAF) implementation
    (iii) Network segmentation and micro-segmentation
    (iv) Zero-trust network architecture
    (v) Secure API gateway implementation

1.2 Cloud Security Posture

(a) Cloud Infrastructure:
    (i) SOC 2 Type II certified cloud providers
    (ii) ISO 27001 certified data centers
    (iii) Multi-region redundancy for high availability
    (iv) Geo-redundant backup systems
    (v) Automated disaster recovery capabilities

(b) Container and Orchestration Security:
    (i) Kubernetes security best practices
    (ii) Container image scanning and vulnerability assessment
    (iii) Runtime security monitoring
    (iv) Network policy enforcement
    (v) Secrets management with HashiCorp Vault`,
    },
    {
      title: "2. DATA ENCRYPTION AND PROTECTION",
      content: `2.1 Encryption Standards

(a) Data at Rest:
    (i) AES-256 bit encryption for all stored data
    (ii) Database-level encryption with transparent data encryption (TDE)
    (iii) File system encryption for all storage volumes
    (iv) Encrypted backups with separate key management
    (v) Hardware security modules (HSM) for key storage

(b) Data in Transit:
    (i) TLS 1.3 encryption for all network communications
    (ii) Perfect Forward Secrecy (PFS) implementation
    (iii) Certificate pinning for mobile applications
    (iv) Secure WebSocket connections (WSS)
    (v) End-to-end encryption for sensitive communications

(c) Data in Use:
    (i) Memory encryption for processing sensitive data
    (ii) Confidential computing for AI workloads
    (iii) Secure enclaves for cryptographic operations
    (iv) Encrypted RAM for high-security processes
    (v) Secure multi-party computation where applicable

2.2 Key Management

(a) Encryption Key Lifecycle:
    (i) Automated key generation using cryptographically secure random number generators
    (ii) Secure key distribution via hardware security modules
    (iii) Regular key rotation (minimum 90-day cycles)
    (iv) Secure key storage in isolated environments
    (v) Secure key destruction following NIST guidelines

(b) Key Management Infrastructure:
    (i) Hardware Security Modules (HSM) for master key storage
    (ii) Multi-party key ceremony for root key generation
    (iii) Key escrow procedures for business continuity
    (iv) Audit logging of all key operations
    (v) Automated key backup and recovery procedures

2.3 Data Protection Mechanisms

(a) Data Loss Prevention (DLP):
    (i) Content inspection and classification
    (ii) Policy-based data access controls
    (iii) Automated blocking of unauthorized data transfers
    (iv) Data exfiltration detection and prevention
    (v) User behavior analytics for anomaly detection

(b) Data Masking and Tokenization:
    (i) Dynamic data masking for development environments
    (ii) Format-preserving encryption for structured data
    (iii) Tokenization for payment card information
    (iv) Pseudonymization for personal identifiable information
    (v) Anonymization for analytics and testing data`,
    },
    {
      title: "3. ACCESS CONTROL AND AUTHENTICATION",
      content: `3.1 Identity and Access Management (IAM)

(a) Multi-Factor Authentication (MFA):
    (i) Mandatory MFA for all user accounts
    (ii) Support for FIDO2/WebAuthn hardware tokens
    (ii) Time-based One-Time Password (TOTP) authentication
    (iv) Biometric authentication options (fingerprint, facial recognition)
    (v) SMS and email verification as fallback options
    (vi) Adaptive authentication based on risk scoring

(b) Single Sign-On (SSO):
    (i) SAML 2.0 integration for enterprise customers
    (ii) OAuth 2.0 and OpenID Connect support
    (iii) Integration with major identity providers (Okta, Azure AD, Google Workspace)
    (iv) Just-in-Time (JIT) user provisioning
    (v) Centralized session management

(c) Password Security:
    (i) Minimum 12-character password requirement
    (ii) Complexity requirements enforced
    (iii) Passwords hashed using Argon2 algorithm
    (iv) Salt and pepper techniques for additional security
    (v) Password breach detection using Have I Been Pwned database
    (vi) Mandatory password rotation every 90 days for privileged accounts

3.2 Authorization and Role-Based Access Control (RBAC)

(a) Least Privilege Principle:
    (i) Default-deny access policy
    (ii) Granular permission assignment
    (iii) Role-based access control with predefined roles
    (iv) Attribute-based access control (ABAC) for complex scenarios
    (v) Regular access reviews and recertification

(b) Privileged Access Management (PAM):
    (i) Separate privileged accounts for administrative tasks
    (ii) Just-in-Time (JIT) privilege elevation
    (iii) Time-limited access grants
    (iv) Session recording for privileged activities
    (v) Break-glass procedures for emergency access

(c) API Security:
    (i) API key authentication with rate limiting
    (ii) OAuth 2.0 token-based authentication
    (iii) JWT token validation and refresh mechanisms
    (iv) API versioning and deprecation policies
    (v) Comprehensive API audit logging

3.3 Session Management

(a) Session Security:
    (i) Secure session cookie attributes (HttpOnly, Secure, SameSite)
    (ii) Session timeout after 30 minutes of inactivity
    (iii) Absolute session timeout after 8 hours
    (iv) Session invalidation on password change
    (v) Concurrent session detection and management

(b) Account Security:
    (i) Account lockout after 5 failed login attempts
    (ii) Progressive delays for subsequent failed attempts
    (iii) CAPTCHA implementation for suspicious activities
    (iv) Geolocation-based anomaly detection
    (v) Device fingerprinting for known device tracking`,
    },
    {
      title: "4. APPLICATION SECURITY",
      content: `4.1 Secure Development Lifecycle

(a) Security by Design:
    (i) Threat modeling in design phase
    (ii) Security requirements analysis
    (iii) Secure architecture review
    (iv) Privacy impact assessments
    (v) Security design patterns implementation

(b) Secure Coding Practices:
    (i) OWASP Top 10 vulnerability prevention
    (ii) Input validation and sanitization
    (iii) Output encoding for all user-generated content
    (iv) Parameterized queries for database operations
    (v) Secure error handling without information leakage
    (vi) Automated security linting in development

(c) Code Security Reviews:
    (i) Peer code reviews with security checklist
    (ii) Static Application Security Testing (SAST)
    (iii) Software Composition Analysis (SCA) for dependencies
    (iv) Secrets scanning in code repositories
    (v) Manual security code review for critical components

4.2 Vulnerability Management

(a) Vulnerability Assessment:
    (i) Automated vulnerability scanning (weekly)
    (ii) Dynamic Application Security Testing (DAST)
    (iii) Interactive Application Security Testing (IAST)
    (iv) Penetration testing (quarterly)
    (v) Bug bounty program for responsible disclosure

(b) Patch Management:
    (i) Critical vulnerabilities patched within 24 hours
    (ii) High-severity vulnerabilities patched within 7 days
    (iii) Medium/Low severity vulnerabilities addressed within 30 days
    (iv) Automated dependency updates with security scanning
    (v) Rollback procedures for problematic updates

(c) Third-Party Risk Management:
    (i) Vendor security assessment questionnaires
    (ii) Regular security audits of critical vendors
    (iii) Contractual security requirements
    (iv) Continuous monitoring of third-party libraries
    (v) Incident response coordination with vendors

4.3 API and Integration Security

(a) API Security Controls:
    (i) Rate limiting and throttling
    (ii) Request size limitations
    (iii) API versioning and backward compatibility
    (iv) Input validation and schema enforcement
    (v) Comprehensive API documentation with security considerations

(b) Integration Security:
    (i) Secure service-to-service authentication
    (ii) Encrypted inter-service communications
    (iii) API gateway for centralized security enforcement
    (iv) Message queue security and encryption
    (v) Webhook signature verification`,
    },
    {
      title: "5. AI AND DATA PROCESSING SECURITY",
      content: `5.1 AI Model Security

(a) Model Protection:
    (i) Encrypted storage of trained models
    (ii) Access controls for model artifacts
    (iii) Version control and integrity verification
    (iv) Model watermarking for intellectual property protection
    (v) Secure model deployment pipelines

(b) Training Data Security:
    (i) Data sanitization before training
    (ii) Differential privacy techniques for training data
    (iii) Federated learning for distributed training
    (iv) Synthetic data generation for testing
    (v) Data lineage tracking and audit trails

(c) AI Safety and Robustness:
    (i) Adversarial testing for model robustness
    (ii) Input validation for AI endpoints
    (iii) Output validation and sanitization
    (iv) Model monitoring for drift and anomalies
    (v) Explainability and interpretability features

5.2 Data Processing Security

(a) Claims Data Processing:
    (i) Isolated processing environments per customer
    (ii) Data segregation and tenant isolation
    (iii) Automated PII detection and protection
    (iv) Secure data pipeline architecture
    (v) Real-time data quality and security monitoring

(b) Document Processing:
    (i) Malware scanning for all uploaded documents
    (ii) File type validation and sandboxing
    (iii) Optical Character Recognition (OCR) security
    (iv) Secure temporary storage with automatic cleanup
    (v) Document classification and sensitivity labeling

(c) Analytics and Reporting:
    (i) Aggregation and anonymization of sensitive data
    (ii) Access controls for analytical outputs
    (iii) Query logging and monitoring
    (iv) Data export controls and watermarking
    (v) Secure data visualization dashboards

5.3 Machine Learning Operations (MLOps) Security

(a) Model Lifecycle Security:
    (i) Secure model training environments
    (ii) Automated security testing in CI/CD pipelines
    (iii) Model approval workflows with security gates
    (iv) Secure model registry with versioning
    (v) Production model monitoring and alerting

(b) Data Pipeline Security:
    (i) Encrypted data transformations
    (ii) Secure feature stores
    (iii) Data validation at each pipeline stage
    (iv) Pipeline execution audit trails
    (v) Automated pipeline security scanning`,
    },
    {
      title: "6. MONITORING AND INCIDENT RESPONSE",
      content: `6.1 Security Monitoring

(a) Continuous Monitoring:
    (i) Real-time security event collection and analysis
    (ii) User activity monitoring and behavioral analytics
    (iii) Network traffic analysis and anomaly detection
    (iv) Database activity monitoring
    (v) Application performance and security monitoring (APM)

(b) Log Management:
    (i) Centralized log aggregation and storage
    (ii) Tamper-proof log storage with integrity verification
    (iii) Log retention for minimum 1 year (7 years for audit logs)
    (iv) Automated log analysis and correlation
    (v) Real-time alerting for security events

(c) Threat Detection:
    (i) Signature-based threat detection
    (ii) Behavioral anomaly detection using machine learning
    (iii) Threat intelligence feed integration
    (iv) Indicators of Compromise (IoC) monitoring
    (v) Advanced Persistent Threat (APT) detection

6.2 Incident Response

(a) Incident Response Plan:
    (i) Documented incident response procedures
    (ii) Defined roles and responsibilities (RACI matrix)
    (iii) Escalation paths and communication protocols
    (iv) Regular incident response drills and tabletop exercises
    (v) Post-incident review and lessons learned process

(b) Incident Classification:
    (i) Critical: Data breach, system compromise (response within 15 minutes)
    (ii) High: Unauthorized access attempt, service disruption (response within 1 hour)
    (iii) Medium: Policy violations, suspicious activities (response within 4 hours)
    (iv) Low: Minor security events (response within 24 hours)

(c) Breach Response Procedures:
    (i) Immediate containment and isolation
    (ii) Forensic investigation and evidence preservation
    (iii) Impact assessment and affected party identification
    (iv) Notification to affected parties within 72 hours (GDPR compliance)
    (v) Regulatory reporting as required
    (vi) Remediation and security improvements

6.3 Business Continuity and Disaster Recovery

(a) Business Continuity Planning:
    (i) Business impact analysis (BIA)
    (ii) Recovery Time Objective (RTO): 4 hours for critical systems
    (iii) Recovery Point Objective (RPO): 1 hour for transaction data
    (iv) Redundant systems and failover mechanisms
    (v) Regular business continuity testing (quarterly)

(b) Disaster Recovery:
    (i) Automated backup systems (continuous + daily snapshots)
    (ii) Geographically distributed backup locations
    (iii) Immutable backups to prevent ransomware attacks
    (iv) Regular restore testing (monthly)
    (v) Documented disaster recovery procedures

(c) Incident Communication:
    (i) Security incident notification via email and dashboard alerts
    (ii) Status page for service availability
    (iii) Customer communication protocols
    (iv) Media relations procedures
    (v) Regulatory notification procedures`,
    },
    {
      title: "7. COMPLIANCE AND GOVERNANCE",
      content: `7.1 Regulatory Compliance

(a) Data Protection Regulations:
    (i) General Data Protection Regulation (GDPR) compliance
    (ii) California Consumer Privacy Act (CCPA) compliance
    (iii) Health Insurance Portability and Accountability Act (HIPAA) compliance
    (iv) Payment Card Industry Data Security Standard (PCI DSS) Level 1
    (v) State-specific privacy law compliance (VCDPA, CPA, CTDPA)

(b) Industry Standards:
    (i) ISO 27001 Information Security Management
    (ii) ISO 27017 Cloud Security
    (iii) ISO 27018 Cloud Privacy
    (iv) SOC 2 Type II (Security, Availability, Confidentiality)
    (v) NIST Cybersecurity Framework alignment

(c) Insurance Industry Compliance:
    (i) State insurance department regulations
    (ii) NAIC Model Laws compliance
    (iii) Insurance data security laws (e.g., New York DFS Part 500)
    (iv) Gramm-Leach-Bliley Act (GLBA) compliance
    (v) Fair Credit Reporting Act (FCRA) compliance

7.2 Security Governance

(a) Governance Structure:
    (i) Chief Information Security Officer (CISO) oversight
    (ii) Security steering committee
    (iii) Data Protection Officer (DPO) for privacy matters
    (iv) Compliance team for regulatory adherence
    (v) Regular board-level security reporting

(b) Policy Management:
    (i) Comprehensive information security policy framework
    (ii) Annual policy review and updates
    (iii) Employee acknowledgment of security policies
    (iv) Policy exception process with risk assessment
    (v) Policy communication and training

(c) Risk Management:
    (i) Annual risk assessment and treatment planning
    (ii) Continuous risk monitoring and reporting
    (iii) Third-party risk assessment program
    (iv) Business impact analysis for critical processes
    (v) Risk register maintenance and review

7.3 Audit and Certification

(a) External Audits:
    (i) Annual SOC 2 Type II audits
    (ii) ISO 27001 certification audits
    (iii) PCI DSS assessments (if applicable)
    (iv) HIPAA compliance audits
    (v) Penetration testing by independent firms

(b) Internal Audits:
    (i) Quarterly internal security audits
    (ii) Access review certifications
    (iii) Compliance monitoring and testing
    (iv) Control effectiveness assessments
    (v) Corrective action tracking

(c) Vendor Audits:
    (i) Annual vendor security assessments
    (ii) Right-to-audit clauses in vendor contracts
    (iii) Continuous vendor risk monitoring
    (iv) Vendor incident notification requirements
    (v) Vendor security certification verification`,
    },
    {
      title: "8. EMPLOYEE SECURITY AND TRAINING",
      content: `8.1 Personnel Security

(a) Hiring Practices:
    (i) Background checks for all employees
    (ii) Reference verification
    (iii) Identity verification
    (iv) Education and credential verification
    (v) Security clearance for privileged roles

(b) Onboarding Security:
    (i) Mandatory security awareness training
    (ii) Acceptable use policy acknowledgment
    (iii) Confidentiality and non-disclosure agreements
    (iv) Role-specific security training
    (v) Equipment security briefing

(c) Offboarding Procedures:
    (i) Immediate access revocation upon termination
    (ii) Return of all company property and devices
    (iii) Exit interview with security briefing
    (iv) Knowledge transfer procedures
    (v) Post-employment obligations reminder

8.2 Security Awareness Training

(a) Training Program:
    (i) Annual security awareness training (mandatory)
    (ii) Quarterly phishing simulation exercises
    (iii) Role-based specialized training
    (iv) Incident response training for relevant personnel
    (v) Secure development training for engineers

(b) Training Topics:
    (i) Phishing and social engineering awareness
    (ii) Password security and authentication best practices
    (iii) Data classification and handling
    (iv) Physical security awareness
    (v) Incident reporting procedures
    (vi) Privacy and compliance requirements

(c) Training Effectiveness:
    (i) Training completion tracking and reporting
    (ii) Knowledge assessments and certifications
    (iii) Phishing simulation success rates
    (iv) Training feedback and continuous improvement
    (v) Security culture surveys

8.3 Insider Threat Prevention

(a) Detection and Prevention:
    (i) User behavior analytics (UBA)
    (ii) Data access monitoring and anomaly detection
    (iii) Privileged access monitoring
    (iv) Data exfiltration prevention
    (v) Regular access reviews and recertification

(b) Investigation and Response:
    (i) Insider threat investigation procedures
    (ii) Forensic capabilities for insider incidents
    (iii) Coordination with HR and legal teams
    (iv) Evidence preservation and chain of custody
    (v) Post-incident analysis and improvements`,
    },
    {
      title: "9. PHYSICAL AND ENVIRONMENTAL SECURITY",
      content: `9.1 Data Center Security

(a) Physical Access Controls:
    (i) 24/7 security personnel
    (ii) Biometric access control systems
    (iii) Mantrap entry systems
    (iv) Video surveillance with 90-day retention
    (v) Visitor management and escort requirements

(b) Environmental Controls:
    (i) Redundant power systems with UPS and generators
    (ii) N+1 redundant cooling systems
    (iii) Fire detection and suppression systems
    (iv) Environmental monitoring (temperature, humidity, water)
    (v) Seismic protection measures

(c) Data Center Certifications:
    (i) Tier III or higher data centers
    (ii) ISO 27001 certified facilities
    (iii) SOC 2 compliant operations
    (iv) Local regulatory compliance
    (v) Regular facility audits

9.2 Office Security

(a) Access Controls:
    (i) Badge-based access control systems
    (ii) Visitor management procedures
    (iii) Secure areas for sensitive operations
    (iv) Access logs and monitoring
    (v) After-hours access restrictions

(b) Physical Security Measures:
    (i) Clean desk policy enforcement
    (ii) Secure document disposal (cross-cut shredders)
    (iii) Locked storage for sensitive materials
    (iv) Security cameras in common areas
    (v) Alarm systems for intrusion detection

(c) Equipment Security:
    (i) Asset inventory and tracking
    (ii) Device encryption requirements
    (iii) Mobile device management (MDM)
    (iv) Secure disposal of electronic equipment
    (v) Equipment loan and return procedures`,
    },
    {
      title: "10. CONTACT AND REPORTING",
      content: `10.1 Security Contact Information

For security-related inquiries and incident reporting:

Primary Security Contact:
    Email: security@clerktree.com
    Phone: +1-XXX-XXX-XXXX (24/7 security hotline)
    PGP Key: Available on our security page

Chief Information Security Officer (CISO):
    Email: ciso@clerktree.com

Data Protection Officer (DPO):
    Email: dpo@clerktree.com
    For privacy-related inquiries and data subject requests

10.2 Responsible Disclosure

(a) Bug Bounty Program:
    (i) Coordinated vulnerability disclosure program
    (ii) Responsible disclosure guidelines
    (iii) Security researcher acknowledgment
    (iv) Reward structure for valid findings
    (v) Safe harbor provisions

(b) Reporting Process:
    (i) Email detailed findings to security@clerktree.com
    (ii) Use encrypted communication for sensitive details
    (iii) Allow 90 days for remediation before public disclosure
    (iv) Do not access or modify customer data
    (v) Do not perform testing that could impact service availability

10.3 Security Updates and Transparency

(a) Security Advisories:
    (i) Public disclosure of security vulnerabilities after remediation
    (ii) Security bulletin notifications for affected customers
    (iii) CVE assignments for significant vulnerabilities
    (iv) Timeline and impact assessment in advisories

(b) Security Posture Reporting:
    (i) Annual security report publication
    (ii) SOC 2 reports available to enterprise customers
    (iii) Compliance certificate sharing
    (iv) Security questionnaire responses
    (v) Regular security updates via our security blog

(c) Customer Security Resources:
    (i) Security best practices documentation
    (ii) Integration security guidelines
    (iii) Data handling recommendations
    (iv) Incident response coordination procedures
    (v) Security training materials for customers

10.4 Continuous Improvement

We are committed to continuously improving our security posture:
    (i) Regular security assessments and audits
    (ii) Industry best practices adoption
    (iii) Emerging threat monitoring and response
    (iv) Security technology evaluation and implementation
    (v) Customer feedback integration into security programs

Last Updated: November 14, 2025
Next Review Date: May 14, 2026

This Security and Data Handling document is reviewed and updated regularly to reflect our current security practices and emerging threats.`,
    },
  ];

  const GlassContainer = ({ children, className }) => (
    <div
      className={cn(
        "relative overflow-hidden",
        "rounded-xl p-6",
        isDark
          ? "bg-black/20 border border-white/10"
          : "bg-white/60 border border-black/5",
        "transition-all duration-200",
        className,
      )}
    >
      {children}
    </div>
  );

  const IconContainer = ({ children }) => (
    <div
      className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center",
        isDark
          ? "bg-black/20 border border-white/10"
          : "bg-white/60 border border-black/5",
      )}
    >
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
      <div
        className={cn(
          "relative min-h-screen p-4 md:p-6 backdrop-blur-sm transition-colors duration-300",
          isDark ? "bg-black/50" : "bg-white/50",
        )}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200",
                isDark
                  ? "bg-black/20 hover:bg-black/30 text-white border border-white/10"
                  : "bg-white/60 hover:bg-white/70 text-black border border-black/5",
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
                  : "bg-white/60 hover:bg-white/70 text-black border border-black/5",
              )}
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Main Card */}
          <GlassContainer>
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
              <IconContainer>
                <ShieldCheck
                  className={cn(
                    "w-6 h-6",
                    isDark ? "text-purple-400" : "text-purple-600",
                  )}
                />
              </IconContainer>
              <div>
                <h1
                  className={cn(
                    "text-2xl font-semibold",
                    isDark ? "text-white" : "text-black",
                  )}
                >
                  Security & Data Handling
                </h1>
                <p className={isDark ? "text-white/60" : "text-black/60"}>
                  Last Updated: November 14, 2025
                </p>
              </div>
            </div>

            {/* Legal Notice */}
            <div
              className={cn(
                "p-4 rounded-xl mb-6",
                isDark
                  ? "bg-green-500/20 border border-green-500/20"
                  : "bg-green-500/10 border border-green-500/10",
              )}
            >
              <p
                className={cn(
                  "text-sm",
                  isDark ? "text-green-200" : "text-green-700",
                )}
              >
                This document describes our comprehensive security measures and
                data handling practices to protect your information and ensure
                compliance with industry standards and regulations.
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
                      : "bg-white/60 hover:bg-white/70 border border-black/5",
                  )}
                >
                  <button
                    onClick={() =>
                      setExpandedSection(
                        expandedSection === index ? null : index,
                      )
                    }
                    className="w-full px-4 py-4 flex items-center justify-between"
                  >
                    <h2
                      className={cn(
                        "text-lg font-semibold text-left",
                        isDark ? "text-white" : "text-black",
                      )}
                    >
                      {section.title}
                    </h2>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 transition-transform",
                        isDark ? "text-white/60" : "text-black/60",
                        expandedSection === index ? "transform rotate-180" : "",
                      )}
                    />
                  </button>
                  {expandedSection === index && (
                    <div
                      className={cn(
                        "px-4 pb-4",
                        "font-mono text-sm whitespace-pre-wrap",
                        isDark ? "text-white/60" : "text-black/60",
                      )}
                    >
                      {section.content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              className={cn(
                "mt-8 pt-6 border-t",
                isDark ? "border-white/10" : "border-black/5",
              )}
            >
              <p
                className={cn(
                  "text-center text-sm",
                  isDark ? "text-white/40" : "text-black/40",
                )}
              >
                WE ARE COMMITTED TO MAINTAINING THE HIGHEST STANDARDS OF
                SECURITY AND DATA PROTECTION TO SAFEGUARD YOUR INFORMATION.
              </p>
              <p
                className={cn(
                  "text-center mt-4",
                  isDark ? "text-white/60" : "text-black/60",
                )}
              >
                For security inquiries, please contact us:{" "}
                <a
                  href="mailto:security@clerktree.com"
                  className={cn(
                    "underline hover:no-underline transition-all duration-200",
                    isDark
                      ? "text-purple-400 hover:text-purple-300"
                      : "text-purple-600 hover:text-purple-700",
                  )}
                >
                  security@clerktree.com
                </a>
              </p>
            </div>
          </GlassContainer>
        </div>
      </div>
    </div>
  );
};

export default Security;
