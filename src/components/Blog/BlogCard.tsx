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
        "group block relative before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-transparent before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-0 after:h-px after:w-screen after:bg-transparent after:content-['']",
        showRightBorder && "md:border-r border-transparent border-b-0"
      )}
    >
      <div className="flex flex-col">
        {thumbnail && (
          <div className="relative w-full h-48 overflow-hidden">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        <div className="p-6 flex flex-col gap-2">
          <h3 className="text-xl font-semibold text-white group-hover:underline underline-offset-4">
            {title}
          </h3>
          <p className="text-white/60 text-sm">{description}</p>
          <time className="block text-sm font-medium text-white/60">
            {date}
          </time>
        </div>
      </div>
    </Link>
  );
}

