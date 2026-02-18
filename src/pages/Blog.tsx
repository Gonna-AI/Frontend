import { useSearchParams, useNavigate } from 'react-router-dom';
import { Suspense } from 'react';
import { BlogCard } from '../components/Blog/BlogCard';
import { TagFilter } from '../components/Blog/TagFilter';
import { FlickeringGrid } from '../components/Blog/FlickeringGrid';
import { getAllBlogPosts, getBlogPostsByTag, getAllTags } from '../data/blogPosts';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/Layout/LanguageSwitcher';
import Footer from '../components/Landing/Footer';
import SEO from '../components/SEO';

const formatDate = (date: string, language: string): string => {
  return new Date(date).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function BlogContent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedTag = searchParams.get("tag") || "All";
  const { t, language } = useLanguage();

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
    <div className="bg-[rgb(10,10,10)] min-h-screen relative overflow-x-hidden">
      <SEO
        title="Blog"
        description="Latest insights on legal AI, claims automation, and the future of work. Stay updated with ClerkTree."
        canonical="https://clerktree.com/blog"
      />
      {/* Blue theme background accents */}
      <div className="fixed inset-0 bg-[rgb(10,10,10)] -z-10">
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

      {/* Glassy Header with Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full py-3 px-4 sm:px-6 backdrop-blur-md bg-[rgb(10,10,10)]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group"
            aria-label="Go to home"
          >
            <svg viewBox="0 0 464 468" className="w-9 h-9 md:w-11 md:h-11">
              <path fill="white" d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z" />
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
      </div >

      <div className="relative z-10 py-12 px-6 pt-24">
        <div className="max-w-7xl mx-auto w-full">
          <div className="p-6 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 flex flex-col gap-6 min-h-[250px] justify-center">
            <div className="flex flex-col gap-2">
              <h1 className="font-medium text-4xl md:text-5xl tracking-tighter text-white">
                {t('blogPage.title')}
              </h1>
              <p className="text-white/60 text-sm md:text-base lg:text-lg">
                {t('blogPage.subtitle')}
              </p>
            </div>
            {allTags.length > 0 && (
              <div className="mt-4">
                <TagFilter
                  tags={allTags}
                  selectedTag={selectedTag}
                  tagCounts={tagCounts}
                />
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full mt-8">
          <Suspense fallback={<div className="text-white px-6">{t('blogPage.loadingArticles')}</div>}>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative auto-rows-fr px-6 lg:px-0"
            >
              {filteredBlogs.map((blog) => {
                const formattedDate = formatDate(blog.date, language);

                return (
                  <div
                    key={blog.slug}
                    className="w-[calc(100%+3rem)] -mx-6 md:w-auto md:mx-0 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 md:bg-transparent md:border-transparent md:backdrop-blur-none md:rounded-none md:hover:bg-transparent md:hover:border-transparent"
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
        </div>
      </div>
      <Footer />
    </div >
  );
}

export default function Blog() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogContent />
    </Suspense>
  );
}

