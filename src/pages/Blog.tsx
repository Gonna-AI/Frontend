import { useSearchParams } from 'react-router-dom';
import { Suspense } from 'react';
import { BlogCard } from '../components/Blog/BlogCard';
import { TagFilter } from '../components/Blog/TagFilter';
import { getAllBlogPosts, getBlogPostsByTag, getAllTags } from '../data/blogPosts';
import { useLanguage } from '../contexts/LanguageContext';
import { Header, Footer } from '../components/Landing/AgeroChrome';
import SEO from '../components/SEO';
import { shouldAutoplayMedia } from '../utils/idle';
import './LandingFramer.css';
import './BlogTheme.css';

const BLOG_HERO_VIDEO_SRC = 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/blogvideo.mp4';

const formatDate = (date: string, language: string): string => {
  return new Date(date).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function BlogContent() {
  const [searchParams] = useSearchParams();

  const selectedTag = searchParams.get("tag") || "All";
  const { t, language } = useLanguage();
  const shouldPlayVideo = shouldAutoplayMedia();

  const allBlogs = getAllBlogPosts();
  const filteredBlogs = getBlogPostsByTag(selectedTag);
  const allTags = ["All", ...getAllTags()];

  const tagCounts = allTags.reduce((acc, tag) => {
    if (tag === "All") {
      acc[tag] = allBlogs.length;
    } else {
      acc[tag] = allBlogs.filter((blog) =>
        blog.tags?.includes(tag)
      ).length;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="agero-works clerktree-blog-page">
      <SEO
        title="Blog"
        description="Latest insights on legal AI, claims automation, and the future of work. Stay updated with ClerkTree."
        canonical="https://clerktree.com/blog"
        preloadVideos={[{ href: BLOG_HERO_VIDEO_SRC }]}
      />
      <div className="agero-top-area agero-top-area-with-hero">
        <Header />

        <section className="agero-hero-stage clerktree-blog-hero-stage">
          <video
            className="agero-hero-stage-media clerktree-blog-hero-video"
            src={BLOG_HERO_VIDEO_SRC}
            autoPlay={shouldPlayVideo}
            loop
            muted
            playsInline
            preload={shouldPlayVideo ? 'auto' : 'metadata'}
            crossOrigin="anonymous"
            aria-label="ClerkTree blog video"
          />
          <div className="agero-hero-stage-scrim" aria-hidden="true" />
          <div className="agero-hero-stage-content clerktree-blog-hero-copy">
            <p>ClerkTree Journal</p>
            <h1>
                {t('blogPage.title')}
            </h1>
            <span>
                {t('blogPage.subtitle')}
            </span>
          </div>
        </section>
      </div>

      <main className="clerktree-blog-main">
        {allTags.length > 0 && (
          <section className="clerktree-blog-filters-wrap">
            <div className="clerktree-blog-filters">
              <TagFilter
                tags={allTags}
                selectedTag={selectedTag}
                tagCounts={tagCounts}
              />
            </div>
          </section>
        )}

        <section className="clerktree-blog-grid-wrap">
          <Suspense fallback={<div className="text-white px-6">{t('blogPage.loadingArticles')}</div>}>
            <div
              className="clerktree-blog-grid"
            >
              {filteredBlogs.map((blog) => {
                const formattedDate = formatDate(blog.date, language);

                return (
                  <div
                    key={blog.slug}
                    className="clerktree-blog-card-shell"
                  >
                    <BlogCard
                      url={`/blog/${blog.slug}`}
                      title={blog.title}
                      description={blog.description}
                      date={formattedDate}
                      thumbnail={blog.thumbnail}
                      showRightBorder={filteredBlogs.length < 3}
                    />
                  </div>
                );
              })}
            </div>
          </Suspense>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function Blog() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogContent />
    </Suspense>
  );
}
