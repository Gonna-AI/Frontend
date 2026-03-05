import { useSearchParams } from 'react-router-dom';
import { Suspense } from 'react';
import { BlogCard } from '../components/Blog/BlogCard';
import { TagFilter } from '../components/Blog/TagFilter';
import { FlickeringGrid } from '../components/Blog/FlickeringGrid';
import { getAllBlogPosts, getBlogPostsByTag, getAllTags } from '../data/blogPosts';
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

function BlogContent() {
  const [searchParams] = useSearchParams();

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

