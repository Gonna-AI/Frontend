import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from '../ui/drawer';

interface TagFilterProps {
  tags: string[];
  selectedTag: string;
  tagCounts?: Record<string, number>;
}

export function TagFilter({ tags, selectedTag, tagCounts }: TagFilterProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(location.search);
    if (tag !== "All") {
      params.set("tag", tag);
    } else {
      params.delete("tag");
    }
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const DesktopTagFilter = () => (
    <div className="hidden md:flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => handleTagClick(tag)}
          className={`h-8 flex items-center px-1 pl-3 rounded-xl cursor-pointer border text-sm transition-all duration-300 backdrop-blur-sm ${
            selectedTag === tag
              ? "border-purple-500/30 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-600/20 text-white hover:from-purple-500/30 hover:via-pink-500/30 hover:to-purple-600/30 hover:border-purple-500/50"
              : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/60 hover:text-white"
          }`}
        >
          <span>{tag}</span>
          {tagCounts?.[tag] && (
            <span
              className={`ml-2 text-xs border rounded-lg h-6 min-w-6 font-medium flex items-center justify-center backdrop-blur-sm transition-all duration-300 ${
                selectedTag === tag
                  ? "border-purple-500/40 bg-purple-500/10 text-white"
                  : "border-white/10 bg-white/5 text-white/60"
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
    <Drawer>
      <DrawerTrigger className="md:hidden w-full flex items-center justify-between px-4 py-2 border border-white/10 rounded-xl backdrop-blur-sm bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-white/60">
        <span className="capitalize text-sm font-medium">{selectedTag}</span>
        <ChevronDown className="h-4 w-4" />
      </DrawerTrigger>

      <DrawerContent className="md:hidden bg-[rgb(10,10,10)]/95 backdrop-blur-md border-transparent rounded-t-2xl">
        <DrawerHeader>
          <h3 className="font-semibold text-sm text-white">Select Category</h3>
        </DrawerHeader>

        <DrawerBody>
          <div className="space-y-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="w-full flex items-center justify-between font-medium cursor-pointer text-sm transition-colors"
              >
                <span
                  className={`w-full flex items-center justify-between font-medium cursor-pointer text-sm transition-colors ${
                    selectedTag === tag
                      ? "underline underline-offset-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent"
                      : "text-white/60"
                  }`}
                >
                  {tag}
                </span>
                {tagCounts?.[tag] && (
                  <span className={`flex-shrink-0 ml-2 border rounded-lg backdrop-blur-sm h-6 min-w-6 flex items-center justify-center transition-all duration-300 ${
                    selectedTag === tag
                      ? "border-purple-500/40 bg-purple-500/10 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-600/20 text-white"
                      : "border-white/10 bg-white/5 text-white/60"
                  }`}>
                    {tagCounts[tag]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );

  return (
    <>
      <DesktopTagFilter />
      <MobileTagFilter />
    </>
  );
}

