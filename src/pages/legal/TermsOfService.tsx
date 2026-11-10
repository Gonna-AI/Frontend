import { COMPANY } from '../../config/company';
import { useLanguage } from '../../contexts/LanguageContext';
import LegalLayout from './LegalLayout';

function English() {
  return (
    <>
      <h2>1. Scope</h2>
      <p>
        These terms govern the use of the website clerktree.com and its subdomains (the "Website"), operated by{' '}
        {COMPANY.legalName}, {COMPANY.street}, {COMPANY.postalCode} {COMPANY.city}, Germany ("ClerkTree", "we"). By using
        the Website you agree to these terms. The Website is intended for businesses and for persons of legal age.
      </p>
      <p>
        The use of the ClerkTree platform, pilots and related professional services is governed by the separate written
        agreement between ClerkTree and the respective customer (including any data processing agreement). Where that
        agreement and these terms conflict, the agreement prevails.
      </p>

      <h2>2. Content of the Website</h2>
      <p>
        The Website provides information about ClerkTree and its products. We prepare its content with care, but it is
        provided for general information only: descriptions of features, performance figures and case studies do not
        constitute a guarantee, a binding offer or technical or legal advice. Binding commitments arise only from a
        written agreement or quotation.
      </p>

      <h2>3. Accounts</h2>
      <p>
        Some areas require an account. You must provide accurate information, keep your credentials confidential and
        notify us without undue delay at <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> if you suspect
        unauthorised use. You are responsible for activity that takes place under your account unless you are not at
        fault. We may suspend an account that is used in breach of these terms or that endangers the security of the
        service.
      </p>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the Website in breach of applicable law or the rights of third parties;</li>
        <li>attempt to gain unauthorised access to systems, accounts or data, or to circumvent security measures;</li>
        <li>introduce malware or impair the availability of the Website, for example through excessive automated requests;</li>
        <li>systematically extract content by automated means beyond what a search engine does to index public pages;</li>
        <li>submit unlawful, misleading or infringing content through forms or other input fields.</li>
      </ul>
      <p>
        If you discover a security vulnerability, please report it to{' '}
        <a href={`mailto:${COMPANY.securityEmail}`}>{COMPANY.securityEmail}</a>. Good-faith reports made in line with our{' '}
        <a href="/security">Security</a> page are welcome and do not breach these terms.
      </p>

      <h2>5. Intellectual property</h2>
      <p>
        All content on the Website, including text, graphics, logos, software and design, is protected by copyright,
        trademark and other rights and belongs to ClerkTree or its licensors. You may view the Website and print or save
        individual pages for your own internal information. Any other use, in particular reproduction, distribution or
        public display for commercial purposes, requires our prior written consent. Use of the ClerkTree name and logos is
        permitted within the limits set out on the <a href="/brand">Brand</a> page.
      </p>

      <h2>6. Feedback</h2>
      <p>
        If you send us suggestions for improving our products, we may use them without restriction and without
        compensation. This does not apply to information that is identified as confidential or that is subject to a
        separate confidentiality agreement.
      </p>

      <h2>7. Third-party content and links</h2>
      <p>
        The Website contains links to third-party websites. We have no influence over their content and assume no
        responsibility for it; the respective provider is responsible. We checked linked pages for apparent violations
        when the link was created and will remove links without delay if we become aware of an infringement.
      </p>

      <h2>8. Availability and changes</h2>
      <p>
        We aim to keep the Website available without interruption but do not owe any particular availability. We may
        change, restrict or discontinue the Website or parts of it at any time.
      </p>

      <h2>9. Liability</h2>
      <p>
        We are liable without limitation for intent and gross negligence, for injury to life, body or health, under the
        German Product Liability Act and to the extent of any guarantee we have given. In cases of slight negligence we
        are liable only for the breach of an essential obligation, meaning an obligation whose fulfilment makes the proper
        use of the Website possible in the first place and on which you may regularly rely; in that case our liability is
        limited to the foreseeable damage typical for this kind of use. Any further liability is excluded. These
        limitations also apply in favour of our legal representatives, employees and agents.
      </p>

      <h2>10. Data protection</h2>
      <p>
        Information on how we process personal data is set out in our <a href="/privacy-policy">Privacy Policy</a> and{' '}
        <a href="/cookie-policy">Cookie Policy</a>.
      </p>

      <h2>11. Changes to these terms</h2>
      <p>
        We may update these terms for good reason, for example when the Website or the law changes. The version published
        here at the time of your visit applies. Where you hold an account, we will inform you of material changes in
        advance.
      </p>

      <h2>12. Governing law and jurisdiction</h2>
      <p>
        These terms are governed by the laws of the Federal Republic of Germany, excluding the UN Convention on Contracts
        for the International Sale of Goods. If you are a merchant, a legal entity under public law or a special fund
        under public law, the exclusive place of jurisdiction for all disputes arising from these terms is Straubing,
        Germany. Mandatory consumer protection provisions of the country in which a consumer habitually resides remain
        unaffected.
      </p>

      <h2>13. Final provisions</h2>
      <p>
        Should a provision of these terms be or become invalid, the validity of the remaining provisions is unaffected.
        These terms are provided in English and German; in case of doubt the German version prevails.
      </p>

      <h2>14. Contact</h2>
      <p>
        {COMPANY.legalName}, {COMPANY.street}, {COMPANY.postalCode} {COMPANY.city}, Germany.{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. Further details are in our <a href="/imprint">Imprint</a>.
      </p>
    </>
  );
}

function German() {
  return (
    <>
      <h2>1. Geltungsbereich</h2>
      <p>
        Diese Bedingungen regeln die Nutzung der Website clerktree.com einschließlich ihrer Subdomains (die „Website“),
        betrieben von {COMPANY.legalName}, {COMPANY.street}, {COMPANY.postalCode} {COMPANY.city}, Deutschland
        („ClerkTree“, „wir“). Mit der Nutzung der Website erklären Sie sich mit diesen Bedingungen einverstanden. Die
        Website richtet sich an Unternehmen und an volljährige Personen.
      </p>
      <p>
        Für die Nutzung der ClerkTree-Plattform, für Pilotprojekte und zugehörige Dienstleistungen gilt der gesonderte
        schriftliche Vertrag zwischen ClerkTree und dem jeweiligen Kunden (einschließlich eines etwaigen
        Auftragsverarbeitungsvertrags). Bei Widersprüchen zwischen diesem Vertrag und diesen Bedingungen geht der Vertrag
        vor.
      </p>

      <h2>2. Inhalte der Website</h2>
      <p>
        Die Website informiert über ClerkTree und seine Produkte. Wir erstellen die Inhalte mit Sorgfalt; sie dienen
        jedoch ausschließlich der allgemeinen Information. Beschreibungen von Funktionen, Leistungskennzahlen und
        Fallstudien stellen keine Garantie, kein verbindliches Angebot und keine technische oder rechtliche Beratung dar.
        Verbindliche Zusagen ergeben sich nur aus einem schriftlichen Vertrag oder Angebot.
      </p>

      <h2>3. Konten</h2>
      <p>
        Einige Bereiche setzen ein Konto voraus. Sie sind verpflichtet, zutreffende Angaben zu machen, Ihre Zugangsdaten
        geheim zu halten und uns unverzüglich unter <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> zu
        informieren, wenn Sie eine unbefugte Nutzung vermuten. Sie sind für Aktivitäten unter Ihrem Konto verantwortlich,
        es sei denn, Sie haben diese nicht zu vertreten. Wir können ein Konto sperren, das entgegen diesen Bedingungen
        genutzt wird oder die Sicherheit des Dienstes gefährdet.
      </p>

      <h2>4. Zulässige Nutzung</h2>
      <p>Sie verpflichten sich, Folgendes zu unterlassen:</p>
      <ul>
        <li>die Nutzung der Website unter Verstoß gegen geltendes Recht oder Rechte Dritter;</li>
        <li>den Versuch, sich unbefugt Zugang zu Systemen, Konten oder Daten zu verschaffen oder Sicherheitsmaßnahmen zu umgehen;</li>
        <li>das Einbringen von Schadsoftware oder die Beeinträchtigung der Verfügbarkeit der Website, etwa durch übermäßige automatisierte Abrufe;</li>
        <li>das systematische automatisierte Auslesen von Inhalten über das hinaus, was eine Suchmaschine zur Indexierung öffentlicher Seiten tut;</li>
        <li>das Übermitteln rechtswidriger, irreführender oder rechtsverletzender Inhalte über Formulare oder andere Eingabefelder.</li>
      </ul>
      <p>
        Wenn Sie eine Sicherheitslücke entdecken, melden Sie diese bitte an{' '}
        <a href={`mailto:${COMPANY.securityEmail}`}>{COMPANY.securityEmail}</a>. Meldungen in gutem Glauben, die den
        Hinweisen auf unserer Seite <a href="/security">Sicherheit</a> entsprechen, sind willkommen und stellen keinen
        Verstoß gegen diese Bedingungen dar.
      </p>

      <h2>5. Geistiges Eigentum</h2>
      <p>
        Alle Inhalte der Website, einschließlich Texten, Grafiken, Logos, Software und Gestaltung, sind durch Urheber-,
        Marken- und sonstige Rechte geschützt und stehen ClerkTree oder seinen Lizenzgebern zu. Sie dürfen die Website
        ansehen und einzelne Seiten zur eigenen internen Information ausdrucken oder speichern. Jede weitergehende
        Nutzung, insbesondere die Vervielfältigung, Verbreitung oder öffentliche Wiedergabe zu gewerblichen Zwecken,
        bedarf unserer vorherigen schriftlichen Zustimmung. Die Verwendung des Namens und der Logos von ClerkTree ist im
        Rahmen der Hinweise auf der Seite <a href="/brand">Brand</a> gestattet.
      </p>

      <h2>6. Feedback</h2>
      <p>
        Wenn Sie uns Vorschläge zur Verbesserung unserer Produkte übermitteln, dürfen wir diese uneingeschränkt und ohne
        Vergütung verwenden. Dies gilt nicht für Informationen, die als vertraulich gekennzeichnet sind oder einer
        gesonderten Vertraulichkeitsvereinbarung unterliegen.
      </p>

      <h2>7. Inhalte und Links Dritter</h2>
      <p>
        Die Website enthält Links zu Websites Dritter. Auf deren Inhalte haben wir keinen Einfluss und übernehmen dafür
        keine Verantwortung; verantwortlich ist der jeweilige Anbieter. Verlinkte Seiten haben wir zum Zeitpunkt der
        Verlinkung auf erkennbare Rechtsverstöße geprüft; bei Bekanntwerden von Rechtsverletzungen entfernen wir Links
        unverzüglich.
      </p>

      <h2>8. Verfügbarkeit und Änderungen</h2>
      <p>
        Wir bemühen uns um eine unterbrechungsfreie Verfügbarkeit der Website, schulden jedoch keine bestimmte
        Verfügbarkeit. Wir können die Website oder Teile davon jederzeit ändern, einschränken oder einstellen.
      </p>

      <h2>9. Haftung</h2>
      <p>
        Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei Verletzung von Leben, Körper oder Gesundheit,
        nach dem Produkthaftungsgesetz sowie im Umfang einer von uns übernommenen Garantie. Bei leichter Fahrlässigkeit
        haften wir nur bei Verletzung einer wesentlichen Pflicht, also einer Pflicht, deren Erfüllung die
        ordnungsgemäße Nutzung der Website überhaupt erst ermöglicht und auf deren Einhaltung Sie regelmäßig vertrauen
        dürfen; in diesem Fall ist unsere Haftung auf den vorhersehbaren, für diese Art der Nutzung typischen Schaden
        begrenzt. Eine weitergehende Haftung ist ausgeschlossen. Diese Beschränkungen gelten auch zugunsten unserer
        gesetzlichen Vertreter, Mitarbeiter und Erfüllungsgehilfen.
      </p>

      <h2>10. Datenschutz</h2>
      <p>
        Informationen zur Verarbeitung personenbezogener Daten finden Sie in unserer{' '}
        <a href="/privacy-policy">Datenschutzerklärung</a> und unserer <a href="/cookie-policy">Cookie-Richtlinie</a>.
      </p>

      <h2>11. Änderungen dieser Bedingungen</h2>
      <p>
        Wir können diese Bedingungen aus sachlichem Grund anpassen, etwa wenn sich die Website oder die Rechtslage
        ändert. Es gilt die zum Zeitpunkt Ihres Besuchs hier veröffentlichte Fassung. Sofern Sie ein Konto haben,
        informieren wir Sie vorab über wesentliche Änderungen.
      </p>

      <h2>12. Anwendbares Recht und Gerichtsstand</h2>
      <p>
        Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Sind Sie Kaufmann,
        juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist ausschließlicher
        Gerichtsstand für alle Streitigkeiten aus diesen Bedingungen Straubing. Zwingende
        Verbraucherschutzvorschriften des Staates, in dem ein Verbraucher seinen gewöhnlichen Aufenthalt hat, bleiben
        unberührt.
      </p>

      <h2>13. Schlussbestimmungen</h2>
      <p>
        Sollte eine Bestimmung dieser Bedingungen unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen
        Bestimmungen unberührt. Diese Bedingungen liegen in deutscher und englischer Sprache vor; im Zweifel ist die
        deutsche Fassung maßgeblich.
      </p>

      <h2>14. Kontakt</h2>
      <p>
        {COMPANY.legalName}, {COMPANY.street}, {COMPANY.postalCode} {COMPANY.city}, Deutschland.{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. Weitere Angaben finden Sie im{' '}
        <a href="/imprint">Impressum</a>.
      </p>
    </>
  );
}

export default function TermsOfService() {
  const { language } = useLanguage();
  const de = language === 'de';

  return (
    <LegalLayout
      title={de ? 'Nutzungsbedingungen' : 'Terms of Use'}
      description={
        de
          ? 'Die Bedingungen für die Nutzung der Website von ClerkTree.'
          : 'The terms that govern use of the ClerkTree website.'
      }
    >
      {de ? <German /> : <English />}
    </LegalLayout>
  );
}
