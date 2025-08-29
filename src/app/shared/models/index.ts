export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
}

export interface Author {
  id: string;
  name: string;
  email: string;
  role: 'READER' | 'AUTHOR' | 'EDITOR' | 'ADMIN';
  bio: string;
  avatar: string;
  links: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
    github?: string;
    medium?: string;
  };
  createdAt: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  categoryId: string;
  tags: string[];
  readingTime: number;
  views: number;
  likes: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  body: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface PostWithRelations extends Post {
  author?: Author;
  category?: Category;
  comments?: Comment[];
}