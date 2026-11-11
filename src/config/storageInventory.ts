import type { ConsentCategory } from '../lib/consent';

type Localized = { en: string; de: string };

type StorageEntry = {
  name: string;
  provider: string;
  kind: 'Cookie' | 'Local storage' | 'Session storage' | 'IndexedDB';
  purpose: Localized;
  duration: Localized;
};

export type StorageGroup = {
  id: 'necessary' | ConsentCategory;
  title: Localized;
  description: Localized;
  entries: StorageEntry[];
};

/**
 * Everything this site stores in, or reads from, the visitor's browser.
 * Single source for the consent dialog and the Cookie Policy page, so the two
 * cannot drift apart. Update this list whenever a new key or vendor is added.
 */
export const STORAGE_INVENTORY: StorageGroup[] = [
  {
    id: 'necessary',
    title: { en: 'Strictly necessary', de: 'Unbedingt erforderlich' },
    description: {
      en: 'Needed for the site and your account to work: remembering this choice, your language and your sign-in. These cannot be switched off and are never used for tracking.',
      de: 'Erforderlich, damit Website und Konto funktionieren: Speicherung dieser Auswahl, Ihrer Sprache und Ihrer Anmeldung. Sie lassen sich nicht abschalten und werden nicht zum Tracking verwendet.',
    },
    entries: [
      {
        name: 'clerktree_cookie_consent',
        provider: 'ClerkTree',
        kind: 'Local storage',
        purpose: { en: 'Remembers your privacy choice', de: 'Speichert Ihre Datenschutz-Auswahl' },
        duration: { en: '12 months', de: '12 Monate' },
      },
      {
        name: 'app-language',
        provider: 'ClerkTree',
        kind: 'Local storage',
        purpose: { en: 'Remembers the language you selected', de: 'Speichert die gewählte Sprache' },
        duration: { en: 'Until you clear it', de: 'Bis zur Löschung durch Sie' },
      },
      {
        name: 'ct-logo-portal, chunk_retry_*',
        provider: 'ClerkTree',
        kind: 'Session storage',
        purpose: {
          en: 'Plays the intro animation once per visit and prevents reload loops after an update',
          de: 'Spielt die Intro-Animation einmal pro Besuch ab und verhindert Neuladeschleifen nach einem Update',
        },
        duration: { en: 'Until you close the tab', de: 'Bis zum Schließen des Tabs' },
      },
      {
        name: 'sb-*-auth-token, clerktree-client-portal-auth',
        provider: 'ClerkTree (Supabase)',
        kind: 'Local storage',
        purpose: {
          en: 'Keeps you signed in to the workspace or client portal (only set when you sign in)',
          de: 'Hält Sie im Workspace bzw. Kundenportal angemeldet (wird nur bei Anmeldung gesetzt)',
        },
        duration: { en: 'Until you sign out', de: 'Bis zur Abmeldung' },
      },
      {
        name: 'theme, dashboard-preferences',
        provider: 'ClerkTree',
        kind: 'Local storage',
        purpose: {
          en: 'Your display settings inside the workspace',
          de: 'Ihre Anzeige-Einstellungen im Workspace',
        },
        duration: { en: 'Until you clear it', de: 'Bis zur Löschung durch Sie' },
      },
      {
        name: 'sidebar_state, mail_panel_layout',
        provider: 'ClerkTree',
        kind: 'Cookie',
        purpose: { en: 'Remembers the workspace layout', de: 'Speichert das Layout des Workspace' },
        duration: { en: '7 days', de: '7 Tage' },
      },
    ],
  },
  {
    id: 'analytics',
    title: { en: 'Analytics', de: 'Analyse' },
    description: {
      en: 'Helps us understand how the site is used so we can improve it: page views, clicks and a replay of your session on this site (form inputs are masked). Processed by Amplitude on servers in the EU. Off unless you switch it on.',
      de: 'Hilft uns zu verstehen, wie die Website genutzt wird, um sie zu verbessern: Seitenaufrufe, Klicks und eine Aufzeichnung Ihrer Sitzung auf dieser Website (Formulareingaben werden maskiert). Verarbeitung durch Amplitude auf Servern in der EU. Deaktiviert, bis Sie es einschalten.',
    },
    entries: [
      {
        name: 'AMP_*',
        provider: 'Amplitude',
        kind: 'Cookie',
        purpose: {
          en: 'Random device and session identifiers to tell visits apart',
          de: 'Zufällige Geräte- und Sitzungskennungen zur Unterscheidung von Besuchen',
        },
        duration: { en: '12 months', de: '12 Monate' },
      },
      {
        name: 'AMP_unsent_*',
        provider: 'Amplitude',
        kind: 'Local storage',
        purpose: { en: 'Buffers events until they are sent', de: 'Puffert Ereignisse bis zum Versand' },
        duration: { en: 'Until sent', de: 'Bis zum Versand' },
      },
      {
        name: 'Session replay buffer',
        provider: 'Amplitude',
        kind: 'IndexedDB',
        purpose: {
          en: 'Buffers the session recording until it is sent',
          de: 'Puffert die Sitzungsaufzeichnung bis zum Versand',
        },
        duration: { en: 'Until sent', de: 'Bis zum Versand' },
      },
    ],
  },
  {
    id: 'externalMedia',
    title: { en: 'External media', de: 'Externe Medien' },
    description: {
      en: 'Loads the Google Maps view of our office on the contact page. When the map loads, Google receives your IP address and may set its own cookies. Off unless you switch it on.',
      de: 'Lädt die Google-Maps-Ansicht unseres Büros auf der Kontaktseite. Beim Laden der Karte erhält Google Ihre IP-Adresse und kann eigene Cookies setzen. Deaktiviert, bis Sie es einschalten.',
    },
    entries: [
      {
        name: 'NID, AEC and others',
        provider: 'Google Ireland Ltd.',
        kind: 'Cookie',
        purpose: {
          en: 'Set by Google when the embedded map is displayed',
          de: 'Werden von Google gesetzt, wenn die eingebettete Karte angezeigt wird',
        },
        duration: { en: 'Up to 6 months', de: 'Bis zu 6 Monate' },
      },
    ],
  },
];
