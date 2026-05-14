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
  status: string;
  benchmarkUrl: string;
  leaderboardUrl: string;
  approachTitle: string;
  approach: string[];
};

const researchTopics: ResearchTopic[] = [
  {
    slug: 'juris',
    badge: 'Current Focus',
    title: 'Juris',
    subtitle:
      'A research program in reliable task execution, with benchmark validation used as one external measure of system quality.',
    summary:
      'Juris is ClerkTree research on building dependable task-oriented agents that operate with high precision under tool, schema, and latency constraints. The emphasis is not on open-ended theatrical reasoning, but on execution quality: selecting the right action path, preserving structural correctness, minimizing failure cascades, and improving consistency across large and heterogeneous interfaces. In this entry, VAKRA is used as an external validation setting rather than the definition of the system itself.',
    status: 'Extern validiert',
    benchmarkUrl: 'https://www.ibm.com/new/announcements/introducing-vakra-benchmark',
    leaderboardUrl: 'https://huggingface.co/spaces/ibm-research/vakra',
    approachTitle: 'Method and Research Direction',
    approach: [
      'Juris is designed around the idea that strong agent performance comes from disciplined execution architecture rather than unconstrained autonomy. The system prioritizes action selection, interface alignment, and error containment so that it behaves predictably even when the task surface is broad and operationally noisy.',
      'A central part of the work is reducing avoidable decision entropy. Instead of allowing the model to wander through long free-form tool chains, the system narrows the action space early, enforces tighter correspondence between query intent and tool selection, and biases toward the smallest valid execution path. This improves reliability, lowers latency overhead from unproductive loops, and makes outcomes more stable across varied workloads.',
      'The research also focuses on structural robustness. In practical deployments, failures often come less from raw intelligence limits and more from malformed arguments, wrong interface choice, shallow ambiguity handling, or compounding recovery behavior. Juris addresses this by treating orchestration quality as a first-class research target, allowing the agent to remain precise under operational constraints without exposing internal heuristics or overfitting to presentation.',
      'Benchmark evaluation is used here as external evidence that the execution framework generalizes under pressure. VAKRA is useful because it stresses real tool-use behavior across multiple domains, making it possible to test whether improvements in routing discipline, execution control, and answer shaping translate into measurable gains beyond internal testing alone.',
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
                  Open research topic
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
            Back to research
          </button>

          <section className="mt-8 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8 md:p-10">
            <div className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FF8A5B]/25 bg-[#FF8A5B]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#FFB089]">
                  <Sparkles className="h-4 w-4" />
                  {topic.status}
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FF8A5B]">
                  Detailed overview
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
                  What Is VAKRA
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href={topic.leaderboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white transition-all duration-300 hover:bg-white/10"
                >
                  View Leaderboard
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
