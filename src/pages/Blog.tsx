import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getAllBlogPosts, getAllTags, getPostAuthors } from '../data/blogPosts';
import { PostCard } from '../components/Blog/Journal';
import { useLanguage } from '../contexts/LanguageContext';
import { Header, Footer } from '../components/Landing/SiteChrome';
import Grainient from '../components/Brand/Grainient';
import SEO from '../components/SEO';
import './LandingFramer.css';
import './Journal.css';

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();
  const de = language === 'de';
  const [query, setQuery] = useState('');
  const selectedTag = searchParams.get('tag') || 'All';
  const posts = getAllBlogPosts();
  const tags = ['All', ...getAllTags()];
  const count = (tag: string) => (tag === 'All' ? posts.length : posts.filter((p) => p.tags?.includes(tag)).length);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (selectedTag !== 'All' && !p.tags?.includes(selectedTag)) return false;
      if (!q) return true;
      const authors = getPostAuthors(p).map((a) => a.name).join(' ');
      return `${p.title} ${p.description} ${p.tags?.join(' ')} ${authors}`.toLowerCase().includes(q);
    });
  }, [posts, query, selectedTag]);

  const pickTag = (tag: string) => {
    const next = new URLSearchParams(searchParams);
    if (tag === 'All') next.delete('tag'); else next.set('tag', tag);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="ct-works jr-page">
      <SEO
        title="ClerkTree Journal: field notes on industrial AI"
        description="Field notes from ClerkTree on industrial AI, predictive maintenance and agents for machine operations."
        canonical="https://clerktree.com/blog"
      />
      <div className="ct-top-area jr-top">
        <Header />
        <section className="jr-hero" aria-labelledby="jr-title">
          <Grainient preset="silver" />
          <div className="jr-hero-copy">
            <h1 id="jr-title">{de ? 'Das ClerkTree Journal' : 'The ClerkTree journal'}</h1>
            <p>{de
              ? 'Notizen aus der Praxis zu industrieller KI, vorausschauender Wartung und Agenten für den Maschinenbetrieb.'
              : 'Field notes on industrial AI, predictive maintenance and the agents that run machine operations.'}</p>
            <label className="jr-search">
              <Search size={16} aria-hidden="true" />
              <input
                aria-label={de ? 'Beiträge durchsuchen' : 'Search posts'}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={de ? 'Beiträge durchsuchen…' : 'Search posts…'}
                type="search"
                value={query}
              />
            </label>
          </div>
        </section>
      </div>

      <main className="jr-main">
        <div className="jr-filters">
          <div className="jr-chips" role="tablist" aria-label={de ? 'Themen' : 'Topics'}>
            {tags.map((tag) => (
              <button aria-selected={tag === selectedTag} className={tag === selectedTag ? 'is-active' : undefined} key={tag} onClick={() => pickTag(tag)} role="tab" type="button">
                {tag === 'All' ? (de ? 'Alle' : 'All') : tag}<span>{count(tag)}</span>
              </button>
            ))}
          </div>
          <span className="jr-count">{visible.length} {de ? (visible.length === 1 ? 'Beitrag' : 'Beiträge') : visible.length === 1 ? 'post' : 'posts'}</span>
        </div>

        {de && <p className="jr-note">Die Beiträge erscheinen auf Englisch.</p>}

        {visible.length ? (
          <div className="jr-grid" lang="en">
            {visible.map((post) => <PostCard key={post.slug} language={language} post={post} />)}
          </div>
        ) : (
          <p className="jr-empty">{de ? 'Keine Beiträge gefunden.' : 'No posts match that search.'}</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
