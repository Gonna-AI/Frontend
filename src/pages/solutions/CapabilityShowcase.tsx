// Homepage solutions grid (#solutions), built from the premium scenes:
// each card is a CRT scene on silver light with the capability copy below.
import { type ComponentType, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  siAbb, siAutodesk, siBosch, siDassaultsystemes, siDatabricks, siGooglesheets, siGrafana, siHubspot, siInfluxdb,
  siJira, siMitsubishi, siMqtt, siNotion, siOdoo, siSage, siSap, siSchneiderelectric, siSiemens, siSnowflake, type SimpleIcon,
} from 'simple-icons';
import { ProductionLineScene, SupplierQuotesScene } from '../home/StoryScenes';
import { BrandMark, ConnectorHubScene, FloorMapScene, ManualExtractScene, WeekPlannerScene } from './ShowcaseScenes';

const heading = {
  en: {
    eyebrow: 'Solutions',
    title: ['Where teams use', 'ClerkTree'],
    intro: 'The right decision depends on more than a single reading. See how machine data, records and people come together when something needs attention.',
    docTitle: 'Technical knowledge',
    docBody: 'Manuals and drawings hold the details. Find the part numbers, tolerances and procedures you need, with the source alongside each answer.',
    rfqTitle: 'Supplier decisions',
    rfqBody: 'Compare offers against the part requirements, price and delivery time. See the trade-offs before your team makes a decision.',
    connects: 'Connects to',
  },
  de: {
    eyebrow: 'Lösungen',
    title: ['Wo Teams', 'ClerkTree einsetzen'],
    intro: 'Eine einzelne Messung zeigt nicht das ganze Bild. Sehen Sie, wie Maschinendaten, Unterlagen und Menschen zusammenkommen, wenn etwas Aufmerksamkeit braucht.',
    docTitle: 'Technisches Wissen',
    docBody: 'Handbücher und Zeichnungen enthalten die Details. Finden Sie Teilenummern, Toleranzen und Verfahren, mit der jeweiligen Quelle direkt daneben.',
    rfqTitle: 'Lieferantenentscheidungen',
    rfqBody: 'Vergleichen Sie Angebote nach Teileanforderungen, Preis und Lieferzeit. Sehen Sie die Unterschiede, bevor Ihr Team entscheidet.',
    connects: 'Verbindet mit',
  },
};

/** Mounts its scene only once the card is near the viewport, so off-screen loops cost nothing. */
function Card({ id, title, body, wide, Scene, logos, logosLabel }: { id: string; title: string; body: string; wide?: boolean; Scene: ComponentType; logos: SimpleIcon[]; logosLabel: string }) {
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '200px 0px' });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <article className={`cs-card${wide ? ' is-wide' : ''}${near ? ' is-in' : ''}`} id={`cx-${id}`} ref={ref} aria-labelledby={`cx-${id}-title`}>
      <div className="cs-visual hs-visual" aria-hidden="true">{near && <Scene />}</div>
      <div className="cs-copy">
        <h3 id={`cx-${id}-title`}>{title}</h3>
        <p>{body}</p>
        <div className="cs-logos">
          <span>{logosLabel}</span>
          {logos.map((icon) => <span className="cs-logo" key={icon.slug}><BrandMark icon={icon} />{icon.title}</span>)}
        </div>
      </div>
    </article>
  );
}

export default function CapabilityShowcase() {
  const { language, t } = useLanguage();
  const h = heading[language === 'de' ? 'de' : 'en'];
  const cards = [
    { id: 'signal', title: t('solutions.card1Title'), body: t('solutions.card1Desc'), Scene: ConnectorHubScene, logos: [siSiemens, siAbb, siBosch, siMitsubishi, siSchneiderelectric, siMqtt] },
    { id: 'agent', title: t('solutions.card2Title'), body: t('solutions.card2Desc'), Scene: WeekPlannerScene, logos: [siSap, siJira, siGooglesheets] },
    { id: 'graph', title: t('solutions.card3Title'), body: t('solutions.card3Desc'), Scene: FloorMapScene, logos: [siDassaultsystemes, siAutodesk, siSnowflake] },
    { id: 'docs', title: h.docTitle, body: h.docBody, Scene: ManualExtractScene, logos: [siAutodesk, siDassaultsystemes, siNotion] },
    { id: 'rfq', title: h.rfqTitle, body: h.rfqBody, Scene: SupplierQuotesScene, logos: [siSap, siOdoo, siSage, siHubspot] },
    { id: 'production', title: t('solutions.card5Title'), body: t('solutions.card5Desc'), Scene: ProductionLineScene, logos: [siGrafana, siInfluxdb, siSnowflake, siDatabricks] },
  ];
  return (
    <section className="cs-section" id="solutions" aria-labelledby="cs-title">
      <header className="cs-heading">
        <p className="cs-eyebrow"><span />{h.eyebrow}</p>
        <h2 id="cs-title">{h.title[0]}<br /><span>{h.title[1]}</span></h2>
        <div>
          <p>{h.intro}</p>
        </div>
      </header>
      <div className="cs-grid">
        {cards.map((card) => <Card key={card.id} {...card} logosLabel={h.connects} />)}
      </div>
    </section>
  );
}
