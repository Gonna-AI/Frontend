import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface TagFilterProps {
  tags: string[];
  selectedTag: string;
  tagCounts?: Record<string, number>;
}

export function TagFilter({ tags, selectedTag, tagCounts }: TagFilterProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(location.search);
    if (tag !== "All") {
      params.set("tag", tag);
    } else {
      params.delete("tag");
    }
    navigate(`${location.pathname}?${params.toString()}`);
    setIsMobileOpen(false);
  };

  const DesktopTagFilter = () => (
    <div className="clerktree-tag-filter hidden md:flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => handleTagClick(tag)}
          className={`clerktree-tag-button h-8 flex items-center px-1 pl-3 rounded-xl cursor-pointer border text-sm transition-all duration-300 ${selectedTag === tag
            ? "is-active"
            : ""
            }`}
        >
          <span>{tag === 'All' ? t('blog.all') : tag}</span>
          {tagCounts?.[tag] && (
            <span
              className={`clerktree-tag-count ml-2 text-xs border rounded-lg h-6 min-w-6 font-medium flex items-center justify-center transition-all duration-300 ${selectedTag === tag
                ? "is-active"
                : ""
                }`}
            >
              {tagCounts[tag]}
            </span>
          )}
        </button>
      ))}
    </div>
  );

  const MobileTagFilter = () => (
    <div className="md:hidden relative">
      <button
        type="button"
        onClick={() => setIsMobileOpen((open) => !open)}
        className="clerktree-tag-mobile-trigger w-full flex items-center justify-between px-4 py-2 border rounded-xl transition-all duration-300"
      >
        <span className="capitalize text-sm font-medium">{selectedTag === 'All' ? t('blog.all') : selectedTag}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isMobileOpen ? 'rotate-180' : ''}`} />
      </button>

      {isMobileOpen && (
        <div className="clerktree-tag-mobile-panel absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border p-4 shadow-2xl">
          <h3 className="mb-3 font-semibold text-sm">{t('blog.selectCategory')}</h3>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="w-full flex items-center justify-between rounded-lg px-2 py-2 font-medium cursor-pointer text-sm transition-colors hover:bg-white/5"
              >
                <span
                  className={`w-full flex items-center justify-between font-medium cursor-pointer text-sm transition-colors ${selectedTag === tag
                    ? "text-[#ff4d00] underline underline-offset-4"
                    : ""
                    }`}
                >
                  {tag === 'All' ? t('blog.all') : tag}
                </span>
                {tagCounts?.[tag] && (
                  <span className={`clerktree-tag-count flex-shrink-0 ml-2 border rounded-lg h-6 min-w-6 flex items-center justify-center transition-all duration-300 ${selectedTag === tag
                    ? "is-active"
                    : ""
                    }`}>
                    {tagCounts[tag]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <DesktopTagFilter />
      <MobileTagFilter />
    </>
  );
}
