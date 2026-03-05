import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getBlogPost, getAllBlogPosts } from '../data/blogPosts';
import { FlickeringGrid } from '../components/Blog/FlickeringGrid';
import { BlogCard } from '../components/Blog/BlogCard';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SharedHeader from '../components/Layout/SharedHeader';
import Footer from '../components/Landing/Footer';
import SEO from '../components/SEO';

const formatDate = (date: string, language: string): string => {
  return new Date(date).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [markdownError] = useState<string | null>(null);
  const { t, language } = useLanguage();

  if (!slug) {
    navigate('/blog');
    return null;
  }

  const post = getBlogPost(slug);

  if (!post) {
    navigate('/blog');
    return null;
  }

  const formattedDate = formatDate(post.date, language);

  // Get related posts (excluding current post)
  const relatedPosts = getAllBlogPosts()
    .filter(p => p.slug !== slug && p.tags?.some(tag => post.tags?.includes(tag)))
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
            type: 'article',
            image: post.thumbnail
          }}
          structuredData={{
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "image": post.thumbnail ? [post.thumbnail] : [],
            "datePublished": post.date,
            "author": [{
              "@type": "Person",
              "name": post.author || "ClerkTree Team",
              "url": "https://clerktree.com/about"
            }]
          }}
        />
        <div
          className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 md:w-[800px] h-96 md:h-[800px] opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, rgba(59,130,246,0.25) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-72 md:w-[600px] h-72 md:h-[600px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(29,78,216,0.5) 0%, rgba(29,78,216,0.2) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <SharedHeader />

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
                  onClick={() => navigate('/blog')}
                  className="h-8 w-8 flex items-center justify-center border border-transparent rounded-xl backdrop-blur-sm bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-white/60 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="sr-only">{t('blogPost.backToAll')}</span>
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
                    <p className="font-semibold">{t('blogPost.errorRendering')}</p>
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
                          <h1 {...props} className="text-4xl font-semibold mb-6 mt-8 text-white first:mt-0" />
                        ),
                        h2: (props: any) => (
                          <h2 {...props} className="text-3xl font-semibold mb-4 mt-8 text-white first:mt-0" />
                        ),
                        h3: (props: any) => (
                          <h3 {...props} className="text-2xl font-semibold mb-3 mt-6 text-white first:mt-0" />
                        ),
                        h4: (props: any) => (
                          <h4 {...props} className="text-xl font-semibold mb-2 mt-4 text-white first:mt-0" />
                        ),
                        p: (props: any) => (
                          <p {...props} className="mb-4 text-white/80 leading-relaxed" />
                        ),
                        ul: (props: any) => (
                          <ul {...props} className="list-disc list-inside mb-4 space-y-2 text-white/80 ml-4" />
                        ),
                        ol: (props: any) => (
                          <ol {...props} className="list-decimal list-inside mb-4 space-y-2 text-white/80 ml-4" />
                        ),
                        li: (props: any) => (
                          <li {...props} className="mb-1 text-white/80" />
                        ),
                        strong: (props: any) => (
                          <strong {...props} className="font-semibold text-white" />
                        ),
                        em: (props: any) => (
                          <em {...props} className="italic text-white/90" />
                        ),
                        a: (props: any) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline decoration-dotted" />
                        ),
                        img: (props: any) => (
                          <img {...props} className="rounded-xl shadow-lg my-4 max-w-full" />
                        ),
                        hr: (props: any) => (
                          <hr {...props} className="my-8 border-white/20" />
                        ),
                        blockquote: (props: any) => (
                          <blockquote {...props} className="border-l-4 border-white/30 pl-4 my-4 italic text-white/70" />
                        ),
                        code: (props: any) => {
                          if (props.inline) {
                            return (
                              <code {...props} className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-white/90" />
                            );
                          }
                          return (
                            <code {...props} className="block bg-white/10 p-4 rounded-lg text-sm font-mono text-white/90 overflow-x-auto my-4" />
                          );
                        },
                        table: (props: any) => (
                          <div className="overflow-x-auto my-4">
                            <table {...props} className="min-w-full border-collapse border border-white/20" />
                          </div>
                        ),
                        pre: (props: any) => (
                          <pre {...props} className="bg-white/10 p-4 rounded-lg text-sm font-mono text-white/90 overflow-x-auto my-4" />
                        ),
                        thead: (props: any) => (
                          <thead {...props} className="bg-white/10" />
                        ),
                        tbody: (props: any) => (
                          <tbody {...props} />
                        ),
                        tr: (props: any) => (
                          <tr {...props} className="border-b border-white/10" />
                        ),
                        th: (props: any) => (
                          <th {...props} className="border border-white/20 px-4 py-2 text-left font-semibold text-white" />
                        ),
                        td: (props: any) => (
                          <td {...props} className="border border-white/20 px-4 py-2 text-white/80" />
                        ),
                      }}
                    >
                      {post.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-white/80">
                    <p>This is a placeholder for the blog post content. In a production environment, you would load the full MDX content here.</p>
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
                  <h2 className="text-2xl font-semibold mb-6 text-white">{t('blogPost.related')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedPosts.map((relatedPost) => {
                      const relatedDate = formatDate(relatedPost.date, language);
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
