import privacyPolicyUrl from '../../terms&conditions/privacypolicy.html?url';
import LegalHtmlPage from './LegalHtmlPage';

const PrivacyPolicy = () => (
  <LegalHtmlPage
    description="Learn how ClerkTree collects, uses, and protects your information, and the rights available to you."
    htmlUrl={privacyPolicyUrl}
    title="Privacy Policy"
  />
);

export default PrivacyPolicy;
