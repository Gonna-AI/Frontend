export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags?: string[];
  featured?: boolean;
  readTime?: string;
  author?: string;
  authorImage?: string;
  thumbnail?: string;
  content?: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "21-best-free-react-components",
    title: "21 Best Free React Components Libraries To Kickstart Projects",
    description: "Discover the most powerful and popular React component libraries that will accelerate your development workflow and help you build stunning UIs.",
    date: "2024-12-01",
    tags: ["UI Frameworks", "React", "Components"],
    featured: true,
    readTime: "16 min read",
    author: "arghya",
    thumbnail: "/blog-thumbnails/react-components-libraries.jpg",
    content: "Building modern React applications requires a solid foundation of reusable components..."
  },
  {
    slug: "react-portfolio-templates",
    title: "React Portfolio Templates",
    description: "Beautiful and modern React portfolio templates to showcase your work.",
    date: "2024-11-15",
    tags: ["React", "Templates", "Portfolio"],
    featured: false,
    readTime: "12 min read",
    author: "dillion",
    thumbnail: "/blog-thumbnails/react-portfolio-templates.jpg",
    content: "Creating a portfolio website is essential for developers and designers..."
  },
  {
    slug: "nextjs-portfolio-templates",
    title: "Next.js Portfolio Templates",
    description: "High-performance Next.js portfolio templates with modern features.",
    date: "2024-11-10",
    tags: ["Next.js", "Templates", "Portfolio"],
    featured: false,
    readTime: "14 min read",
    author: "arghya",
    thumbnail: "/blog-thumbnails/nextjs-portfolio-templates.jpg",
    content: "Next.js provides an excellent foundation for building portfolio websites..."
  },
  {
    slug: "react-animation-libraries",
    title: "React Animation Libraries",
    description: "Top React animation libraries to bring your UI to life.",
    date: "2024-11-05",
    tags: ["React", "Animation", "Libraries"],
    featured: false,
    readTime: "10 min read",
    author: "dillion",
    thumbnail: "/blog-thumbnails/react-animation-libraries.jpg",
    content: "Animations are crucial for creating engaging user experiences..."
  },
  {
    slug: "react-landing-page-templates",
    title: "React Landing Page Templates",
    description: "Professional React landing page templates for your next project.",
    date: "2024-10-28",
    tags: ["React", "Templates", "Landing Page"],
    featured: false,
    readTime: "11 min read",
    author: "arghya",
    thumbnail: "/blog-thumbnails/react-landing-page-templates.jpg",
    content: "A well-designed landing page is crucial for converting visitors..."
  },
  {
    slug: "react-native-libraries",
    title: "React Native Libraries",
    description: "Essential React Native libraries for mobile app development.",
    date: "2024-10-20",
    tags: ["React Native", "Mobile", "Libraries"],
    featured: false,
    readTime: "13 min read",
    author: "dillion",
    thumbnail: "/blog-thumbnails/react-native-libraries.jpg",
    content: "React Native enables developers to build cross-platform mobile apps..."
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  if (tag === "All") {
    return getAllBlogPosts();
  }
  return getAllBlogPosts().filter(post => post.tags?.includes(tag));
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  blogPosts.forEach(post => {
    post.tags?.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

