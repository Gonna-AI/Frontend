import { STORAGE_INVENTORY } from '../../config/storageInventory';
import { COMPANY } from '../../config/company';
import { useLanguage } from '../../contexts/LanguageContext';
import { openConsentSettings } from '../../lib/consent';
import LegalLayout from './LegalLayout';

const KIND_DE: Record<string, string> = {
  Cookie: 'Cookie',
  'Local storage': 'Lokaler Speicher',
  'Session storage': 'Sitzungsspeicher',
  IndexedDB: 'IndexedDB',
};

/** Rendered from the same inventory as the consent dialog, so the two always match. */
function InventoryTables() {
  const { language } = useLanguage();
  const de = language === 'de';

  return (
    <>
      {STORAGE_INVENTORY.map((group) => (
        <section key={group.id}>
          <h3>{group.title[language]}</h3>
          <p>{group.description[language]}</p>
          <div className="legal-table">
            <table>
              <thead>
                <tr>
                  <th>{de ? 'Name' : 'Name'}</th>
                  <th>{de ? 'Anbieter' : 'Provider'}</th>
                  <th>{de ? 'Art' : 'Type'}</th>
                  <th>{de ? 'Zweck' : 'Purpose'}</th>
                  <th>{de ? 'Dauer' : 'Duration'}</th>
                </tr>
              </thead>
              <tbody>
                {group.entries.map((entry) => (
                  <tr key={entry.name}>
                    <td><code>{entry.name}</code></td>
                    <td>{entry.provider}</td>
                    <td>{de ? KIND_DE[entry.kind] : entry.kind}</td>
                    <td>{entry.purpose[language]}</td>
                    <td>{entry.duration[language]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}

export default function CookiePolicy() {
  const { language } = useLanguage();
  const de = language === 'de';

  return (
    <LegalLayout
      title={de ? 'Cookie-Richtlinie' : 'Cookie Policy'}
      description={
        de
          ? 'Welche Cookies und ähnlichen Technologien ClerkTree verwendet und wie Sie darüber entscheiden.'
          : 'Which cookies and similar technologies ClerkTree uses, and how you control them.'
      }
    >
      {de ? (
        <>
          <p>
            Diese Richtlinie erläutert, welche Informationen clerktree.com in Ihrem Browser speichert oder ausliest. Sie
            ergänzt unsere <a href="/privacy-policy">Datenschutzerklärung</a>.
          </p>

          <h2>1. Was gemeint ist</h2>
          <p>
            Cookies sind kleine Textdateien, die eine Website in Ihrem Browser ablegt. Ähnlich funktionieren der lokale
            Speicher, der Sitzungsspeicher und IndexedDB Ihres Browsers. Für alle diese Techniken gilt dieselbe Regel
            (§ 25 TDDDG): Was für den von Ihnen gewünschten Dienst unbedingt erforderlich ist, dürfen wir ohne
            Einwilligung verwenden; alles andere nur, wenn Sie zustimmen.
          </p>

          <h2>2. Ihre Auswahl</h2>
          <p>
            Beim ersten Besuch fragen wir Sie nach Ihrer Auswahl. Standardmäßig ist alles Optionale ausgeschaltet. Sie
            können Ihre Auswahl jederzeit ändern oder widerrufen; nach zwölf Monaten fragen wir erneut.
          </p>
          <p>
            <button type="button" className="legal-action" onClick={openConsentSettings}>Cookie-Einstellungen öffnen</button>
          </p>
          <p>
            Zusätzlich können Sie in Ihrem Browser gespeicherte Daten jederzeit löschen oder das Speichern blockieren.
            Wenn Sie erforderliche Einträge blockieren, funktionieren Anmeldung und Spracheinstellung möglicherweise
            nicht.
          </p>

          <h2>3. Was wir verwenden</h2>
          <InventoryTables />

          <h2>4. Was wir nicht verwenden</h2>
          <p>
            Wir setzen keine Werbe- oder Marketing-Cookies ein, betreiben kein seitenübergreifendes Tracking und binden
            keine Social-Media-Plugins ein. Schriftarten werden von unserer eigenen Domain geladen.
          </p>

          <h2>5. Kontakt</h2>
          <p>
            Fragen zu dieser Richtlinie richten Sie bitte an <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
          </p>
        </>
      ) : (
        <>
          <p>
            This policy explains what clerktree.com stores in, or reads from, your browser. It supplements our{' '}
            <a href="/privacy-policy">Privacy Policy</a>.
          </p>

          <h2>1. What this covers</h2>
          <p>
            Cookies are small text files a website places in your browser. Your browser's local storage, session storage
            and IndexedDB work in a similar way. The same rule applies to all of them (§ 25 TDDDG): what is strictly
            necessary for the service you asked for may be used without consent; everything else only if you agree.
          </p>

          <h2>2. Your choice</h2>
          <p>
            On your first visit we ask for your choice. Everything optional is switched off by default. You can change or
            withdraw your choice at any time; after twelve months we ask again.
          </p>
          <p>
            <button type="button" className="legal-action" onClick={openConsentSettings}>Open cookie settings</button>
          </p>
          <p>
            You can also delete stored data or block storage in your browser at any time. If you block the necessary
            entries, sign-in and your language setting may not work.
          </p>

          <h2>3. What we use</h2>
          <InventoryTables />

          <h2>4. What we do not use</h2>
          <p>
            We set no advertising or marketing cookies, do no cross-site tracking and embed no social media plugins. Fonts
            are served from our own domain.
          </p>

          <h2>5. Contact</h2>
          <p>
            Questions about this policy: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
          </p>
        </>
      )}
    </LegalLayout>
  );
}
