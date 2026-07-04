import termsUrl from '../../terms&conditions/t&c.html?url';
import LegalHtmlPage from './LegalHtmlPage';

const TermsOfService = () => (
  <LegalHtmlPage
    description="Review the terms that govern access to ClerkTree products, services, and platform usage."
    htmlUrl={termsUrl}
    title="Terms of Service"
  />
);

export default TermsOfService;
