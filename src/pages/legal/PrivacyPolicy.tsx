import { COMPANY } from '../../config/company';
import { useLanguage } from '../../contexts/LanguageContext';
import { openConsentSettings } from '../../lib/consent';
import LegalLayout from './LegalLayout';

function Controller() {
  const { language } = useLanguage();
  return (
    <address>
      {COMPANY.legalName}<br />
      {COMPANY.street}<br />
      {COMPANY.postalCode} {COMPANY.city}, {COMPANY.country[language]}<br />
      <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a><br />
      <a href={COMPANY.phoneHref}>{COMPANY.phone}</a>
    </address>
  );
}

function English() {
  return (
    <>
      <p>
        This notice explains what personal data we process when you visit clerktree.com, contact us or use a ClerkTree
        account, why we do so, and which rights you have. It follows the EU General Data Protection Regulation (GDPR).
      </p>

      <h2 id="controller">1. Who is responsible</h2>
      <p>The controller within the meaning of Art. 4(7) GDPR is:</p>
      <Controller />
      <p>For any privacy question or request, write to the email address above or use our <a href="/data-access">data request form</a>.</p>

      <h2 id="visiting">2. Visiting the website</h2>
      <h3>Hosting and server logs</h3>
      <p>
        The site is delivered by our hosting provider Netlify, Inc. (USA) through its content delivery network. To deliver a
        page, the provider necessarily processes your IP address, the date and time of the request, the address requested,
        the referring page, and browser and operating system details, and keeps them briefly in server logs to operate and
        secure the service. Images and media are served from Cloudflare, Inc. (USA) object storage, which processes the same
        technical data. Legal basis: our legitimate interest in a secure, reliable website (Art. 6(1)(f) GDPR).
      </p>
      <h3>Fonts</h3>
      <p>All fonts are served from our own domain. No request is made to third-party font services.</p>
      <h3>Storage on your device</h3>
      <p>
        We store a small number of entries in your browser that are strictly necessary, such as your language and your
        privacy choice. Everything else is only stored with your consent. The full list is in our{' '}
        <a href="/cookie-policy">Cookie Policy</a>. Legal basis: § 25(2) TDDDG for necessary entries, § 25(1) TDDDG and
        Art. 6(1)(a) GDPR for all others.
      </p>

      <h2 id="consent">3. Services we only use with your consent</h2>
      <h3>Analytics and session replay (Amplitude)</h3>
      <p>
        If you allow "Analytics", we use Amplitude (Amplitude, Inc., USA; data stored in Amplitude's EU data centre in
        Germany) to understand how the site is used. Amplitude records pages viewed, clicks, form submissions (not their
        content), device and browser details, an approximate location derived from your IP address, and random device and
        session identifiers stored in cookies. It also records a replay of your session on our site so that we can find
        usability problems; text you type into forms is masked. Legal basis: your consent (Art. 6(1)(a) GDPR, § 25(1)
        TDDDG). Nothing is loaded before you consent.
      </p>
      <h3>Map (Google Maps)</h3>
      <p>
        The map on the contact page is only loaded after you allow "External media" or click to load the map. Google
        Ireland Limited then receives your IP address and may set its own cookies; data may also be transferred to Google
        LLC in the USA. Legal basis: your consent (Art. 6(1)(a) GDPR, § 25(1) TDDDG).
      </p>
      <p>
        You can withdraw or change your consent at any time with effect for the future:{' '}
        <button type="button" className="legal-action" onClick={openConsentSettings}>Open cookie settings</button>
      </p>

      <h2 id="contact">4. When you contact us</h2>
      <p>
        If you use the contact form or write to us by email, we process what you send: your name, company, email address,
        phone number, the topic and company size you select, and your message. We use this only to answer you and to
        prepare a possible business relationship. Form submissions are stored in our database hosted with Supabase (see
        section 8). Legal basis: steps prior to entering into a contract (Art. 6(1)(b) GDPR) and our legitimate interest in
        answering enquiries (Art. 6(1)(f) GDPR).
      </p>
      <p>
        Requests sent through the <a href="/data-access">data request form</a> are processed to verify and fulfil your
        request. Legal basis: compliance with a legal obligation (Art. 6(1)(c) GDPR in conjunction with Art. 12 to 22 GDPR).
      </p>

      <h2 id="accounts">5. Accounts, workspace and client portal</h2>
      <p>
        When you or your organisation use a ClerkTree account, we process your email address, your name, a hashed
        password and the technical data needed to keep you signed in. If you sign in with Google, we receive your name,
        email address and profile picture from Google. Support tickets you submit are processed to resolve your request.
        Legal basis: performance of the contract (Art. 6(1)(b) GDPR).
      </p>
      <p>
        If you connect Google Workspace to your account, we access Gmail and Google Drive data only to provide the
        features you enable. Our use and transfer of information received from Google APIs adheres to the{' '}
        <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
          Google API Services User Data Policy
        </a>, including the Limited Use requirements.
      </p>
      <p>
        AI features in the workspace send the content you submit to inference providers that process it on our behalf,
        currently Groq, Inc. (USA) and Google.
      </p>
      <p>
        Operational data that customers process in the ClerkTree platform (for example machine signals, documents and
        work orders) is processed by us as a processor on behalf of the customer under a data processing agreement
        (Art. 28 GDPR). The customer remains the controller for that data; please direct requests about it to the
        respective customer.
      </p>

      <h2 id="applications">6. Job applications</h2>
      <p>
        Open roles are published on Wellfound; applications there are subject to Wellfound's privacy policy. If you apply
        to us directly, we process your application data to decide on establishing an employment relationship
        (Art. 6(1)(b) GDPR, § 26 BDSG). If no employment follows, we delete the data no later than six months after the
        process ends, unless you agree to a longer period.
      </p>

      <h2 id="links">7. Links to other sites</h2>
      <p>
        We link to our profiles on LinkedIn, X, GitHub, Hugging Face and Wellfound. These are plain links: no data is sent
        to those services until you follow one. From then on, the respective provider's privacy policy applies.
      </p>

      <h2 id="recipients">8. Recipients and transfers outside the EU</h2>
      <p>We use carefully selected service providers that process data on our behalf under data processing agreements:</p>
      <div className="legal-table">
        <table>
          <thead>
            <tr><th>Provider</th><th>Purpose</th><th>Location</th></tr>
          </thead>
          <tbody>
            <tr><td>Netlify, Inc.</td><td>Website hosting and delivery</td><td>USA, global CDN</td></tr>
            <tr><td>Cloudflare, Inc.</td><td>Storage and delivery of images and media</td><td>USA, global CDN</td></tr>
            <tr><td>Supabase, Inc.</td><td>Database, authentication and server functions</td><td>USA / hosting region of our project</td></tr>
            <tr><td>Amplitude, Inc.</td><td>Analytics and session replay (consent only)</td><td>EU data centre (Germany)</td></tr>
            <tr><td>Google Ireland Ltd.</td><td>Map display (consent only), Google sign-in and Workspace integration</td><td>Ireland / USA</td></tr>
            <tr><td>Groq, Inc.</td><td>AI inference for workspace features</td><td>USA</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Where personal data is transferred to the USA or another third country, the transfer is based on an adequacy
        decision of the European Commission (for providers certified under the EU-U.S. Data Privacy Framework) or on the
        Commission's standard contractual clauses (Art. 46(2)(c) GDPR). We do not sell personal data and we do not use it
        for advertising.
      </p>

      <h2 id="retention">9. How long we keep data</h2>
      <ul>
        <li>Enquiries: for as long as needed to handle them, then deleted unless a business relationship follows.</li>
        <li>Account data: for the duration of the contract and deleted after it ends, subject to the periods below.</li>
        <li>Business correspondence and accounting records: six or ten years, as required by German commercial and tax law (§ 257 HGB, § 147 AO).</li>
        <li>Server logs: for the short period set by the hosting provider.</li>
        <li>Analytics data: until you withdraw consent, and otherwise for the retention period configured with the provider.</li>
        <li>Your privacy choice: twelve months in your browser, then we ask again.</li>
      </ul>

      <h2 id="rights">10. Your rights</h2>
      <p>Under the GDPR you have the right to:</p>
      <ul>
        <li>obtain information about the data we hold about you and a copy of it (Art. 15);</li>
        <li>have inaccurate data corrected (Art. 16) and data erased (Art. 17);</li>
        <li>have processing restricted (Art. 18);</li>
        <li>receive data you provided in a portable format (Art. 20);</li>
        <li><strong>object at any time to processing based on our legitimate interests (Art. 21);</strong></li>
        <li>withdraw consent at any time with effect for the future (Art. 7(3)).</li>
      </ul>
      <p>
        To exercise these rights, email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or use the{' '}
        <a href="/data-access">data request form</a>. We answer within one month.
      </p>
      <p>
        You also have the right to lodge a complaint with a supervisory authority (Art. 77 GDPR). The authority responsible
        for us is the Bayerisches Landesamt für Datenschutzaufsicht (BayLDA), Promenade 18, 91522 Ansbach, Germany,{' '}
        <a href="https://www.lda.bayern.de" target="_blank" rel="noopener noreferrer">www.lda.bayern.de</a>.
      </p>

      <h2 id="other">11. Further information</h2>
      <p>
        You are not obliged to provide personal data. Without the data marked as required, however, we cannot answer an
        enquiry or provide an account. We do not use automated decision-making or profiling within the meaning of
        Art. 22 GDPR. Our services are aimed at businesses and are not directed at children.
      </p>
      <p>
        We protect data with technical and organisational measures appropriate to the risk, including encrypted
        transmission (TLS). Details are on our <a href="/security">Security</a> page.
      </p>

      <h2 id="changes">12. Changes to this notice</h2>
      <p>
        We update this notice when our processing or the legal situation changes. The date at the top shows the current
        version.
      </p>
    </>
  );
}

function German() {
  return (
    <>
      <p>
        Diese Erklärung erläutert, welche personenbezogenen Daten wir verarbeiten, wenn Sie clerktree.com besuchen, uns
        kontaktieren oder ein ClerkTree-Konto nutzen, zu welchem Zweck dies geschieht und welche Rechte Sie haben. Sie
        richtet sich nach der Datenschutz-Grundverordnung (DSGVO).
      </p>

      <h2 id="controller">1. Verantwortlicher</h2>
      <p>Verantwortlicher im Sinne von Art. 4 Nr. 7 DSGVO ist:</p>
      <Controller />
      <p>
        Für alle Fragen und Anliegen zum Datenschutz schreiben Sie an die oben genannte E-Mail-Adresse oder nutzen Sie
        unser <a href="/data-access">Formular für Betroffenenanfragen</a>.
      </p>

      <h2 id="visiting">2. Besuch der Website</h2>
      <h3>Hosting und Server-Logs</h3>
      <p>
        Die Website wird von unserem Hosting-Anbieter Netlify, Inc. (USA) über dessen Content Delivery Network
        ausgeliefert. Zur Auslieferung einer Seite verarbeitet der Anbieter zwangsläufig Ihre IP-Adresse, Datum und
        Uhrzeit des Abrufs, die aufgerufene Adresse, die verweisende Seite sowie Angaben zu Browser und Betriebssystem
        und speichert diese kurzzeitig in Server-Logs, um den Dienst zu betreiben und abzusichern. Bilder und Medien
        werden aus dem Objektspeicher von Cloudflare, Inc. (USA) ausgeliefert, wobei dieselben technischen Daten
        verarbeitet werden. Rechtsgrundlage: unser berechtigtes Interesse an einer sicheren und zuverlässigen Website
        (Art. 6 Abs. 1 lit. f DSGVO).
      </p>
      <h3>Schriftarten</h3>
      <p>Alle Schriftarten werden von unserer eigenen Domain geladen. Es erfolgt kein Abruf bei externen Schriftdiensten.</p>
      <h3>Speicherung auf Ihrem Gerät</h3>
      <p>
        Wir speichern in Ihrem Browser wenige, unbedingt erforderliche Einträge, etwa Ihre Sprache und Ihre
        Datenschutz-Auswahl. Alles Weitere wird nur mit Ihrer Einwilligung gespeichert. Die vollständige Liste finden Sie
        in unserer <a href="/cookie-policy">Cookie-Richtlinie</a>. Rechtsgrundlage: § 25 Abs. 2 TDDDG für erforderliche
        Einträge, § 25 Abs. 1 TDDDG und Art. 6 Abs. 1 lit. a DSGVO für alle übrigen.
      </p>

      <h2 id="consent">3. Dienste, die wir nur mit Ihrer Einwilligung nutzen</h2>
      <h3>Analyse und Sitzungsaufzeichnung (Amplitude)</h3>
      <p>
        Wenn Sie „Analyse“ erlauben, nutzen wir Amplitude (Amplitude, Inc., USA; Speicherung im EU-Rechenzentrum von
        Amplitude in Deutschland), um zu verstehen, wie die Website genutzt wird. Amplitude erfasst aufgerufene Seiten,
        Klicks, das Absenden von Formularen (nicht deren Inhalt), Geräte- und Browserangaben, einen aus Ihrer IP-Adresse
        abgeleiteten ungefähren Standort sowie zufällige Geräte- und Sitzungskennungen, die in Cookies gespeichert
        werden. Außerdem wird Ihre Sitzung auf unserer Website aufgezeichnet, damit wir Bedienprobleme finden können;
        Texteingaben in Formularen werden dabei maskiert. Rechtsgrundlage: Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO,
        § 25 Abs. 1 TDDDG). Vor Ihrer Einwilligung wird nichts geladen.
      </p>
      <h3>Karte (Google Maps)</h3>
      <p>
        Die Karte auf der Kontaktseite wird erst geladen, nachdem Sie „Externe Medien“ erlaubt oder die Karte per Klick
        geladen haben. Google Ireland Limited erhält dann Ihre IP-Adresse und kann eigene Cookies setzen; Daten können
        auch an Google LLC in die USA übermittelt werden. Rechtsgrundlage: Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO,
        § 25 Abs. 1 TDDDG).
      </p>
      <p>
        Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen oder ändern:{' '}
        <button type="button" className="legal-action" onClick={openConsentSettings}>Cookie-Einstellungen öffnen</button>
      </p>

      <h2 id="contact">4. Kontaktaufnahme</h2>
      <p>
        Wenn Sie das Kontaktformular nutzen oder uns per E-Mail schreiben, verarbeiten wir Ihre Angaben: Name,
        Unternehmen, E-Mail-Adresse, Telefonnummer, das gewählte Thema und die Unternehmensgröße sowie Ihre Nachricht.
        Wir nutzen diese Daten ausschließlich, um Ihnen zu antworten und eine mögliche Geschäftsbeziehung vorzubereiten.
        Formulareingaben werden in unserer bei Supabase gehosteten Datenbank gespeichert (siehe Abschnitt 8).
        Rechtsgrundlage: vorvertragliche Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO) und unser berechtigtes Interesse an der
        Beantwortung von Anfragen (Art. 6 Abs. 1 lit. f DSGVO).
      </p>
      <p>
        Anfragen über das <a href="/data-access">Formular für Betroffenenanfragen</a> verarbeiten wir, um Ihr Anliegen zu
        prüfen und zu erfüllen. Rechtsgrundlage: Erfüllung einer rechtlichen Verpflichtung (Art. 6 Abs. 1 lit. c DSGVO
        in Verbindung mit Art. 12 bis 22 DSGVO).
      </p>

      <h2 id="accounts">5. Konten, Workspace und Kundenportal</h2>
      <p>
        Wenn Sie oder Ihre Organisation ein ClerkTree-Konto nutzen, verarbeiten wir Ihre E-Mail-Adresse, Ihren Namen, ein
        gehashtes Passwort sowie die technischen Daten, die für Ihre Anmeldung erforderlich sind. Bei der Anmeldung mit
        Google erhalten wir von Google Ihren Namen, Ihre E-Mail-Adresse und Ihr Profilbild. Von Ihnen eingereichte
        Support-Tickets verarbeiten wir zur Bearbeitung Ihres Anliegens. Rechtsgrundlage: Vertragserfüllung (Art. 6
        Abs. 1 lit. b DSGVO).
      </p>
      <p>
        Wenn Sie Google Workspace mit Ihrem Konto verbinden, greifen wir auf Gmail- und Google-Drive-Daten nur zu, um die
        von Ihnen aktivierten Funktionen bereitzustellen. Unsere Nutzung und Weitergabe von Informationen, die wir über
        Google-APIs erhalten, entspricht der{' '}
        <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
          Google API Services User Data Policy
        </a>{' '}
        einschließlich der Anforderungen zur eingeschränkten Nutzung (Limited Use).
      </p>
      <p>
        KI-Funktionen im Workspace übermitteln die von Ihnen eingegebenen Inhalte an Inferenz-Anbieter, die diese in
        unserem Auftrag verarbeiten, derzeit Groq, Inc. (USA) und Google.
      </p>
      <p>
        Betriebsdaten, die Kunden in der ClerkTree-Plattform verarbeiten (zum Beispiel Maschinensignale, Dokumente und
        Arbeitsaufträge), verarbeiten wir als Auftragsverarbeiter im Auftrag des Kunden auf Grundlage eines
        Auftragsverarbeitungsvertrags (Art. 28 DSGVO). Verantwortlicher für diese Daten bleibt der Kunde; bitte richten
        Sie Anfragen dazu an den jeweiligen Kunden.
      </p>

      <h2 id="applications">6. Bewerbungen</h2>
      <p>
        Offene Stellen veröffentlichen wir auf Wellfound; für Bewerbungen dort gilt die Datenschutzerklärung von
        Wellfound. Wenn Sie sich direkt bei uns bewerben, verarbeiten wir Ihre Bewerbungsdaten zur Entscheidung über die
        Begründung eines Beschäftigungsverhältnisses (Art. 6 Abs. 1 lit. b DSGVO, § 26 BDSG). Kommt kein
        Beschäftigungsverhältnis zustande, löschen wir die Daten spätestens sechs Monate nach Abschluss des Verfahrens,
        sofern Sie keiner längeren Speicherung zustimmen.
      </p>

      <h2 id="links">7. Links zu anderen Websites</h2>
      <p>
        Wir verlinken auf unsere Profile bei LinkedIn, X, GitHub, Hugging Face und Wellfound. Es handelt sich um einfache
        Links: Daten werden erst an diese Dienste übermittelt, wenn Sie einem Link folgen. Ab dann gilt die
        Datenschutzerklärung des jeweiligen Anbieters.
      </p>

      <h2 id="recipients">8. Empfänger und Übermittlung in Drittländer</h2>
      <p>Wir setzen sorgfältig ausgewählte Dienstleister ein, die Daten in unserem Auftrag auf Grundlage von Auftragsverarbeitungsverträgen verarbeiten:</p>
      <div className="legal-table">
        <table>
          <thead>
            <tr><th>Anbieter</th><th>Zweck</th><th>Standort</th></tr>
          </thead>
          <tbody>
            <tr><td>Netlify, Inc.</td><td>Hosting und Auslieferung der Website</td><td>USA, globales CDN</td></tr>
            <tr><td>Cloudflare, Inc.</td><td>Speicherung und Auslieferung von Bildern und Medien</td><td>USA, globales CDN</td></tr>
            <tr><td>Supabase, Inc.</td><td>Datenbank, Authentifizierung und Serverfunktionen</td><td>USA / Hosting-Region unseres Projekts</td></tr>
            <tr><td>Amplitude, Inc.</td><td>Analyse und Sitzungsaufzeichnung (nur mit Einwilligung)</td><td>EU-Rechenzentrum (Deutschland)</td></tr>
            <tr><td>Google Ireland Ltd.</td><td>Kartendarstellung (nur mit Einwilligung), Google-Anmeldung und Workspace-Integration</td><td>Irland / USA</td></tr>
            <tr><td>Groq, Inc.</td><td>KI-Inferenz für Workspace-Funktionen</td><td>USA</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Soweit personenbezogene Daten in die USA oder ein anderes Drittland übermittelt werden, erfolgt dies auf
        Grundlage eines Angemessenheitsbeschlusses der Europäischen Kommission (bei Anbietern, die nach dem EU-U.S. Data
        Privacy Framework zertifiziert sind) oder der Standardvertragsklauseln der Kommission (Art. 46 Abs. 2 lit. c
        DSGVO). Wir verkaufen keine personenbezogenen Daten und nutzen sie nicht für Werbung.
      </p>

      <h2 id="retention">9. Speicherdauer</h2>
      <ul>
        <li>Anfragen: solange es zur Bearbeitung erforderlich ist; danach Löschung, sofern keine Geschäftsbeziehung entsteht.</li>
        <li>Kontodaten: für die Dauer des Vertrags und Löschung nach dessen Ende, vorbehaltlich der folgenden Fristen.</li>
        <li>Geschäftskorrespondenz und Buchungsunterlagen: sechs bzw. zehn Jahre gemäß Handels- und Steuerrecht (§ 257 HGB, § 147 AO).</li>
        <li>Server-Logs: für den kurzen, vom Hosting-Anbieter festgelegten Zeitraum.</li>
        <li>Analysedaten: bis zum Widerruf Ihrer Einwilligung, im Übrigen für die beim Anbieter eingestellte Aufbewahrungsdauer.</li>
        <li>Ihre Datenschutz-Auswahl: zwölf Monate in Ihrem Browser, danach fragen wir erneut.</li>
      </ul>

      <h2 id="rights">10. Ihre Rechte</h2>
      <p>Nach der DSGVO haben Sie das Recht,</p>
      <ul>
        <li>Auskunft über die zu Ihrer Person gespeicherten Daten und eine Kopie zu erhalten (Art. 15);</li>
        <li>unrichtige Daten berichtigen (Art. 16) und Daten löschen zu lassen (Art. 17);</li>
        <li>die Verarbeitung einschränken zu lassen (Art. 18);</li>
        <li>von Ihnen bereitgestellte Daten in einem übertragbaren Format zu erhalten (Art. 20);</li>
        <li><strong>jederzeit der Verarbeitung auf Grundlage unserer berechtigten Interessen zu widersprechen (Art. 21);</strong></li>
        <li>eine Einwilligung jederzeit mit Wirkung für die Zukunft zu widerrufen (Art. 7 Abs. 3).</li>
      </ul>
      <p>
        Zur Ausübung dieser Rechte schreiben Sie an <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> oder nutzen Sie
        das <a href="/data-access">Formular für Betroffenenanfragen</a>. Wir antworten innerhalb eines Monats.
      </p>
      <p>
        Sie haben außerdem das Recht, sich bei einer Aufsichtsbehörde zu beschweren (Art. 77 DSGVO). Die für uns
        zuständige Behörde ist das Bayerische Landesamt für Datenschutzaufsicht (BayLDA), Promenade 18, 91522 Ansbach,{' '}
        <a href="https://www.lda.bayern.de" target="_blank" rel="noopener noreferrer">www.lda.bayern.de</a>.
      </p>

      <h2 id="other">11. Weitere Hinweise</h2>
      <p>
        Sie sind nicht verpflichtet, personenbezogene Daten bereitzustellen. Ohne die als erforderlich gekennzeichneten
        Angaben können wir jedoch keine Anfrage beantworten und kein Konto bereitstellen. Eine automatisierte
        Entscheidungsfindung oder ein Profiling im Sinne von Art. 22 DSGVO findet nicht statt. Unser Angebot richtet sich
        an Unternehmen und nicht an Kinder.
      </p>
      <p>
        Wir schützen Daten durch dem Risiko angemessene technische und organisatorische Maßnahmen, unter anderem durch
        verschlüsselte Übertragung (TLS). Einzelheiten finden Sie auf unserer Seite <a href="/security">Sicherheit</a>.
      </p>

      <h2 id="changes">12. Änderungen dieser Erklärung</h2>
      <p>
        Wir passen diese Erklärung an, wenn sich unsere Verarbeitung oder die Rechtslage ändert. Das Datum oben zeigt den
        aktuellen Stand.
      </p>
    </>
  );
}

export default function PrivacyPolicy() {
  const { language } = useLanguage();
  const de = language === 'de';

  return (
    <LegalLayout
      title={de ? 'Datenschutzerklärung' : 'Privacy Policy'}
      description={
        de
          ? 'Welche Daten ClerkTree verarbeitet, zu welchem Zweck und welche Rechte Sie haben.'
          : 'What data ClerkTree processes, why, and the rights available to you.'
      }
    >
      {de ? <German /> : <English />}
    </LegalLayout>
  );
}
