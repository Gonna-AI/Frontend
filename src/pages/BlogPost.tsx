import { Children, isValidElement, type ReactNode, useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Linkedin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getAllBlogPosts, getBlogPost, getPostAuthors, postContentUrl } from '../data/blogPosts';
import { PostCard, formatPostDate } from '../components/Blog/Journal';
import { useLanguage } from '../contexts/LanguageContext';
import { Header, Footer } from '../components/Landing/SiteChrome';
import Grainient from '../components/Brand/Grainient';
import SEO from '../components/SEO';
import './LandingFramer.css';
import './Journal.css';

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 64);

function textOf(node: ReactNode): string {
  return Children.toArray(node).map((child) => {
    if (typeof child === 'string' || typeof child === 'number') return String(child);
    if (isValidElement<{ children?: ReactNode }>(child)) return textOf(child.props.children);
    return '';
  }).join('');
}

/** Highlights the section currently in view. */
function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? '');
  useEffect(() => {
    if (!ids.length) return undefined;
    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '0px 0px -70% 0px' });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const de = language === 'de';
  const post = slug ? getBlogPost(slug) : undefined;
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    if (!post) return undefined;
    let alive = true;
    setContent(null);
    fetch(postContentUrl(post.slug))
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((text) => { if (alive) setContent(text.startsWith('<!') ? '' : text); })
      .catch(() => { if (alive) setContent(''); });
    return () => { alive = false; };
  }, [post]);

  const headings = useMemo(() => {
    const found = [...(content ?? '').matchAll(/^## (.+)$/gm)].map((m) => m[1].replace(/[*_`]/g, '').trim());
    return found.map((text) => ({ text, id: slugify(text) }));
  }, [content]);
  const active = useActiveHeading(useMemo(() => headings.map((h) => h.id), [headings]));

  if (!post) return <Navigate to="/blog" replace />;

  const authors = getPostAuthors(post);
  const related = getAllBlogPosts().filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="ct-works jr-page">
      <SEO
        title={post.title}
        description={post.description}
        canonical={`https://clerktree.com/blog/${post.slug}`}
        openGraph={{ type: 'article' }}
      />
      <div className="ct-top-area jr-top">
        <Header />
        <section className={`jr-post-hero is-${post.tone ?? 'silver'}`} aria-labelledby="jr-post-title">
          <Grainient preset="silver" />
          <div className="jr-post-hero-copy">
            <a className="jr-back" href="/blog"><ArrowLeft size={14} aria-hidden="true" />{de ? 'Alle Beiträge' : 'All posts'}</a>
            <span className="jr-pill">{post.category ?? post.tags?.[0] ?? 'Journal'}</span>
            <h1 id="jr-post-title">{post.title}</h1>
            <p className="jr-lede">{post.description}</p>
            <div className="jr-byline">
              <span className="jr-avatars is-large">
                {authors.map((a) => <img alt="" key={a.id} src={a.image} style={{ objectPosition: a.objectPosition }} />)}
              </span>
              <span className="jr-byline-names">
                <strong>{authors.map((a) => a.name).join(', ')}</strong>
                <small>{authors.map((a) => a.role).join(' · ')}</small>
              </span>
              <span className="jr-byline-meta">{formatPostDate(post.date, language)}{post.readTime ? ` · ${post.readTime}` : ''}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="jr-article-wrap">
        <aside className="jr-toc" aria-label={de ? 'Auf dieser Seite' : 'On this page'}>
          {headings.length > 0 && (
            <>
              <span className="jr-toc-label">{de ? 'Auf dieser Seite' : 'On this page'}</span>
              <ol>
                {headings.map((h) => (
                  <li key={h.id}><a className={h.id === active ? 'is-active' : undefined} href={`#${h.id}`}>{h.text}</a></li>
                ))}
              </ol>
            </>
          )}
        </aside>

        <article className="jr-article" lang="en">
          {post.tags && <div className="jr-tags">{post.tags.map((tag) => <a href={`/blog?tag=${encodeURIComponent(tag)}`} key={tag}>{tag}</a>)}</div>}

          <div className="jr-prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => <h2 id={slugify(textOf(children))}>{children}</h2>,
                a: ({ children, href }) => <a href={href} rel="noopener noreferrer" target={href?.startsWith('http') ? '_blank' : undefined}>{children}</a>,
                table: ({ children }) => <div className="jr-table"><table>{children}</table></div>,
              }}
            >
              {content ?? ''}
            </ReactMarkdown>
            {content === null && <div className="jr-loading" aria-hidden="true"><i /><i /><i /><i /></div>}
          </div>

          {authors.length > 0 && (
            <section className="jr-authors" aria-label={de ? 'Autoren' : 'Authors'}>
              <span className="jr-toc-label">{de ? 'Geschrieben von' : 'Written by'}</span>
              {authors.map((a) => (
                <div className="jr-author" key={a.id}>
                  <img alt={a.name} src={a.image} style={{ objectPosition: a.objectPosition }} loading="lazy" />
                  <div>
                    <strong>{a.name}</strong>
                    <small>{a.role}, ClerkTree</small>
                    <p>{a.bio}</p>
                  </div>
                  {a.linkedin && <a aria-label={`${a.name} on LinkedIn`} className="jr-author-link" href={a.linkedin} rel="noopener noreferrer" target="_blank"><Linkedin size={15} /></a>}
                </div>
              ))}
            </section>
          )}
        </article>
      </div>

      {related.length > 0 && (
        <section className="jr-related" aria-label={de ? 'Weitere Beiträge' : 'More from the journal'}>
          <h2>{de ? 'Weitere Beiträge' : 'More from the journal'}</h2>
          <div className="jr-grid">{related.map((p) => <PostCard key={p.slug} language={language} post={p} />)}</div>
        </section>
      )}
      <Footer />
    </div>
  );
}
