import cookiePolicyUrl from '../../terms&conditions/cookiepolicy.html?url';
import LegalHtmlPage from './LegalHtmlPage';

const CookiePolicy = () => (
  <LegalHtmlPage
    description="Understand how cookies and similar technologies are used to power, improve, and secure ClerkTree."
    htmlUrl={cookiePolicyUrl}
    title="Cookie Policy"
  />
);

export default CookiePolicy;
