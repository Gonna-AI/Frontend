import { ArrowLeft, ArrowUpRight, Cpu, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import SharedHeader from '../components/Layout/SharedHeader';
import Footer from '../components/Landing/Footer';
import SEO from '../components/SEO';

type ResearchTopic = {
  slug: string;
  badge: string;
  title: string;
  subtitle: string;
  summary: string;
  benchmarkUrl: string;
  leaderboardUrl: string;
  approachTitle: string;
  approach: string[];
};

const researchTopics: ResearchTopic[] = [
  {
    slug: 'juris',
    badge: 'Aktueller Fokus',
    title: 'Juris',
    subtitle:
      'Ein Forschungsprogramm für verlässliche Aufgabenausführung, bei dem Benchmark-Validierung als ein externer Maßstab für Systemqualität dient.',
    summary:
      'Juris ist ClerkTree-Forschung zum Aufbau verlässlicher, aufgabenorientierter Agenten, die auch unter Werkzeug-, Schema- und Latenzbeschränkungen mit hoher Präzision arbeiten. Der Fokus liegt nicht auf offenem, inszeniertem Reasoning, sondern auf Ausführungsqualität: dem richtigen Aktionspfad, struktureller Korrektheit, der Minimierung von Fehlerketten und konsistentem Verhalten über große und heterogene Schnittstellen hinweg. VAKRA dient in diesem Eintrag als externer Validierungsrahmen und nicht als Definition des Systems selbst.',
    benchmarkUrl: 'https://www.ibm.com/new/announcements/introducing-vakra-benchmark',
    leaderboardUrl: 'https://huggingface.co/spaces/ibm-research/vakra',
    approachTitle: 'Methode und Forschungsrichtung',
    approach: [
      'Juris basiert auf der Annahme, dass starke Agentenleistung aus disziplinierter Ausführungsarchitektur entsteht und nicht aus unbeschränkter Autonomie. Das System priorisiert Aktionsauswahl, Schnittstellenabgleich und Fehlerbegrenzung, damit es selbst dann vorhersagbar bleibt, wenn die Aufgabenoberfläche breit und operativ verrauscht ist.',
      'Ein zentraler Teil der Arbeit besteht darin, vermeidbare Entscheidungsentropie zu reduzieren. Anstatt dem Modell lange freie Tool-Ketten zu erlauben, verengt das System den Aktionsraum früh, erzwingt eine engere Kopplung zwischen Anfrageintention und Tool-Auswahl und bevorzugt den kleinsten gültigen Ausführungspfad. Das verbessert die Verlässlichkeit, senkt Latenzaufwand durch unproduktive Schleifen und stabilisiert Ergebnisse über unterschiedliche Workloads hinweg.',
      'Die Forschung konzentriert sich außerdem auf strukturelle Robustheit. In praktischen Einsätzen entstehen Fehler oft weniger durch reine Intelligenzgrenzen als durch fehlerhafte Argumente, falsche Schnittstellenwahl, oberflächliche Ambiguitätsbehandlung oder sich verstärkendes Recovery-Verhalten. Juris begegnet dem, indem Orchestrierungsqualität als primäres Forschungsziel behandelt wird, sodass der Agent auch unter operativen Beschränkungen präzise bleibt, ohne interne Heuristiken offenzulegen oder auf Präsentation zu überoptimieren.',
      'Die Benchmark-Auswertung dient hier als externer Nachweis dafür, dass das Ausführungsframework auch unter Druck generalisiert. VAKRA ist dafür nützlich, weil es reales Tool-Use-Verhalten über mehrere Domänen hinweg belastet und damit sichtbar macht, ob Verbesserungen in Routing-Disziplin, Ausführungskontrolle und Antwortformung über internes Testing hinaus messbare Wirkung zeigen.',
    ],
  },
];

function getResearchCanonical(slug?: string) {
  if (typeof window === 'undefined') {
    return slug ? `https://clerktree.com/research/${slug}` : 'https://clerktree.com/research';
  }

  const { hostname, origin } = window.location;
  if (hostname === 'research.clerktree.com') {
    return slug ? `${origin}/${slug}` : origin;
  }

  return slug ? `${origin}/research/${slug}` : `${origin}/research`;
}

function getTopicPath(slug: string, isResearchHost: boolean) {
  return isResearchHost ? `/${slug}` : `/research/${slug}`;
}

function ResearchShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[rgb(10,10,10)] min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 bg-[rgb(10,10,10)] z-0 pointer-events-none">
        <div
          className="absolute top-[-12%] right-[-10%] h-[110%] w-[82%]"
          style={{
            background:
              'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 32%, transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute top-0 right-0 h-full w-full"
          style={{
            background:
              'linear-gradient(215deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.015) 40%, transparent 65%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/4 translate-y-1/4 opacity-20 md:h-[600px] md:w-[600px]"
          style={{
            background:
              'radial-gradient(circle, rgba(255,138,91,0.4) 0%, rgba(255,138,91,0.15) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute right-[10%] top-[25%] h-64 w-64 rounded-full opacity-20 md:h-96 md:w-96"
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 45%, transparent 100%)',
            filter: 'blur(100px)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'url(/noise.webp)', backgroundSize: '35%' }}
        />
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
      </div>

      <div className="relative z-20">
        <SharedHeader />
      </div>

      <div className="relative z-10 px-6 pb-24 pt-36 md:pt-44">{children}</div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

function ResearchLanding({ topic, isResearchHost }: { topic: ResearchTopic; isResearchHost: boolean }) {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Research"
        description="ClerkTree research on agent systems, benchmark submissions, and applied reasoning workflows."
        canonical={getResearchCanonical()}
        openGraph={{
          title: 'ClerkTree Research',
          description: 'Research updates from ClerkTree and the public work behind them.',
          url: getResearchCanonical(),
        }}
      />

      <ResearchShell>
        <div className="mx-auto max-w-[1600px]">
          <button
            type="button"
            onClick={() => navigate(getTopicPath(topic.slug, isResearchHost))}
            className="group w-full rounded-[42px] border border-[#6d4739] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_35%),linear-gradient(180deg,rgba(8,8,8,0.96),rgba(6,6,6,0.98))] px-8 py-10 text-left shadow-[0_0_0_1px_rgba(255,138,91,0.05)] transition-all duration-500 hover:border-[#8f5b47] hover:shadow-[0_0_45px_-20px_rgba(255,138,91,0.28)] md:px-14 md:py-16"
          >
            <div className="flex flex-col gap-10">
              <div className="max-w-3xl">
                <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#704738] bg-[#2a1a16]/90 px-6 py-3 text-sm font-semibold uppercase tracking-[0.26em] text-[#ffc29e]">
                  <Sparkles className="h-4 w-4" />
                  {topic.badge}
                </div>
                <h1 className="max-w-2xl text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-7xl">
                  {topic.title}
                </h1>
                <p className="mt-8 max-w-3xl text-xl leading-relaxed text-white/70 md:text-2xl">
                  {topic.subtitle}
                </p>
                <div className="mt-8 inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#ffc29e] transition-transform duration-300 group-hover:translate-x-1">
                  Forschungsthema öffnen
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </button>
        </div>
      </ResearchShell>
    </>
  );
}

function ResearchDetail({ topic, isResearchHost }: { topic: ResearchTopic; isResearchHost: boolean }) {
  const navigate = useNavigate();
  const landingPath = isResearchHost ? '/' : '/research';

  return (
    <>
      <SEO
        title={topic.title}
        description={topic.summary}
        canonical={getResearchCanonical(topic.slug)}
        openGraph={{
          title: topic.title,
          description: topic.summary,
          url: getResearchCanonical(topic.slug),
        }}
      />

      <ResearchShell>
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate(landingPath)}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Forschung
          </button>

          <section className="mt-8 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8 md:p-10">
            <div className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FF8A5B]">
                  Detailübersicht
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                  {topic.title}
                </h2>
                <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-white/75 md:text-lg">
                  {topic.summary}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <a
                  href={topic.benchmarkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E5E5E5] px-5 py-3 font-semibold text-black transition-all duration-300 hover:bg-white"
                >
                  Was ist VAKRA
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href={topic.leaderboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white transition-all duration-300 hover:bg-white/10"
                >
                  Zum Leaderboard
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="pt-8">
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 sm:p-6 md:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-[#FF8A5B]" />
                  <h3 className="text-lg font-semibold text-white">{topic.approachTitle}</h3>
                </div>
                <div className="space-y-5">
                  {topic.approach.map((paragraph) => (
                    <p key={paragraph} className="max-w-[66ch] text-sm leading-7 text-white/72 md:text-[15px]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </ResearchShell>
    </>
  );
}

export default function Research() {
  const { topicSlug } = useParams<{ topicSlug?: string }>();
  const isResearchHost =
    typeof window !== 'undefined' && window.location.hostname === 'research.clerktree.com';

  const topic = topicSlug
    ? researchTopics.find((candidate) => candidate.slug === topicSlug)
    : undefined;

  if (topicSlug && topic) {
    return <ResearchDetail topic={topic} isResearchHost={isResearchHost} />;
  }

  return <ResearchLanding topic={researchTopics[0]} isResearchHost={isResearchHost} />;
}
