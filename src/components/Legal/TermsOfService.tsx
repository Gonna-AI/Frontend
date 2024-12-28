import React from 'react';
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
      content: `1.1 In these Terms of Service and all documents incorporated herein by reference, the following words and expressions have the following meanings unless the context otherwise requires: "Agreement" means collectively these Terms of Service, Privacy Policy, and any other documents incorporated by reference herein; "Service" means any and all services, features, content, applications, software, and websites provided by Us; "User", "You", or "Your" refers to the individual, entity, or organization that accepts this Agreement by using the Service; "We", "Us", "Our", or "Company" refers to [Company Name], a corporation duly organized and existing under the laws of [Jurisdiction], with its principal place of business at [Address].

1.2 The headings in this Agreement are inserted for convenience only and shall not affect the interpretation of these Terms of Service. Words importing the singular shall include the plural and vice versa. A reference to a statute or statutory provision is a reference to it as amended, extended, or re-enacted from time to time. References to Clauses and Schedules are to the clauses and schedules of this Agreement.

1.3 In the event of any conflict between these Terms of Service and any other document incorporated herein by reference, these Terms of Service shall prevail to the extent of the inconsistency.`
    },
    {
      title: "2. ACCEPTANCE OF TERMS",
      content: `2.1 PLEASE READ THESE TERMS OF SERVICE CAREFULLY. BY ACCESSING, DOWNLOADING, INSTALLING, REGISTERING TO USE, OR USING THE SERVICE, YOU AGREE TO BE BOUND BY THESE TERMS OF SERVICE AND ALL TERMS INCORPORATED BY REFERENCE. IF YOU DO NOT AGREE TO ALL OF THESE TERMS, DO NOT ACCESS OR USE THE SERVICE.

2.2 You represent and warrant that: (i) You have full legal capacity and authority to agree and bind yourself to these Terms of Service; (ii) You are eighteen (18) years of age or older or have otherwise reached the age of majority in your jurisdiction; (iii) Your use of the Service will be solely for purposes that are permitted by this Agreement; (iv) Your use of the Service will not infringe or misappropriate any third party's rights; and (v) Your use of the Service will comply with all applicable laws and regulations.

2.3 The Service is not available to any Users previously suspended or removed from the Service by Us.`
    },
    {
      title: "3. MODIFICATIONS TO TERMS OR SERVICES",
      content: `3.1 We reserve the right, at Our sole discretion, to modify, discontinue, or terminate the Service or to modify these Terms of Service at any time and without prior notice. If We modify these Terms of Service, We will post the modification on the Service or provide You with notice of the modification. By continuing to access or use the Service after We have posted a modification or have provided You with notice of a modification, You are indicating that You agree to be bound by the modified Terms of Service. If the modified Terms of Service are not acceptable to You, Your only recourse is to cease using the Service.

3.2 Notwithstanding Section 3.1, no modification to these Terms of Service will apply to any dispute between You and Us that arose prior to the effective date of such modification.

3.3 We may, without prior notice, change the Service; add or remove functionalities or features; stop providing the Service or features of the Service, to You or to Users generally; or create usage limits for the Service.`
    },
    {
      title: "4. INTELLECTUAL PROPERTY RIGHTS",
      content: `4.1 The Service and its original content, features, and functionality are and will remain the exclusive property of the Company and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of the Company.

4.2 Subject to Your compliance with these Terms of Service, We grant You a limited, non-exclusive, non-transferable, non-sublicensable license to access and use the Service solely for Your personal or internal business purposes.

4.3 You acknowledge and agree that any feedback, comments, or suggestions You may provide regarding the Service ("Feedback") will be the sole and exclusive property of the Company and You hereby irrevocably assign to Us all of Your right, title, and interest in and to all Feedback.

4.4 The Company name, the Company logo, and all related names, logos, product and service names, designs, and slogans are trademarks of the Company or its affiliates or licensors. You must not use such marks without the prior written permission of the Company. All other names, logos, product and service names, designs, and slogans on the Service are the trademarks of their respective owners.`
    },
    {
      title: "5. USER REPRESENTATIONS AND WARRANTIES",
      content: `5.1 By using the Service, You represent and warrant that: (a) all registration information You submit is truthful and accurate; (b) You will maintain the accuracy of such information; (c) You are 18 years of age or older; and (d) Your use of the Service does not violate any applicable law or regulation.

5.2 Your use of the Service is subject to all applicable local, state, national and international laws and regulations. You agree not to: (i) upload, post, email, transmit or otherwise make available any User Content that is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically or otherwise objectionable; (ii) impersonate any person or entity, including, but not limited to, a Company official, forum leader, guide or host, or falsely state or otherwise misrepresent Your affiliation with a person or entity; (iii) forge headers or otherwise manipulate identifiers in order to disguise the origin of any User Content transmitted through the Service.`
    },
    {
      title: "6. LIMITATION OF LIABILITY",
      content: `6.1 TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE COMPANY, ITS AFFILIATES, AGENTS, DIRECTORS, EMPLOYEES, SUPPLIERS OR LICENSORS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO THE USE OF, OR INABILITY TO USE, THE SERVICE.

6.2 WITHOUT LIMITING THE GENERALITY OF THE FOREGOING, THE COMPANY'S AGGREGATE LIABILITY TO YOU (WHETHER UNDER CONTRACT, TORT, STATUTE OR OTHERWISE) SHALL NOT EXCEED THE AMOUNT OF FIFTY UNITED STATES DOLLARS ($50.00).

6.3 THE FOREGOING LIMITATIONS SHALL APPLY EVEN IF THE COMPANY HAS BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGES. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES. ACCORDINGLY, SOME OF THE LIMITATIONS SET FORTH ABOVE MAY NOT APPLY TO YOU.`
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
                For legal inquiries, please contact{' '}
                <a 
                  href="mailto:legal@example.com"
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

export default TermsOfService;