import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { PageHero, Footer } from '../../components/Landing/SiteChrome';
import SEO from '../../components/SEO';
import '../LandingFramer.css';
import './Legal.css';

type RequestType = 'access' | 'deletion' | 'rectification' | 'portability' | 'objection' | 'restrict';
type RelationshipType = 'customer' | 'applicant' | 'employee' | 'other';

type DSARFormData = {
  fullName: string;
  email: string;
  phone: string;
  relationship: RelationshipType;
  requestType: RequestType;
  details: string;
  identityConfirmed: boolean;
};

const initialFormData: DSARFormData = {
  fullName: '',
  email: '',
  phone: '',
  relationship: 'customer',
  requestType: 'access',
  details: '',
  identityConfirmed: false,
};

export default function DataAccess() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<DSARFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Construct request payload matching api-contacts schema
    const relationshipLabel = {
      customer: 'Customer / User',
      applicant: 'Job Applicant',
      employee: 'Former/Current Employee',
      other: 'Other Relationship',
    }[formData.relationship];

    const requestTypeLabel = {
      access: 'Request Access to My Personal Data (DSAR)',
      deletion: 'Request Deletion / Erasure of My Data (Right to be Forgotten)',
      rectification: 'Request Correction / Rectification of My Data',
      portability: 'Request Data Portability (Export)',
      objection: 'Object to Processing of My Data',
      restrict: 'Request Restriction of Data Processing',
    }[formData.requestType];

    const combinedMessage = `--- DATA SUBJECT ACCESS REQUEST (DSAR) ---
Relationship: ${relationshipLabel}
Request Type: ${requestTypeLabel}
Details / Scope of Request:
${formData.details || 'No additional details provided.'}

[User Declaration: I confirm that I am the data subject or authorised representative, and that the information supplied is accurate.]`;

    const contactPayload = {
      fullName: formData.fullName,
      companyName: `N/A (DSAR Request)`,
      email: formData.email,
      phone: formData.phone || 'N/A',
      interest: 'Data Subject Access Request',
      employeeCount: '1',
      message: combinedMessage,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-contacts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactPayload),
        }
      );

      if (!response.ok) throw new Error(`Request rejected: ${response.status}`);

      setSubmitStatus('success');
      setFormData(initialFormData);
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ct-works" id="ct-works">
      <SEO
        title="Data Subject Access Request (DSAR)"
        description="Submit a request to access, correct, delete, or restrict your personal data under the GDPR."
        noindex
      />

      <PageHero
        eyebrow="Privacy rights"
        title="Data Access Request"
        description="Submit a request to access, restrict, correct, or delete your personal data. We verify and answer your request within one month."
        titleId="dsar-page-title"
      />

      <div className="ct-legal-page-container">

        {/* ── Content Card with Form ── */}
        <main className="ct-legal-content-wrap" id="main-content">
          <div className="ct-legal-card">
            {submitStatus === 'success' ? (
              <div className="flex flex-col items-center text-center py-12 px-4 max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-[#FF4D00]/10 flex items-center justify-center text-[#FF4D00] mb-6">
                  <CheckCircle2 size={36} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-[rgb(19,19,19)] mb-3">
                  Request Submitted Successfully
                </h2>
                <p className="text-[rgba(19,19,19,0.7)] leading-relaxed mb-6">
                  We have received your request and will answer within one month. We may contact you first to verify your identity.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-3 rounded-full bg-[rgb(19,19,19)] text-white font-semibold transition-colors hover:bg-black"
                >
                  Return to Home
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl mx-auto">
                <div className="border-l-2 border-[#FF4D00] pl-4 mb-4">
                  <p className="text-sm text-[rgba(19,19,19,0.72)] leading-relaxed">
                    Use this form to exercise your rights under the GDPR. You can also email us at team@clerktree.com.
                  </p>
                </div>

                {submitStatus === 'error' && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                    Failed to submit request. Please verify your connection or try again later.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="fullName" className="text-sm font-semibold text-[rgb(19,19,19)]">
                      Full Name *
                    </label>
                    <input
                      id="fullName"
                      maxLength={120}
                      name="fullName"
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-[rgba(19,19,19,0.03)] border border-[rgba(19,19,19,0.1)] text-[rgb(19,19,19)] placeholder-[rgba(19,19,19,0.35)] focus:outline-none focus:border-[#FF4D00]/50 focus:ring-2 focus:ring-[#FF4D00]/15 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm font-semibold text-[rgb(19,19,19)]">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      maxLength={254}
                      name="email"
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-[rgba(19,19,19,0.03)] border border-[rgba(19,19,19,0.1)] text-[rgb(19,19,19)] placeholder-[rgba(19,19,19,0.35)] focus:outline-none focus:border-[#FF4D00]/50 focus:ring-2 focus:ring-[#FF4D00]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="text-sm font-semibold text-[rgb(19,19,19)]">
                      Phone Number (Optional)
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-[rgba(19,19,19,0.03)] border border-[rgba(19,19,19,0.1)] text-[rgb(19,19,19)] placeholder-[rgba(19,19,19,0.35)] focus:outline-none focus:border-[#FF4D00]/50 focus:ring-2 focus:ring-[#FF4D00]/15 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="relationship" className="text-sm font-semibold text-[rgb(19,19,19)]">
                      Relationship to ClerkTree *
                    </label>
                    <select
                      id="relationship"
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-[rgba(19,19,19,0.03)] border border-[rgba(19,19,19,0.1)] text-[rgb(19,19,19)] focus:outline-none focus:border-[#FF4D00]/50 focus:ring-2 focus:ring-[#FF4D00]/15 transition-all"
                    >
                      <option value="customer">Customer / User</option>
                      <option value="applicant">Job Applicant</option>
                      <option value="employee">Former or Current Employee</option>
                      <option value="other">Other / No Relationship</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="requestType" className="text-sm font-semibold text-[rgb(19,19,19)]">
                    Type of Request *
                  </label>
                  <select
                    id="requestType"
                    name="requestType"
                    value={formData.requestType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-[rgba(19,19,19,0.03)] border border-[rgba(19,19,19,0.1)] text-[rgb(19,19,19)] focus:outline-none focus:border-[#FF4D00]/50 focus:ring-2 focus:ring-[#FF4D00]/15 transition-all"
                  >
                    <option value="access">Access / Export Personal Data</option>
                    <option value="deletion">Delete / Erase Personal Data</option>
                    <option value="rectification">Correct / Rectify Personal Data</option>
                    <option value="restrict">Restrict Processing of Data</option>
                    <option value="objection">Object to Processing of Data</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="details" className="text-sm font-semibold text-[rgb(19,19,19)]">
                    Details of Request (Optional)
                    <span className="block text-xs font-normal text-[rgba(19,19,19,0.5)] mt-0.5">
                      Please specify any details that will help us locate your records.
                    </span>
                  </label>
                  <textarea
                    id="details"
                    maxLength={3000}
                    name="details"
                    rows={4}
                    placeholder="Provide details about the data you are referencing..."
                    value={formData.details}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-[rgba(19,19,19,0.03)] border border-[rgba(19,19,19,0.1)] text-[rgb(19,19,19)] placeholder-[rgba(19,19,19,0.35)] focus:outline-none focus:border-[#FF4D00]/50 focus:ring-2 focus:ring-[#FF4D00]/15 transition-all resize-none"
                  />
                </div>

                <div className="flex items-start gap-3 mt-2">
                  <input
                    id="identityConfirmed"
                    name="identityConfirmed"
                    type="checkbox"
                    checked={formData.identityConfirmed}
                    onChange={handleChange}
                    required
                    className="mt-1 accent-[#FF4D00]"
                  />
                  <label htmlFor="identityConfirmed" className="text-xs text-[rgba(19,19,19,0.65)] leading-normal select-none cursor-pointer">
                    I confirm that I am the data subject whose name appears on this form, or that I am legally authorized to submit this request on their behalf.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 px-8 py-4 rounded-full bg-[#FF4D00] text-white font-semibold hover:bg-[#E64500] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00]/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-[0_12px_30px_rgba(255,77,0,0.22)]"
                >
                  {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
