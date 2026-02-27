import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getBlogPost, getAllBlogPosts } from "../data/blogPosts";
import { FlickeringGrid } from "../components/Blog/FlickeringGrid";
import { BlogCard } from "../components/Blog/BlogCard";
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "../components/Layout/LanguageSwitcher";
import Footer from "../components/Landing/Footer";
import SEO from "../components/SEO";

const formatDate = (date: string, language: string): string => {
  return new Date(date).toLocaleDateString(
    language === "de" ? "de-DE" : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [markdownError] = useState<string | null>(null);
  const { t, language } = useLanguage();

  if (!slug) {
    navigate("/blog");
    return null;
  }

  const post = getBlogPost(slug);

  if (!post) {
    navigate("/blog");
    return null;
  }

  const formattedDate = formatDate(post.date, language);

  // Get related posts (excluding current post)
  const relatedPosts = getAllBlogPosts()
    .filter(
      (p) => p.slug !== slug && p.tags?.some((tag) => post.tags?.includes(tag)),
    )
    .slice(0, 3);

  return (
    <div className="bg-[rgb(10,10,10)] min-h-screen relative overflow-x-hidden">
      {/* Blue theme background accents */}
      <div className="fixed inset-0 bg-[rgb(10,10,10)] -z-10">
        <SEO
          title={post.title}
          description={post.description}
          canonical={`https://clerktree.com/blog/${slug}`}
          openGraph={{
            type: "article",
            image: post.thumbnail,
          }}
          structuredData={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            image: post.thumbnail ? [post.thumbnail] : [],
            datePublished: post.date,
            author: [
              {
                "@type": "Person",
                name: post.author || "ClerkTree Team",
                url: "https://clerktree.com/about",
              },
            ],
          }}
        />
        <div
          className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 md:w-[800px] h-96 md:h-[800px] opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.6) 0%, rgba(59,130,246,0.25) 40%, transparent 100%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-72 md:w-[600px] h-72 md:h-[600px] opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(29,78,216,0.5) 0%, rgba(29,78,216,0.2) 40%, transparent 100%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Glassy Header with Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full py-3 px-4 sm:px-6 backdrop-blur-md bg-[rgb(10,10,10)]/80 border-b border-transparent">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 group"
            aria-label="Go to home"
          >
            <svg viewBox="0 0 464 468" className="w-9 h-9 md:w-11 md:h-11">
              <path
                fill="white"
                d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
              />
            </svg>
            <span className="text-xl md:text-2xl font-semibold text-white/90 group-hover:text-white transition-colors">
              ClerkTree
            </span>
          </button>
          <LanguageSwitcher isExpanded={true} forceDark={true} />
        </div>
      </header>

      {/* Flickering Grid Pattern */}
      <div className="absolute top-0 left-0 z-0 w-full h-[200px] [mask-image:linear-gradient(to_top,transparent_25%,black_95%)]">
        <FlickeringGrid
          className="absolute top-0 left-0 size-full"
          squareSize={4}
          gridGap={6}
          color="#6B7280"
          maxOpacity={0.2}
          flickerChance={0.05}
        />
      </div>

      <div className="relative z-10 py-12 px-6 pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4 border-b border-transparent pb-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3 gap-y-5 text-sm text-white/60">
                <button
                  onClick={() => navigate("/blog")}
                  className="h-8 w-8 flex items-center justify-center border border-transparent rounded-xl backdrop-blur-sm bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-white/60 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="sr-only">{t("blogPost.backToAll")}</span>
                </button>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {post.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="h-6 w-fit px-3 text-sm font-medium backdrop-blur-sm bg-white/5 text-white/60 rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <time className="font-medium text-white/60">
                  {formattedDate}
                </time>
                {post.readTime && (
                  <span className="font-medium text-white/60">
                    {post.readTime}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-white">
                {post.title}
              </h1>

              {post.description && (
                <p className="text-white/60 max-w-4xl md:text-lg">
                  {post.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex divide-x divide-transparent relative mt-8">
            <div className="absolute max-w-7xl mx-auto left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] lg:w-full h-full border-x border-transparent p-0 pointer-events-none" />
            <main className="w-full p-0 overflow-hidden">
              {post.thumbnail && (
                <div className="relative w-full h-[500px] overflow-hidden object-cover rounded-2xl mb-6">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              )}
              <div className="p-6 lg:p-10 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                {markdownError ? (
                  <div className="text-red-400 mb-4 p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                    <p className="font-semibold">
                      {t("blogPost.errorRendering")}
                    </p>
                    <p className="text-sm mt-2">{markdownError}</p>
                  </div>
                ) : null}
                {post.content ? (
                  <div className="markdown-content text-white/80">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[]}
                      components={{
                        h1: (props: any) => (
                          <h1
                            {...props}
                            className="text-4xl font-semibold mb-6 mt-8 text-white first:mt-0"
                          />
                        ),
                        h2: (props: any) => (
                          <h2
                            {...props}
                            className="text-3xl font-semibold mb-4 mt-8 text-white first:mt-0"
                          />
                        ),
                        h3: (props: any) => (
                          <h3
                            {...props}
                            className="text-2xl font-semibold mb-3 mt-6 text-white first:mt-0"
                          />
                        ),
                        h4: (props: any) => (
                          <h4
                            {...props}
                            className="text-xl font-semibold mb-2 mt-4 text-white first:mt-0"
                          />
                        ),
                        p: (props: any) => (
                          <p
                            {...props}
                            className="mb-4 text-white/80 leading-relaxed"
                          />
                        ),
                        ul: (props: any) => (
                          <ul
                            {...props}
                            className="list-disc list-inside mb-4 space-y-2 text-white/80 ml-4"
                          />
                        ),
                        ol: (props: any) => (
                          <ol
                            {...props}
                            className="list-decimal list-inside mb-4 space-y-2 text-white/80 ml-4"
                          />
                        ),
                        li: (props: any) => (
                          <li {...props} className="mb-1 text-white/80" />
                        ),
                        strong: (props: any) => (
                          <strong
                            {...props}
                            className="font-semibold text-white"
                          />
                        ),
                        em: (props: any) => (
                          <em {...props} className="italic text-white/90" />
                        ),
                        a: (props: any) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline decoration-dotted"
                          />
                        ),
                        img: (props: any) => (
                          <img
                            {...props}
                            className="rounded-xl shadow-lg my-4 max-w-full"
                          />
                        ),
                        hr: (props: any) => (
                          <hr {...props} className="my-8 border-white/20" />
                        ),
                        blockquote: (props: any) => (
                          <blockquote
                            {...props}
                            className="border-l-4 border-white/30 pl-4 my-4 italic text-white/70"
                          />
                        ),
                        code: (props: any) => {
                          if (props.inline) {
                            return (
                              <code
                                {...props}
                                className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-white/90"
                              />
                            );
                          }
                          return (
                            <code
                              {...props}
                              className="block bg-white/10 p-4 rounded-lg text-sm font-mono text-white/90 overflow-x-auto my-4"
                            />
                          );
                        },
                        table: (props: any) => (
                          <div className="overflow-x-auto my-4">
                            <table
                              {...props}
                              className="min-w-full border-collapse border border-white/20"
                            />
                          </div>
                        ),
                        pre: (props: any) => (
                          <pre
                            {...props}
                            className="bg-white/10 p-4 rounded-lg text-sm font-mono text-white/90 overflow-x-auto my-4"
                          />
                        ),
                        thead: (props: any) => (
                          <thead {...props} className="bg-white/10" />
                        ),
                        tbody: (props: any) => <tbody {...props} />,
                        tr: (props: any) => (
                          <tr {...props} className="border-b border-white/10" />
                        ),
                        th: (props: any) => (
                          <th
                            {...props}
                            className="border border-white/20 px-4 py-2 text-left font-semibold text-white"
                          />
                        ),
                        td: (props: any) => (
                          <td
                            {...props}
                            className="border border-white/20 px-4 py-2 text-white/80"
                          />
                        ),
                      }}
                    >
                      {post.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-white/80">
                    <p>
                      This is a placeholder for the blog post content. In a
                      production environment, you would load the full MDX
                      content here.
                    </p>
                    <p>To implement full MDX support, you would need to:</p>
                    <ul className="list-disc list-inside ml-4 space-y-2">
                      <li>Set up an MDX loader (e.g., @mdx-js/loader)</li>
                      <li>Configure Vite to process MDX files</li>
                      <li>Import and render the MDX content dynamically</li>
                    </ul>
                  </div>
                )}
              </div>

              {relatedPosts.length > 0 && (
                <div className="mt-10 p-6 lg:p-10 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                  <h2 className="text-2xl font-semibold mb-6 text-white">
                    {t("blogPost.related")}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedPosts.map((relatedPost) => {
                      const relatedDate = formatDate(
                        relatedPost.date,
                        language,
                      );
                      return (
                        <BlogCard
                          key={relatedPost.slug}
                          url={`/blog/${relatedPost.slug}`}
                          title={relatedPost.title}
                          description={relatedPost.description}
                          date={relatedDate}
                          thumbnail={relatedPost.thumbnail}
                          showRightBorder={false}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
