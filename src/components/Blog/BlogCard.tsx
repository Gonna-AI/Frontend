import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

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
        "clerktree-blog-card group block h-full relative",
        showRightBorder && "md:border-r border-transparent border-b-0"
      )}
    >
      <div className="clerktree-blog-card-inner flex flex-col h-full overflow-hidden transition-all duration-300">
        {thumbnail && (
          <div className="clerktree-blog-card-media relative w-full h-48 flex-shrink-0 overflow-hidden">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        <div className="p-6 flex flex-col gap-2 flex-1">
          <h3 className="clerktree-blog-card-title text-xl font-semibold group-hover:underline underline-offset-4 line-clamp-2">
            {title}
          </h3>
          <p className="clerktree-blog-card-desc text-sm line-clamp-3 flex-1">{description}</p>
          <time className="clerktree-blog-card-date block text-sm font-medium mt-auto">
            {date}
          </time>
        </div>
      </div>
    </Link>
  );
}
