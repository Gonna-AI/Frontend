import { MEDIA_BASE_URL } from '../config/media';

export interface BlogAuthor {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  linkedin?: string;
  objectPosition?: string;
}

const R2 = MEDIA_BASE_URL;

export const blogAuthors: Record<string, BlogAuthor> = {
  animesh: {
    id: 'animesh', name: 'Animesh Mishra', role: 'Founder', image: `${R2}/animeshmishra.PNG`, objectPosition: 'center top',
    bio: 'Animesh founded ClerkTree. He studies computer science and machine learning at Shiv Nadar Institute of Eminence, previously built predictive models as a quant research analyst, and now works on agent orchestration for industrial operations.',
    linkedin: 'https://www.linkedin.com/in/animeshmishra0',
  },
  krishang: {
    id: 'krishang', name: 'Krishang Sharma', role: 'AI Solutions Engineer', image: `${R2}/krishangfinal.JPG`, objectPosition: '55% 5%',
    bio: 'Krishang builds the retrieval and agent systems behind ClerkTree. Before that he worked on ML engineering and research at I4C (Ministry of Home Affairs) and the Scientific Analysis Group, DRDO.',
    linkedin: 'https://www.linkedin.com/in/krishangsharma118/',
  },
  shobhit: {
    id: 'shobhit', name: 'Shobhit Mishra', role: 'CEO', image: `${R2}/shobhitmishra.jpeg`, objectPosition: 'center top',
    bio: 'Shobhit leads ClerkTree and studies at TUM with a focus on sustainable data automation. He previously worked on automation projects at Robotico.',
    linkedin: 'https://www.linkedin.com/in/shobhit-mishra-8716961bb/',
  },
  kenshin: {
    id: 'kenshin', name: 'Kenshin Kiriyama', role: 'COO', image: `${R2}/KenshinKiriyama.jpeg`,
    bio: 'Kenshin runs customer operations and maintenance at ClerkTree. He studies Sustainable Management at TUM and is a Deutschlandstipendium recipient.',
    linkedin: 'https://www.linkedin.com/in/kenshin-kiriyama-2b2031357/',
  },
  aryaman: {
    id: 'aryaman', name: 'Aryaman Srivastava', role: 'Engineer', image: `${R2}/aryamansriva.jpeg`, objectPosition: 'center top',
    bio: 'Aryaman studies computer science at Shiv Nadar Institute of Eminence, focusing on machine learning, scalable systems and agentic AI. He has worked on GPU-accelerated image segmentation and reinforcement learning, built data applications with Fractal Analytics, and works on the platform that ships ClerkTree agents to production.',
  },
  katharina: {
    id: 'katharina', name: 'Katharina Krüger', role: 'Executive Assistant', image: `${R2}/Katharina.jpeg`, objectPosition: 'center top',
    bio: 'Katharina brings strategy experience from roles including Head of Strategy and Tchibo, and a Business Administration degree from the University of Mannheim.',
    linkedin: 'https://www.linkedin.com/in/katharina-krüger-42220a392/',
  },
};

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags?: string[];
  /** Shown on the cover. */
  category?: string;
  /** Cover tone. */
  tone?: 'silver' | 'black';
  featured?: boolean;
  readTime?: string;
  authors?: string[];
  thumbnail?: string;
}

/** Post bodies live in /public/journal/<slug>.md and load only when a post is opened. */
export const postContentUrl = (slug: string) => `/journal/${slug}.md`;

export const blogPosts: BlogPost[] = [
  {
    slug: "devops-for-agents-on-the-shop-floor",
    title: "Shipping agents to the shop floor: what DevOps looks like for agentic AI",
    description: "Agents fail differently from services: the failures look like answers. How we version reasoning, gate releases on evaluations, use shadow mode as staging, and keep tool access narrow inside industrial plants.",
    date: "2026-11-09",
    tags: ["Engineering", "Agents", "DevOps"],
    category: "Engineering",
    tone: "black",
    readTime: "12 min read",
    authors: ["aryaman"],
  },
  {
    slug: "the-hard-part-isnt-the-ai",
    title: "The hard part isn't the AI: Animesh and Katharina in conversation",
    description: "Why factories, why every answer shows its sources, what the works council taught us, and what we got wrong. An honest conversation about building AI for maintenance teams.",
    date: "2026-11-09",
    tags: ["Conversation", "Operations", "AI"],
    category: "Conversation",
    tone: "silver",
    readTime: "10 min read",
    authors: ["animesh", "katharina"],
  },
  {
    slug: "rolling-out-ai-with-a-maintenance-team",
    title: "Rolling out AI with a maintenance team: a 90-day playbook",
    description: "Most industrial AI pilots stall because the rollout ignores how maintenance actually works. This is the sequence we follow, from picking the first assets to deciding whether to scale.",
    date: "2026-11-05",
    tags: ["Operations", "Predictive Maintenance", "Playbook"],
    category: "Operations",
    tone: "silver",
    featured: true,
    readTime: "12 min read",
    authors: ["shobhit", "kenshin", "katharina"],
  },
  {
    slug: "from-vibration-alarm-to-root-cause",
    title: "From vibration alarm to root cause: grounding maintenance agents in your plant's own documents",
    description: "An alarm tells you something changed. The reason sits in manuals, work order history and parts records. How we turn signals into evidence, make manuals retrievable and make agents cite every claim.",
    date: "2026-10-28",
    tags: ["Engineering", "Predictive Maintenance", "AI"],
    category: "Engineering",
    tone: "black",
    readTime: "14 min read",
    authors: ["krishang"],
  },
  {
    slug: "juris-comprehensive-case-study",
    title: "Juris: Case Study Analysis",
    description: "An analysis of Juris, production-ready, multi-modal legal AI system achieving 92% precision@5 — outperforming state-of-the-art systems by 12-33%.",
    date: "2025-06-15",
    tags: ["AI", "Legal Tech", "Case Study", "Machine Learning"],
    featured: true,
    readTime: "8 min read",
    authors: ["animesh"],
    category: "Research",
    tone: "black",
  },
];

export function getPostAuthors(post: BlogPost): BlogAuthor[] {
  return (post.authors ?? []).map((id) => blogAuthors[id]).filter(Boolean);
}

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

