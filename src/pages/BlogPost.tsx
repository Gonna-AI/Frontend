import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getBlogPost, getAllBlogPosts } from '../data/blogPosts';
import { BlogCard } from '../components/Blog/BlogCard';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { PageHero, Footer } from '../components/Landing/AgeroChrome';
import SEO from '../components/SEO';
import './LandingFramer.css';

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
    <div className="agero-works min-h-screen relative overflow-x-hidden">
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

      <PageHero
        eyebrow="ClerkTree Journal"
        title={post.title}
        description={post.description}
        titleId="blog-post-title"
      >
        <div className="agero-page-hero-meta">
          <a href="/blog" onClick={(event) => { event.preventDefault(); navigate('/blog'); }}>
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {t('blogPost.backToAll')}
          </a>
          {post.tags?.map((tag: string) => (
            <span key={tag}>{tag}</span>
          ))}
          <time>{formattedDate}</time>
          {post.readTime && <span>{post.readTime}</span>}
        </div>
      </PageHero>

      <div className="relative z-10 py-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex divide-x divide-transparent relative">
            <div className="absolute max-w-7xl mx-auto left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] lg:w-full h-full border-x border-transparent p-0 pointer-events-none" />
            <main className="w-full p-0 overflow-hidden">
              {post.thumbnail && (
                <div className="ct-card relative w-full h-[240px] sm:h-[360px] lg:h-[500px] overflow-hidden mb-6">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="ct-card p-5 sm:p-6 lg:p-10">
                {markdownError ? (
                  <div className="text-red-600 mb-4 p-4 bg-red-500/5 rounded-lg border border-red-500/30">
                    <p className="font-semibold">{t('blogPost.errorRendering')}</p>
                    <p className="text-sm mt-2">{markdownError}</p>
                  </div>
                ) : null}
                {post.content ? (
                  <div className="markdown-content text-[rgba(19,19,19,0.8)]">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[]}
                      components={{
                        h1: (props: any) => (
                          <h1 {...props} className="text-4xl font-semibold mb-6 mt-8 text-[rgb(19,19,19)] first:mt-0" />
                        ),
                        h2: (props: any) => (
                          <h2 {...props} className="text-3xl font-semibold mb-4 mt-8 text-[rgb(19,19,19)] first:mt-0" />
                        ),
                        h3: (props: any) => (
                          <h3 {...props} className="text-2xl font-semibold mb-3 mt-6 text-[rgb(19,19,19)] first:mt-0" />
                        ),
                        h4: (props: any) => (
                          <h4 {...props} className="text-xl font-semibold mb-2 mt-4 text-[rgb(19,19,19)] first:mt-0" />
                        ),
                        p: (props: any) => (
                          <p {...props} className="mb-4 text-[rgba(19,19,19,0.8)] leading-relaxed" />
                        ),
                        ul: (props: any) => (
                          <ul {...props} className="list-disc list-inside mb-4 space-y-2 text-[rgba(19,19,19,0.8)] ml-4" />
                        ),
                        ol: (props: any) => (
                          <ol {...props} className="list-decimal list-inside mb-4 space-y-2 text-[rgba(19,19,19,0.8)] ml-4" />
                        ),
                        li: (props: any) => (
                          <li {...props} className="mb-1 text-[rgba(19,19,19,0.8)]" />
                        ),
                        strong: (props: any) => (
                          <strong {...props} className="font-semibold text-[rgb(19,19,19)]" />
                        ),
                        em: (props: any) => (
                          <em {...props} className="italic text-[rgba(19,19,19,0.9)]" />
                        ),
                        a: (props: any) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" className="text-[#FF4D00] hover:text-[#D14000] underline decoration-dotted" />
                        ),
                        img: (props: any) => (
                          <img {...props} className="rounded-xl shadow-lg my-4 max-w-full" />
                        ),
                        hr: (props: any) => (
                          <hr {...props} className="my-8 border-[rgba(19,19,19,0.15)]" />
                        ),
                        blockquote: (props: any) => (
                          <blockquote {...props} className="border-l-4 border-[rgba(19,19,19,0.2)] pl-4 my-4 italic text-[rgba(19,19,19,0.7)]" />
                        ),
                        code: (props: any) => {
                          if (props.inline) {
                            return (
                              <code {...props} className="bg-[rgba(19,19,19,0.06)] px-1.5 py-0.5 rounded text-sm font-mono text-[rgba(19,19,19,0.85)]" />
                            );
                          }
                          return (
                            <code {...props} className="block bg-[rgba(19,19,19,0.06)] p-4 rounded-lg text-sm font-mono text-[rgba(19,19,19,0.85)] overflow-x-auto my-4" />
                          );
                        },
                        table: (props: any) => (
                          <div className="overflow-x-auto my-4">
                            <table {...props} className="min-w-full border-collapse border border-[rgba(19,19,19,0.15)]" />
                          </div>
                        ),
                        pre: (props: any) => (
                          <pre {...props} className="bg-[rgba(19,19,19,0.06)] p-4 rounded-lg text-sm font-mono text-[rgba(19,19,19,0.85)] overflow-x-auto my-4" />
                        ),
                        thead: (props: any) => (
                          <thead {...props} className="bg-[rgba(19,19,19,0.06)]" />
                        ),
                        tbody: (props: any) => (
                          <tbody {...props} />
                        ),
                        tr: (props: any) => (
                          <tr {...props} className="border-b border-[rgba(19,19,19,0.08)]" />
                        ),
                        th: (props: any) => (
                          <th {...props} className="border border-[rgba(19,19,19,0.15)] px-4 py-2 text-left font-semibold text-[rgb(19,19,19)]" />
                        ),
                        td: (props: any) => (
                          <td {...props} className="border border-[rgba(19,19,19,0.15)] px-4 py-2 text-[rgba(19,19,19,0.8)]" />
                        ),
                      }}
                    >
                      {post.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-[rgba(19,19,19,0.8)]">
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
                <div className="mt-10 p-6 lg:p-10 rounded-2xl bg-white border border-[rgba(19,19,19,0.08)] shadow-[0_24px_70px_rgba(0,0,0,0.06)] transition-all duration-300">
                  <h2 className="text-2xl font-semibold mb-6 text-[rgb(19,19,19)]">{t('blogPost.related')}</h2>
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
