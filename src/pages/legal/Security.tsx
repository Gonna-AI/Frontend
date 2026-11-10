import { COMPANY } from '../../config/company';
import { useLanguage } from '../../contexts/LanguageContext';
import LegalLayout from './LegalLayout';

type Section = { title: string; items: string[] };

// Every statement here describes how this product is actually built and run.
// Add a control only once it is in place and can be evidenced to a customer.
const SECTIONS: Record<'en' | 'de', Section[]> = {
  en: [
    {
      title: 'Infrastructure',
      items: [
        "The website and web application are delivered through Netlify's content delivery network. Application data, authentication and server-side functions run on Supabase (managed PostgreSQL). Media files are stored with Cloudflare.",
        'These providers are independently audited (SOC 2 Type II). Their reports are available from the providers under NDA.',
        'For customers who cannot send plant data to a shared cloud, ClerkTree can be deployed in a virtual private cloud, on premises or air-gapped. The deployment model is agreed per project.',
      ],
    },
    {
      title: 'Encryption',
      items: [
        'All connections to clerktree.com use TLS. HTTP Strict Transport Security is enforced with a two-year lifetime, including subdomains.',
        'Data stored in our managed database and its backups is encrypted at rest by the infrastructure provider (AES-256).',
      ],
    },
    {
      title: 'Access control',
      items: [
        'Passwords are never stored in plain text, only as salted hashes. Sign-in with Google uses OAuth 2.0 with PKCE.',
        'Sessions use short-lived, signed tokens that are refreshed automatically; refresh tokens are revoked on sign-out.',
        "Row-level security in the database separates each organisation's data: a query can only return rows the signed-in user is entitled to.",
        'Credentials for third-party services are held on the server only and are never shipped to the browser.',
      ],
    },
    {
      title: 'Application security',
      items: [
        'A Content Security Policy limits which scripts and connections the application may use, and the site cannot be embedded in other sites (clickjacking protection).',
        'Every change is type-checked, linted and built automatically before it can be deployed.',
        'Dependencies are checked for known vulnerabilities automatically every week.',
        'Server functions restrict cross-origin access to our own origins and require a valid session wherever account data is involved.',
      ],
    },
    {
      title: 'AI and your data',
      items: [
        'AI requests from the application are routed through our servers, so provider credentials and routing stay under our control.',
        'Which model providers are used for a deployment, and where they process data, is set out in the data processing agreement. In on-premises and air-gapped deployments, data and inference stay inside your network.',
        'Answers cite the signals and documents they are based on, so your team can verify them before acting.',
      ],
    },
    {
      title: 'Privacy',
      items: [
        'We act as a processor for customer data under a data processing agreement in line with Art. 28 GDPR.',
        'This website uses analytics only after you opt in, stores that data in the EU, and sets no advertising cookies. Details are in our Privacy Policy.',
      ],
    },
    {
      title: 'Incidents',
      items: [
        'If a security incident affects customer data, we inform the affected customers without undue delay and meet the notification duties of Art. 33 and 34 GDPR.',
      ],
    },
  ],
  de: [
    {
      title: 'Infrastruktur',
      items: [
        'Website und Webanwendung werden über das Content Delivery Network von Netlify ausgeliefert. Anwendungsdaten, Authentifizierung und serverseitige Funktionen laufen auf Supabase (verwaltetes PostgreSQL). Mediendateien liegen bei Cloudflare.',
        'Diese Anbieter werden unabhängig geprüft (SOC 2 Typ II). Die Berichte sind unter NDA bei den Anbietern erhältlich.',
        'Für Kunden, die Werksdaten nicht in eine gemeinsam genutzte Cloud geben können, lässt sich ClerkTree in einer Virtual Private Cloud, on-premises oder vollständig abgeschottet (air-gapped) betreiben. Das Betriebsmodell wird je Projekt vereinbart.',
      ],
    },
    {
      title: 'Verschlüsselung',
      items: [
        'Alle Verbindungen zu clerktree.com nutzen TLS. HTTP Strict Transport Security ist mit einer Laufzeit von zwei Jahren einschließlich Subdomains aktiviert.',
        'In unserer verwalteten Datenbank gespeicherte Daten und deren Backups werden vom Infrastruktur-Anbieter im Ruhezustand verschlüsselt (AES-256).',
      ],
    },
    {
      title: 'Zugriffskontrolle',
      items: [
        'Passwörter werden nie im Klartext gespeichert, sondern ausschließlich als gesalzene Hashes. Die Anmeldung mit Google nutzt OAuth 2.0 mit PKCE.',
        'Sitzungen verwenden kurzlebige, signierte Tokens, die automatisch erneuert werden; Refresh-Tokens werden bei der Abmeldung widerrufen.',
        'Row-Level Security in der Datenbank trennt die Daten jeder Organisation: Eine Abfrage liefert nur Zeilen, für die der angemeldete Nutzer berechtigt ist.',
        'Zugangsdaten für Drittdienste liegen ausschließlich auf dem Server und werden nie an den Browser ausgeliefert.',
      ],
    },
    {
      title: 'Anwendungssicherheit',
      items: [
        'Eine Content Security Policy begrenzt, welche Skripte und Verbindungen die Anwendung nutzen darf; die Website lässt sich nicht in fremde Seiten einbetten (Schutz vor Clickjacking).',
        'Jede Änderung wird vor dem Deployment automatisch typgeprüft, gelintet und gebaut.',
        'Abhängigkeiten werden wöchentlich automatisch auf bekannte Schwachstellen geprüft.',
        'Serverfunktionen beschränken den Cross-Origin-Zugriff auf unsere eigenen Origins und verlangen eine gültige Sitzung, sobald Kontodaten betroffen sind.',
      ],
    },
    {
      title: 'KI und Ihre Daten',
      items: [
        'KI-Anfragen aus der Anwendung laufen über unsere Server, sodass Zugangsdaten und Routing unter unserer Kontrolle bleiben.',
        'Welche Modellanbieter in einem Deployment genutzt werden und wo sie Daten verarbeiten, regelt der Auftragsverarbeitungsvertrag. Bei On-Premises- und Air-Gap-Betrieb bleiben Daten und Inferenz in Ihrem Netzwerk.',
        'Antworten nennen die Signale und Dokumente, auf denen sie beruhen, damit Ihr Team sie vor dem Handeln prüfen kann.',
      ],
    },
    {
      title: 'Datenschutz',
      items: [
        'Für Kundendaten handeln wir als Auftragsverarbeiter auf Grundlage eines Auftragsverarbeitungsvertrags nach Art. 28 DSGVO.',
        'Diese Website nutzt Analyse nur nach Ihrer Einwilligung, speichert diese Daten in der EU und setzt keine Werbe-Cookies. Einzelheiten stehen in unserer Datenschutzerklärung.',
      ],
    },
    {
      title: 'Sicherheitsvorfälle',
      items: [
        'Betrifft ein Sicherheitsvorfall Kundendaten, informieren wir die betroffenen Kunden unverzüglich und erfüllen die Meldepflichten nach Art. 33 und 34 DSGVO.',
      ],
    },
  ],
};

export default function Security() {
  const { language } = useLanguage();
  const de = language === 'de';

  return (
    <LegalLayout
      indexable
      canonicalPath="/security"
      eyebrow={de ? 'Vertrauen' : 'Trust'}
      title={de ? 'Sicherheit und Umgang mit Daten' : 'Security & Data Handling'}
      description={
        de
          ? 'Wie ClerkTree Infrastruktur, Zugriffe und Daten schützt und wie Sie eine Schwachstelle melden.'
          : 'How ClerkTree protects infrastructure, access and data, and how to report a vulnerability.'
      }
    >
      <p>
        {de
          ? 'Diese Seite beschreibt die Maßnahmen, die heute im Einsatz sind. Für Sicherheitsfragebögen, einen Auftragsverarbeitungsvertrag oder Details zu einem bestimmten Betriebsmodell schreiben Sie uns.'
          : 'This page describes the measures in place today. For security questionnaires, a data processing agreement or details on a specific deployment model, write to us.'}
      </p>

      {SECTIONS[language].map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <ul>
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}

      <h2 id="disclosure">{de ? 'Schwachstelle melden' : 'Reporting a vulnerability'}</h2>
      <p>
        {de ? 'Wenn Sie eine Schwachstelle gefunden haben, schreiben Sie an ' : 'If you have found a vulnerability, write to '}
        <a href={`mailto:${COMPANY.securityEmail}`}>{COMPANY.securityEmail}</a>
        {de
          ? '. Beschreiben Sie bitte die betroffene Adresse, die Schritte zur Reproduktion und die mögliche Auswirkung. Wir bestätigen den Eingang, halten Sie über die Behebung auf dem Laufenden und gehen nicht rechtlich gegen Meldungen vor, die in gutem Glauben erfolgen, keine Daten Dritter abrufen oder verändern und den Betrieb nicht stören.'
          : ". Please include the affected address, the steps to reproduce and the possible impact. We acknowledge your report, keep you informed about the fix, and will not take legal action over reports made in good faith that do not access or modify other people's data and do not disrupt the service."}
      </p>
    </LegalLayout>
  );
}
