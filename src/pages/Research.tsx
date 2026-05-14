import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Clock3, Cpu, Database, Sparkles } from 'lucide-react';

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
  repoUrl: string;
  artifactUrl: string;
  metrics: Array<{ label: string; value: string }>;
  highlights: string[];
  datasets: string[];
  notes: string[];
};

const researchTopics: ResearchTopic[] = [
  {
    slug: 'juris-vakra-capability-2',
    badge: 'Featured Research',
    title: 'Juris for VAKRA Capability 2',
    subtitle: 'A capability-wide dashboard-API benchmark submission with deterministic tool routing.',
    summary:
      'Juris is ClerkTree research on constrained agent execution for dashboard-style API benchmarks. This first public entry captures the VAKRA capability 2 submission, covering all released domains with a single-tool execution loop, deterministic overrides, and argument normalization to reduce routing drift.',
    status: 'Validated submission',
    repoUrl: 'https://github.com/amethystani/juris-vakra-cap2-submission',
    artifactUrl:
      'https://github.com/amethystani/juris-vakra-cap2-submission/releases/download/v1/juris_vakra_capability2_submission_20260504.zip',
    metrics: [
      { label: 'Completion Rate', value: '94.99%' },
      { label: 'Successful Runs', value: '1,517 / 1,597' },
      { label: 'Domain Coverage', value: '17 / 17' },
      { label: 'Average Duration', value: '62.89s' },
    ],
    highlights: [
      'Capability-level submission instead of a single-domain sample, aligned to current evaluator guidance.',
      'Hybrid lexical and semantic tool shortlisting with deterministic overrides for failure-prone query classes.',
      'Constrained one-tool execution loop to limit free-form reasoning drift on large API inventories.',
    ],
    datasets: [
      'california_schools',
      'card_games',
      'chicago_crime',
      'debit_card_specializing',
      'european_football_2',
      'financial',
      'formula_1',
      'movie',
      'movie_3',
      'movielens',
      'movies_4',
      'public_review_platform',
      'simpson_episodes',
      'superhero',
      'thrombosis_prediction',
      'toxicology',
      'video_games',
    ],
    notes: [
      'Primary model: Qwen/Qwen3.6-35B-A3B served locally via Ollama as qwen3.6:35b-a3b.',
      'Hardware: NVIDIA RTX 4500 Ada Generation with 24 GB VRAM.',
      'Validation passed for all 17 output files in the official VAKRA validator.',
    ],
  },
];

function getResearchCanonical(slug?: string) {
  if (typeof window === 'undefined') {
    return slug
      ? `https://clerktree.com/research/${slug}`
      : 'https://clerktree.com/research';
  }

  const { hostname, origin } = window.location;
  if (hostname === 'research.clerktree.com') {
    return slug ? `${origin}/${slug}` : origin;
  }

  return slug ? `${origin}/research/${slug}` : `${origin}/research`;
}

export default function Research() {
  const navigate = useNavigate();
  const { topicSlug } = useParams<{ topicSlug?: string }>();
  const defaultTopic = researchTopics[0];
  const activeTopic = useMemo(
    () => researchTopics.find((topic) => topic.slug === topicSlug) ?? defaultTopic,
    [topicSlug]
  );
  const [selectedTopic, setSelectedTopic] = useState(activeTopic.slug);

  useEffect(() => {
    setSelectedTopic(activeTopic.slug);
  }, [activeTopic.slug]);

  const isResearchHost =
    typeof window !== 'undefined' && window.location.hostname === 'research.clerktree.com';

  const handleTopicClick = (slug: string) => {
    setSelectedTopic(slug);
    if (isResearchHost) {
      navigate(slug === defaultTopic.slug ? '/' : `/${slug}`);
      return;
    }

    navigate(slug === defaultTopic.slug ? '/research' : `/research/${slug}`);
  };

  return (
    <div className="bg-[rgb(10,10,10)] min-h-screen relative overflow-x-hidden">
      <SEO
        title="Research"
        description="ClerkTree research on agent systems, benchmark submissions, and applied reasoning workflows."
        canonical={getResearchCanonical(activeTopic.slug === defaultTopic.slug ? undefined : activeTopic.slug)}
        openGraph={{
          title: 'ClerkTree Research',
          description:
            'Research updates from ClerkTree, starting with the Juris VAKRA capability 2 benchmark submission.',
          url: getResearchCanonical(activeTopic.slug === defaultTopic.slug ? undefined : activeTopic.slug),
        }}
      />

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

      <div className="relative z-10 px-6 pb-24 pt-36 md:pt-44">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.28em] text-[#FF8A5B] sm:text-sm">
              Research at ClerkTree
            </p>
            <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/85 bg-clip-text text-transparent">
                Applied systems research, shipped publicly.
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-white/70 md:text-xl">
              This space tracks the research work behind ClerkTree, from benchmark submissions to
              agent workflow design. Each topic opens into the implementation notes, validation
              status, and public artifacts behind the work.
            </p>
          </div>

          <div className="mb-10 rounded-[32px] border border-[#FF8A5B]/20 bg-gradient-to-br from-[#FF8A5B]/8 via-white/[0.03] to-white/[0.02] p-8 backdrop-blur-sm md:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FF8A5B]/25 bg-[#FF8A5B]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#FFB089]">
                  <Sparkles className="h-4 w-4" />
                  Current focus
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                  {activeTopic.title}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
                  {activeTopic.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {activeTopic.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">{metric.label}</p>
                    <p className="mt-2 text-xl font-semibold text-white">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="space-y-4">
              {researchTopics.map((topic) => {
                const isSelected = selectedTopic === topic.slug;

                return (
                  <button
                    key={topic.slug}
                    type="button"
                    onClick={() => handleTopicClick(topic.slug)}
                    className={`w-full rounded-[28px] border p-6 text-left transition-all duration-300 ${
                      isSelected
                        ? 'border-[#FF8A5B]/40 bg-[#FF8A5B]/10 shadow-[0_0_40px_-15px_rgba(255,138,91,0.35)]'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                        {topic.badge}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="h-5 w-5 text-[#FF8A5B]" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-white/35" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight text-white">{topic.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/65">{topic.summary}</p>
                  </button>
                );
              })}
            </aside>

            <section className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm md:p-10">
              <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FF8A5B]">
                    {activeTopic.status}
                  </p>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                    {activeTopic.title}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-white/75 md:text-lg">
                    {activeTopic.summary}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                  <a
                    href={activeTopic.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E5E5E5] px-5 py-3 font-semibold text-black transition-all duration-300 hover:bg-white"
                  >
                    View Repository
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                  <a
                    href={activeTopic.artifactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white transition-all duration-300 hover:bg-white/10"
                  >
                    Download Artifact
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="grid gap-6 pt-8 md:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <Cpu className="h-5 w-5 text-[#FF8A5B]" />
                    <h3 className="text-lg font-semibold text-white">Approach</h3>
                  </div>
                  <div className="space-y-3">
                    {activeTopic.highlights.map((highlight) => (
                      <p key={highlight} className="text-sm leading-relaxed text-white/72">
                        {highlight}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <Clock3 className="h-5 w-5 text-[#FF8A5B]" />
                    <h3 className="text-lg font-semibold text-white">Run Notes</h3>
                  </div>
                  <div className="space-y-3">
                    {activeTopic.notes.map((note) => (
                      <p key={note} className="text-sm leading-relaxed text-white/72">
                        {note}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-6">
                <div className="mb-5 flex items-center gap-3">
                  <Database className="h-5 w-5 text-[#FF8A5B]" />
                  <h3 className="text-lg font-semibold text-white">Covered domains</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {activeTopic.datasets.map((dataset) => (
                    <span
                      key={dataset}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75"
                    >
                      {dataset}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[28px] border border-[#FF8A5B]/15 bg-gradient-to-r from-[#FF8A5B]/8 to-transparent p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-[#FFB089]">Next in queue</p>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/70">
                  This page is structured to grow into a research index. Additional topics can be
                  added as new public artifacts land, and each one will appear as another tab in the
                  left rail without changing the overall page layout.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
