import { COMPANY } from '../../config/company';
import { useLanguage } from '../../contexts/LanguageContext';
import LegalLayout from './LegalLayout';

export default function Imprint() {
  const { language } = useLanguage();
  const de = language === 'de';
  const editorial = COMPANY.editorialResponsible ?? COMPANY.representatives?.[0];

  return (
    <LegalLayout
      title={de ? 'Impressum' : 'Imprint'}
      description={de ? 'Anbieterkennzeichnung nach § 5 DDG.' : 'Provider identification under § 5 DDG (German Digital Services Act).'}
      dated={false}
    >
      <h2>{de ? 'Anbieter' : 'Provider'}</h2>
      <address>
        <strong>{COMPANY.legalName}</strong><br />
        {COMPANY.street}<br />
        {COMPANY.postalCode} {COMPANY.city}<br />
        {COMPANY.country[language]}
      </address>

      {COMPANY.representatives?.length ? (
        <>
          <h2>{de ? 'Vertreten durch' : 'Represented by'}</h2>
          <p>{COMPANY.representatives.join(', ')}</p>
        </>
      ) : null}

      <h2>{de ? 'Kontakt' : 'Contact'}</h2>
      <p>
        {de ? 'Telefon' : 'Phone'}: <a href={COMPANY.phoneHref}>{COMPANY.phone}</a><br />
        E-Mail: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </p>

      {COMPANY.register && (
        <>
          <h2>{de ? 'Registereintrag' : 'Commercial register'}</h2>
          <p>
            {de ? 'Registergericht' : 'Register court'}: {COMPANY.register.court}<br />
            {de ? 'Registernummer' : 'Registration number'}: {COMPANY.register.number}
          </p>
        </>
      )}

      {COMPANY.vatId && (
        <>
          <h2>{de ? 'Umsatzsteuer-ID' : 'VAT ID'}</h2>
          <p>
            {de
              ? 'Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: '
              : 'VAT identification number under § 27a of the German VAT Act: '}
            {COMPANY.vatId}
          </p>
        </>
      )}

      {editorial && (
        <>
          <h2>{de ? 'Redaktionell verantwortlich' : 'Responsible for content'}</h2>
          <p>
            {editorial} ({de ? 'gemäß § 18 Abs. 2 MStV' : 'under § 18 (2) MStV'}), {de ? 'Anschrift wie oben' : 'address as above'}.
          </p>
        </>
      )}

      <h2>{de ? 'Verbraucherstreitbeilegung' : 'Consumer dispute resolution'}</h2>
      <p>
        {de
          ? 'Unser Angebot richtet sich an Unternehmen. Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'
          : 'Our services are aimed at businesses. We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.'}
      </p>

      <h2>{de ? 'Haftung für Inhalte und Links' : 'Liability for content and links'}</h2>
      <p>
        {de
          ? 'Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen. Unsere Seiten enthalten Links zu externen Websites, auf deren Inhalte wir keinen Einfluss haben; für diese ist stets der jeweilige Anbieter verantwortlich. Bei Bekanntwerden von Rechtsverletzungen entfernen wir entsprechende Inhalte und Links umgehend.'
          : 'As a service provider we are responsible for our own content on these pages under general law. We are not obliged to monitor third-party information that is transmitted or stored. Our pages contain links to external websites whose content we do not control; the respective provider is always responsible for it. If we become aware of an infringement, we remove the content or link without delay.'}
      </p>

      <h2>{de ? 'Urheberrecht' : 'Copyright'}</h2>
      <p>
        {de ? (
          <>Die Inhalte dieser Website unterliegen dem deutschen Urheberrecht. Für die Verwendung unserer Marke und Logos gelten die Hinweise auf der Seite <a href="/brand">Brand</a>.</>
        ) : (
          <>The content of this website is protected by German copyright law. Use of our name and logos is governed by the guidance on the <a href="/brand">Brand</a> page.</>
        )}
      </p>
    </LegalLayout>
  );
}
