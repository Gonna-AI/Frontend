import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

import { STORAGE_INVENTORY, type StorageGroup } from '../config/storageInventory';
import { useLanguage } from '../contexts/LanguageContext';
import { getConsent, saveConsent, type ConsentCategory } from '../lib/consent';

type Choice = Record<ConsentCategory, boolean>;

const NOTHING: Choice = { analytics: false, externalMedia: false };
const EVERYTHING: Choice = { analytics: true, externalMedia: true };

/** Freezes the page behind the dialog (works on iOS and with smooth scrolling) and restores the exact position. */
function useLockPageScroll(active: boolean) {
  useEffect(() => {
    if (!active) return undefined;
    const { body, documentElement: html } = document;
    const y = window.scrollY;
    const prev = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: html.style.overflow };
    body.style.position = 'fixed';
    body.style.top = `-${y}px`;
    body.style.width = '100%';
    html.style.overflow = 'hidden';
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      html.style.overflow = prev.overflow;
      const behavior = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      window.scrollTo(0, y);
      html.style.scrollBehavior = behavior;
    };
  }, [active]);
}

function Toggle({ checked, disabled, label, onChange }: { checked: boolean; disabled?: boolean; label: string; onChange?: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full border border-black transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${checked ? 'bg-black' : 'bg-transparent'}`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0.5 top-0.5 h-[18px] w-[18px] rounded-full transition-transform ${checked ? 'translate-x-5 bg-[#ff4d00]' : 'bg-black'}`}
      />
    </button>
  );
}

function CategoryRow({
  group,
  checked,
  expanded,
  onToggle,
  onExpand,
}: {
  group: StorageGroup;
  checked: boolean;
  expanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
}) {
  const { t, language } = useLanguage();
  const panelId = useId();
  const locked = group.id === 'necessary';

  return (
    <div className="overflow-hidden rounded-[22px] border border-black/20 bg-white/28">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4">
        <button
          type="button"
          aria-controls={panelId}
          aria-expanded={expanded}
          onClick={onExpand}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ChevronDown aria-hidden="true" className={`h-5 w-5 shrink-0 text-black/65 transition-transform ${expanded ? '' : '-rotate-90'}`} />
          <span className="text-[15px] font-semibold text-black">{group.title[language]}</span>
          {locked && (
            <span className="rounded-full border border-black/10 bg-white/65 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">
              {t('cookies.required')}
            </span>
          )}
        </button>
        <Toggle checked={locked || checked} disabled={locked} label={group.title[language]} onChange={locked ? undefined : onToggle} />
      </div>

      <div id={panelId} hidden={!expanded} className="space-y-4 px-4 pb-4 sm:px-5 sm:pb-5">
        <p className="text-[13px] leading-relaxed text-black/75">{group.description[language]}</p>
        <div className="overflow-x-auto rounded-[16px] border border-black/16 bg-white/32">
          <table className="w-full min-w-[520px] text-xs">
            <thead>
              <tr className="border-b border-black/12 bg-white/42 text-left text-black/60">
                <th className="px-3 py-2 font-semibold">{t('cookies.tableName')}</th>
                <th className="px-3 py-2 font-semibold">{t('cookies.tableProvider')}</th>
                <th className="px-3 py-2 font-semibold">{t('cookies.tablePurpose')}</th>
                <th className="px-3 py-2 font-semibold">{t('cookies.tableExpiry')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {group.entries.map((entry) => (
                <tr key={entry.name}>
                  <td className="break-words px-3 py-2 font-mono text-black">{entry.name}</td>
                  <td className="px-3 py-2 text-black/75">{entry.provider}<br /><span className="text-black/55">{entry.kind}</span></td>
                  <td className="px-3 py-2 text-black/75">{entry.purpose[language]}</td>
                  <td className="px-3 py-2 text-black/75">{entry.duration[language]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

type CookieConsentProps = {
  /** Open straight on the detailed settings (footer link) instead of the first-visit banner. */
  startInSettings?: boolean;
  onClose: () => void;
};

export default function CookieConsent({ startInSettings = false, onClose }: CookieConsentProps) {
  const { t, language } = useLanguage();
  const [view, setView] = useState<'banner' | 'settings'>(startInSettings ? 'settings' : 'banner');
  const [shown, setShown] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [choice, setChoice] = useState<Choice>(() => {
    const stored = getConsent();
    return stored ? { analytics: stored.analytics, externalMedia: stored.externalMedia } : NOTHING;
  });
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(closeTimer.current);
    };
  }, []);

  useLockPageScroll(view === 'settings');

  const close = () => {
    setShown(false);
    closeTimer.current = window.setTimeout(onClose, 350);
  };
  const decide = (next: Choice) => {
    saveConsent(next);
    close();
  };
  // Leaving the settings without a stored choice returns to the banner: a decision is still owed.
  const leaveSettings = () => (getConsent() ? close() : setView('banner'));

  useEffect(() => {
    if (view !== 'settings') return undefined;
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') leaveSettings();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const toggle = (id: ConsentCategory) => setChoice((prev) => ({ ...prev, [id]: !prev[id] }));
  const optionalGroups = STORAGE_INVENTORY.filter((group) => group.id !== 'necessary');

  const links = (
    <>
      <a href="/privacy-policy" className="underline underline-offset-2">{t('cookies.privacyPolicy')}</a>
      <a href="/cookie-policy" className="underline underline-offset-2">{t('cookies.cookiePolicy')}</a>
      <a href="/imprint" className="underline underline-offset-2">{t('cookies.imprint')}</a>
    </>
  );

  // Accept and reject carry the same visual weight, so neither choice is nudged.
  const primaryButton = 'min-h-[48px] rounded-full bg-black px-6 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5';
  const secondaryButton = 'min-h-[48px] rounded-full border border-black/40 bg-white/70 px-6 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5';

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] isolate flex items-end justify-center sm:items-center" data-lenis-prevent="" lang={language}>
      {view === 'banner' ? (
        <section
          aria-label={t('cookies.bannerTitle')}
          className={`pointer-events-auto absolute inset-x-0 bottom-0 transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${shown ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
        >
          <div className="rounded-t-[22px] bg-[#ff4d00] px-4 pt-5 pb-[max(16px,env(safe-area-inset-bottom))] text-black shadow-[0_-24px_70px_rgba(0,0,0,0.28)] roomy:px-10 roomy:py-8">
            <div className="mx-auto grid max-w-[1440px] gap-4 roomy:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-end">
              <div>
                <h2 className="text-[21px] font-medium leading-none tracking-[-0.03em] roomy:text-[32px]">{t('cookies.bannerTitle')}</h2>
                <p className="mt-3 max-w-[820px] text-[13px] leading-[1.45] text-black/85 roomy:mt-5 roomy:text-sm">{t('cookies.bannerDesc')}</p>

                <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-[14px] roomy:mt-6 roomy:text-[16px]">
                  {optionalGroups.map((group) => (
                    <label key={group.id} className="inline-flex cursor-pointer items-center gap-3">
                      <Toggle
                        checked={choice[group.id as ConsentCategory]}
                        label={group.title[language]}
                        onChange={() => toggle(group.id as ConsentCategory)}
                      />
                      <span aria-hidden="true">{group.title[language]}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] roomy:mt-6 roomy:text-[13px]">
                  {links}
                  <button type="button" onClick={() => setView('settings')} className="underline underline-offset-2">
                    {t('cookies.details')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                <button type="button" onClick={() => decide(EVERYTHING)} className={primaryButton}>{t('cookies.acceptAll')}</button>
                <button type="button" onClick={() => decide(NOTHING)} className={primaryButton}>{t('cookies.rejectAll')}</button>
                <button type="button" onClick={() => decide(choice)} className={`${secondaryButton} col-span-2 lg:col-span-1`}>{t('cookies.savePreferences')}</button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          <button
            type="button"
            aria-label={t('cookies.close')}
            tabIndex={-1}
            onClick={leaveSettings}
            className={`pointer-events-auto absolute inset-0 cursor-default bg-black/70 transition-opacity duration-300 ${shown ? 'opacity-100' : 'opacity-0'}`}
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
            tabIndex={-1}
            className={`pointer-events-auto relative mx-auto flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[28px] bg-[#ff4d00] text-black shadow-2xl shadow-black/55 outline-none transition-all duration-300 sm:max-h-[86vh] sm:rounded-[32px] ${shown ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          >
            <div className="flex shrink-0 items-start justify-between gap-6 border-b border-black/16 px-5 py-5 sm:px-8 sm:py-6">
              <h2 id="cookie-settings-title" className="text-[30px] font-medium leading-none tracking-[-0.04em] sm:text-[42px]">
                {t('cookies.settingsTitle')}
              </h2>
              <button type="button" onClick={leaveSettings} aria-label={t('cookies.close')} className="rounded-full bg-black p-3 text-white transition-transform hover:-translate-y-0.5">
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8 sm:py-6">
              <div className="rounded-[24px] bg-white/30 p-5 text-sm leading-relaxed text-black/80">
                <p>{t('cookies.bannerDesc')}</p>
                <div className="mt-3 flex flex-wrap gap-5 font-medium">{links}</div>
              </div>
              {STORAGE_INVENTORY.map((group) => (
                <CategoryRow
                  key={group.id}
                  group={group}
                  checked={group.id === 'necessary' ? true : choice[group.id]}
                  expanded={expanded === group.id}
                  onToggle={() => group.id !== 'necessary' && toggle(group.id)}
                  onExpand={() => setExpanded((prev) => (prev === group.id ? null : group.id))}
                />
              ))}
            </div>

            <div className="grid shrink-0 gap-3 border-t border-black/16 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:grid-cols-3 sm:px-8">
              <button type="button" onClick={() => decide(NOTHING)} className={primaryButton}>{t('cookies.rejectAll')}</button>
              <button type="button" onClick={() => decide(choice)} className={secondaryButton}>{t('cookies.savePreferences')}</button>
              <button type="button" onClick={() => decide(EVERYTHING)} className={primaryButton}>{t('cookies.acceptAll')}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
