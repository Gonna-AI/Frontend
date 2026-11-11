// Shared journal pieces: date format, typographic cover, post card.
import { getPostAuthors, type BlogPost } from '../../data/blogPosts';

export const formatPostDate = (date: string, language: string) =>
  new Date(date).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

/** Typographic cover on grainy silver or black light; no stock imagery. */
function JournalCover({ post, large = false }: { post: BlogPost; large?: boolean }) {
  return (
    <div className={`jr-cover is-${post.tone ?? 'silver'}${large ? ' is-large' : ''}`} aria-hidden="true">
      <span className="jr-cover-top">
        <span className="jr-pill">{post.category ?? post.tags?.[0] ?? 'Journal'}</span>
      </span>
      <span className="jr-cover-title">{post.title.split(':')[0]}</span>
    </div>
  );
}

export function PostCard({ post, language }: { post: BlogPost; language: string }) {
  const authors = getPostAuthors(post);
  return (
    <a className="jr-card" href={`/blog/${post.slug}`}>
      <JournalCover post={post} />
      <div className="jr-card-body">
        <span className="jr-meta">{formatPostDate(post.date, language)}{post.readTime ? ` · ${post.readTime}` : ''}</span>
        <h3>{post.title}</h3>
        <p>{post.description}</p>
        {authors.length > 0 && (
          <span className="jr-byline-mini">
            <span className="jr-avatars">
              {authors.map((a) => <img alt="" key={a.id} src={a.image} style={{ objectPosition: a.objectPosition }} loading="lazy" decoding="async" />)}
            </span>
            <span className="jr-byline-names">
              <strong>{authors.map((a) => a.name).join(', ')}</strong>
              <small>{authors.length === 1 ? authors[0].role : `${authors.length} authors`}</small>
            </span>
          </span>
        )}
      </div>
    </a>
  );
}

