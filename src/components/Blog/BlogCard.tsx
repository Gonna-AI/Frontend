import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

interface BlogCardProps {
  url: string;
  title: string;
  description: string;
  date: string;
  thumbnail?: string;
  showRightBorder?: boolean;
}

export function BlogCard({
  url,
  title,
  description,
  date,
  thumbnail,
  showRightBorder = true,
}: BlogCardProps) {
  return (
    <Link
      to={url}
      className={cn(
        "group block h-full relative before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-transparent before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-0 after:h-px after:w-screen after:bg-transparent after:content-['']",
        showRightBorder && "md:border-r border-transparent border-b-0",
      )}
    >
      <div className="flex flex-col h-full rounded-2xl overflow-hidden md:backdrop-blur-sm md:bg-white/5 md:border md:border-white/10 md:hover:bg-white/10 md:hover:border-white/20 transition-all duration-300">
        {thumbnail && (
          <div className="relative w-full h-48 flex-shrink-0 overflow-hidden rounded-t-2xl">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-2xl"
            />
          </div>
        )}

        <div className="p-6 flex flex-col gap-2 flex-1">
          <h3 className="text-xl font-semibold text-white group-hover:underline underline-offset-4 line-clamp-2">
            {title}
          </h3>
          <p className="text-white/60 text-sm line-clamp-3 flex-1">
            {description}
          </p>
          <time className="block text-sm font-medium text-white/60 mt-auto">
            {date}
          </time>
        </div>
      </div>
    </Link>
  );
}
