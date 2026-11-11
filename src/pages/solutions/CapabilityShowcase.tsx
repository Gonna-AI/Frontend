// Homepage use cases (#solutions), six capabilities.
// Wide screens: one stage. A numbered list sits beside a single silver stage that plays the selected
// capability's scene; on its own the list moves on after each scene has played once, and stops the
// moment the visitor picks one.
// Phones: the cards one at a time in a swipeable row, with thin arrows and dots below.
import { type ComponentType, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  siAbb, siAutodesk, siBosch, siDassaultsystemes, siDatabricks, siGooglesheets, siGrafana, siHubspot, siInfluxdb,
  siJira, siMitsubishi, siMqtt, siNotion, siOdoo, siSage, siSap, siSchneiderelectric, siSiemens, siSnowflake, type SimpleIcon,
} from 'simple-icons';
import { ProductionLineScene, SupplierQuotesScene } from '../home/StoryScenes';
import { BrandMark, ConnectorHubScene, FloorMapScene, ManualExtractScene, WeekPlannerScene } from './ShowcaseScenes';
import { decorPaused } from '../../utils/perf';

const heading = {
  en: {
    title: ['Where teams use', 'ClerkTree'],
    intro: 'The right decision depends on more than a single reading. See how machine data, records and people come together when something needs attention.',
    docTitle: 'Technical knowledge',
    docBody: 'Manuals and drawings hold the details. Find the part numbers, tolerances and procedures you need, with the source alongside each answer.',
    rfqTitle: 'Supplier decisions',
    rfqBody: 'Compare offers against the part requirements, price and delivery time. See the trade-offs before your team makes a decision.',
    connects: 'Connects to',
    list: 'Use cases',
    prev: 'Previous use case',
    next: 'Next use case',
    goTo: 'Show',
  },
  de: {
    title: ['Wo Teams', 'ClerkTree einsetzen'],
    intro: 'Eine einzelne Messung zeigt nicht das ganze Bild. Sehen Sie, wie Maschinendaten, Unterlagen und Menschen zusammenkommen, wenn etwas Aufmerksamkeit braucht.',
    docTitle: 'Technisches Wissen',
    docBody: 'Handbücher und Zeichnungen enthalten die Details. Finden Sie Teilenummern, Toleranzen und Verfahren, mit der jeweiligen Quelle direkt daneben.',
    rfqTitle: 'Lieferantenentscheidungen',
    rfqBody: 'Vergleichen Sie Angebote nach Teileanforderungen, Preis und Lieferzeit. Sehen Sie die Unterschiede, bevor Ihr Team entscheidet.',
    connects: 'Verbindet mit',
    list: 'Einsatzbereiche',
    prev: 'Vorheriger Einsatzbereich',
    next: 'Nächster Einsatzbereich',
    goTo: 'Zeige',
  },
};

/** One full loop of a scene (they all run 9 s), so each capability is seen from start to finish. */
const DWELL_MS = 9000;
const TICK_MS = 50;

type Capability = { id: string; title: string; body: string; Scene: ComponentType; logos: SimpleIcon[] };

function useWide() {
  const query = '(min-width: 901px)';
  const [wide, setWide] = useState(() => typeof window === 'undefined' || window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
}

function Stage({ item, near }: { item: Capability; near: boolean }) {
  const { Scene } = item;
  return (
    <div className="cx-stage hs-visual" aria-hidden="true">
      {near && <div className="cx-scene" key={item.id}><Scene /></div>}
    </div>
  );
}

function Logos({ item, label }: { item: Capability; label: string }) {
  return (
    <div className="cs-logos">
      <span>{label}</span>
      {item.logos.map((icon) => <span className="cs-logo" key={icon.slug}><BrandMark icon={icon} />{icon.title}</span>)}
    </div>
  );
}

type Copy = (typeof heading)['en'];

/** Distance from one card to the next (card width plus the gap). */
const stepOf = (el: HTMLElement) => {
  const [a, b] = el.children as unknown as HTMLElement[];
  return a && b ? b.offsetLeft - a.offsetLeft : el.clientWidth;
};

function Carousel({ items, h }: { items: Capability[]; h: Copy }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [near, setNear] = useState(false);
  // Scenes mount when their card is reached (and the one after it, so a swipe never lands on an
  // empty card); once mounted they stay, and pause themselves while off screen.
  const [reached, setReached] = useState(1);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '300px 0px' });
    io.observe(el);
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const next = Math.round(el.scrollLeft / Math.max(1, stepOf(el)));
        setIndex(next);
        setReached((r) => Math.max(r, next + 1));
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); el.removeEventListener('scroll', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);

  const go = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const target = Math.max(0, Math.min(items.length - 1, i));
    el.scrollTo({ left: target * stepOf(el), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <div className="cxm" role="region" aria-roledescription="carousel" aria-label={h.list}>
      <div className="cxm-track" ref={trackRef}>
        {items.map((item, i) => (
          <article className="cxm-card" id={`cx-${item.id}`} key={item.id} aria-roledescription="slide" aria-label={`${i + 1} / ${items.length}`} aria-labelledby={`cxm-${item.id}`}>
            <div className="cxm-visual hs-visual" aria-hidden="true">{near && i <= reached && <item.Scene />}</div>
            <div className="cxm-copy">
              <h3 id={`cxm-${item.id}`}>{item.title}</h3>
              <p>{item.body}</p>
              <Logos item={item} label={h.connects} />
            </div>
          </article>
        ))}
      </div>
      <div className="cxm-nav">
        <button className="cxm-arrow" type="button" aria-label={h.prev} disabled={index === 0} onClick={() => go(index - 1)}>
          <ChevronLeft size={20} strokeWidth={1.25} aria-hidden="true" />
        </button>
        <div className="cxm-dots">
          {items.map((item, i) => (
            <button aria-current={i === index ? 'true' : undefined} aria-label={`${h.goTo}: ${item.title}`} className={i === index ? 'is-on' : ''} key={item.id} onClick={() => go(i)} type="button" />
          ))}
        </div>
        <button className="cxm-arrow" type="button" aria-label={h.next} disabled={index === items.length - 1} onClick={() => go(index + 1)}>
          <ChevronRight size={20} strokeWidth={1.25} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default function CapabilityShowcase() {
  const { language, t } = useLanguage();
  const h = heading[language === 'de' ? 'de' : 'en'];
  const items: Capability[] = [
    { id: 'signal', title: t('solutions.card1Title'), body: t('solutions.card1Desc'), Scene: ConnectorHubScene, logos: [siSiemens, siAbb, siBosch, siMitsubishi, siSchneiderelectric, siMqtt] },
    { id: 'agent', title: t('solutions.card2Title'), body: t('solutions.card2Desc'), Scene: WeekPlannerScene, logos: [siSap, siJira, siGooglesheets] },
    { id: 'graph', title: t('solutions.card3Title'), body: t('solutions.card3Desc'), Scene: FloorMapScene, logos: [siDassaultsystemes, siAutodesk, siSnowflake] },
    { id: 'docs', title: h.docTitle, body: h.docBody, Scene: ManualExtractScene, logos: [siAutodesk, siDassaultsystemes, siNotion] },
    { id: 'rfq', title: h.rfqTitle, body: h.rfqBody, Scene: SupplierQuotesScene, logos: [siSap, siOdoo, siSage, siHubspot] },
    { id: 'production', title: t('solutions.card5Title'), body: t('solutions.card5Desc'), Scene: ProductionLineScene, logos: [siGrafana, siInfluxdb, siSnowflake, siDatabricks] },
  ];
  const wide = useWide();
  const { hash } = useLocation();
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [near, setNear] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const held = useRef(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // Scenes mount only once the section is close, so their loops cost nothing further up the page.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '300px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The timer advances with the same conditions as the scenes' own clock (on screen, tab visible,
  // nothing in front of the page), so the list never moves on before a scene has finished.
  useEffect(() => {
    const el = rootRef.current, bar = barRef.current;
    if (!el || !near || !auto || !wide || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let visible = false, elapsed = 0;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.35 });
    io.observe(el);
    if (bar) bar.style.transform = 'scaleX(0)';
    const timer = window.setInterval(() => {
      if (!visible || held.current || document.hidden || decorPaused()) return;
      elapsed += TICK_MS;
      if (bar) bar.style.transform = `scaleX(${Math.min(1, elapsed / DWELL_MS)})`;
      if (elapsed >= DWELL_MS) setActive((current) => (current + 1) % items.length);
    }, TICK_MS);
    return () => { window.clearInterval(timer); io.disconnect(); };
  }, [active, auto, near, wide, items.length]);

  // Links such as /#cx-rfq (the header's Solutions menu) open that capability.
  useEffect(() => {
    const index = items.findIndex((item) => hash === `#cx-${item.id}`);
    if (index >= 0) { setActive(index); setAuto(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash]);

  const choose = (index: number) => { setActive(index); setAuto(false); };
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + items.length) % items.length;
    choose(next);
    tabs.current[next]?.focus();
  };

  return (
    <section className="cs-section" id="solutions" aria-labelledby="cs-title">
      <header className="cs-heading">
        <h2 id="cs-title">{h.title[0]}<br /><span>{h.title[1]}</span></h2>
        <div>
          <p>{h.intro}</p>
        </div>
      </header>
      {!wide ? <Carousel items={items} h={h} /> : (
      <div
        className={`cx${auto ? ' is-auto' : ''}`}
        ref={rootRef}
        onPointerEnter={() => { held.current = true; }}
        onPointerLeave={() => { held.current = false; }}
        onFocus={() => { held.current = true; }}
        onBlur={() => { held.current = false; }}
      >
        {/* Targets for /#cx-… links: the page scrolls to the top of the panel, which then shows that item. */}
        {items.map((item) => <span aria-hidden="true" className="cx-anchor" id={`cx-${item.id}`} key={item.id} />)}
        <div className="cx-list" role="tablist" aria-label={h.list} aria-orientation="vertical">
          {items.map((item, i) => {
            const on = i === active;
            return (
              <div className={`cx-item${on ? ' is-active' : ''}`} key={item.id}>
                <button
                  aria-controls={`cx-panel-${item.id}`}
                  aria-selected={on}
                  className="cx-tab"
                  id={`cx-tab-${item.id}`}
                  onClick={() => choose(i)}
                  onKeyDown={(event) => onKey(event, i)}
                  ref={(el) => { tabs.current[i] = el; }}
                  role="tab"
                  tabIndex={on ? 0 : -1}
                  type="button"
                >
                  <span className="cx-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="cx-title">{item.title}</span>
                </button>
                <div className="cx-detail" id={`cx-panel-${item.id}`} role="tabpanel" aria-labelledby={`cx-tab-${item.id}`} aria-hidden={on ? undefined : true}>
                  <div>
                    <p>{item.body}</p>
                    <Logos item={item} label={h.connects} />
                  </div>
                </div>
                {on && <span className="cx-bar" aria-hidden="true"><span ref={barRef} /></span>}
              </div>
            );
          })}
        </div>
        <Stage item={items[active]} near={near} />
      </div>
      )}
    </section>
  );
}
