import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { BaseDataService, ApiResponse } from './base-data.service';
import { Post, PostWithRelations, Author, Category, Comment } from '../../shared/models';

export interface CreatePostDto {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: string;
  categoryId: string;
  tags: string[];
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface UpdatePostDto {
  title?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  categoryId?: string;
  tags?: string[];
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
}

export interface PostFilters {
  categoryId?: string;
  authorId?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  tags?: string[];
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private baseService = inject(BaseDataService);
  private readonly ENTITY = 'posts';

  // GET - Todos os posts
  getAllPosts(): Observable<ApiResponse<Post[]>> {
    return this.baseService.getAll<Post>(this.ENTITY);
  }

  // GET - Posts com relações (author, category, comments)
  getPostsWithRelations(): Observable<ApiResponse<PostWithRelations[]>> {
    return this.getAllPosts().pipe(
      map(response => {
        if (!response.success) return response as ApiResponse<PostWithRelations[]>;

        // Esta implementação seria ideal com combineLatest para otimizar
        // Por simplicidade, vamos fazer requests separados
        const posts = response.data.map(post => ({
          ...post,
          author: undefined, // Será carregado pelos componentes se necessário
          category: undefined,
          comments: undefined
        } as PostWithRelations));

        return {
          ...response,
          data: posts
        };
      })
    );
  }

  // GET - Post por ID
  getPostById(id: string): Observable<ApiResponse<Post | null>> {
    return this.baseService.getById<Post>(this.ENTITY, id);
  }

  // GET - Post por slug
  getPostBySlug(slug: string): Observable<ApiResponse<Post | null>> {
    return this.getAllPosts().pipe(
      map(response => {
        if (!response.success) {
          return { ...response, data: null };
        }

        const post = response.data.find(p => p.slug === slug);
        return {
          data: post || null,
          success: !!post,
          message: post ? undefined : `Post with slug '${slug}' not found`
        };
      })
    );
  }

  // GET - Posts filtrados
  getPostsFiltered(filters: PostFilters): Observable<ApiResponse<Post[]>> {
    return this.getAllPosts().pipe(
      map(response => {
        if (!response.success) return response;

        let filteredPosts = response.data;

        // Filtrar por categoria
        if (filters.categoryId) {
          filteredPosts = filteredPosts.filter(post => post.categoryId === filters.categoryId);
        }

        // Filtrar por autor
        if (filters.authorId) {
          filteredPosts = filteredPosts.filter(post => post.authorId === filters.authorId);
        }

        // Filtrar por status
        if (filters.status) {
          filteredPosts = filteredPosts.filter(post => post.status === filters.status);
        }

        // Filtrar por tags
        if (filters.tags && filters.tags.length > 0) {
          filteredPosts = filteredPosts.filter(post => 
            filters.tags!.some(tag => post.tags.includes(tag))
          );
        }

        // Filtrar por pesquisa (title, excerpt, content)
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredPosts = filteredPosts.filter(post =>
            post.title.toLowerCase().includes(searchTerm) ||
            post.excerpt.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm)
          );
        }

        return {
          ...response,
          data: filteredPosts
        };
      })
    );
  }

  // GET - Posts publicados (para blog público)
  getPublishedPosts(): Observable<ApiResponse<Post[]>> {
    return this.getPostsFiltered({ status: 'PUBLISHED' });
  }

  // GET - Posts em destaque (últimos 3 publicados)
  getFeaturedPosts(limit: number = 3): Observable<ApiResponse<Post[]>> {
    return this.getPublishedPosts().pipe(
      map(response => {
        if (!response.success) return response;

        // Ordenar por data de publicação (mais recentes primeiro)
        const sortedPosts = response.data
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, limit);

        return {
          ...response,
          data: sortedPosts
        };
      })
    );
  }

  // POST - Criar novo post
  createPost(newPost: CreatePostDto): Observable<ApiResponse<Post>> {
    const postData = {
      ...newPost,
      slug: this.generateSlug(newPost.title),
      status: newPost.status || 'DRAFT',
      publishedAt: newPost.status === 'PUBLISHED' ? new Date().toISOString() : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readingTime: this.calculateReadingTime(newPost.content),
      views: 0,
      likes: 0
    };

    return this.baseService.create<Post>(this.ENTITY, postData);
  }

  // PUT - Atualizar post
  updatePost(id: string, updates: UpdatePostDto): Observable<ApiResponse<Post>> {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      // Atualizar publishedAt se mudou para PUBLISHED
      ...(updates.status === 'PUBLISHED' && { publishedAt: new Date().toISOString() }),
      // Atualizar slug se mudou o título
      ...(updates.title && { slug: this.generateSlug(updates.title) }),
      // Atualizar tempo de leitura se mudou o conteúdo
      ...(updates.content && { readingTime: this.calculateReadingTime(updates.content) })
    };

    return this.baseService.update<Post>(this.ENTITY, id, updateData);
  }

  // PUT - Publicar post
  publishPost(id: string): Observable<ApiResponse<Post>> {
    return this.updatePost(id, { 
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString()
    });
  }

  // PUT - Despublicar post
  unpublishPost(id: string): Observable<ApiResponse<Post>> {
    return this.updatePost(id, { status: 'DRAFT' });
  }

  // PUT - Incrementar views
  incrementViews(id: string): Observable<ApiResponse<Post>> {
    return this.getPostById(id).pipe(
      switchMap(response => {
        if (!response.success || !response.data) {
          throw new Error('Post not found');
        }

        const updatedViews = (response.data.views || 0) + 1;
        return this.baseService.update<Post>(this.ENTITY, id, { views: updatedViews });
      })
    );
  }

  // PUT - Incrementar likes
  incrementLikes(id: string): Observable<ApiResponse<Post>> {
    return this.getPostById(id).pipe(
      switchMap(response => {
        if (!response.success || !response.data) {
          throw new Error('Post not found');
        }

        const updatedLikes = (response.data.likes || 0) + 1;
        return this.baseService.update<Post>(this.ENTITY, id, { likes: updatedLikes });
      })
    );
  }

  // DELETE - Remover post
  deletePost(id: string): Observable<ApiResponse<boolean>> {
    return this.baseService.delete<Post>(this.ENTITY, id);
  }

  // UTILITY - Verificar se está a carregar
  isLoading(operation: string, id?: string): boolean {
    const key = id ? `${operation}_${this.ENTITY}_${id}` : `${operation}_${this.ENTITY}`;
    return this.baseService.isLoading(key);
  }

  // UTILITY - Gerar slug
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[áàâã]/g, 'a')
      .replace(/[éêè]/g, 'e')
      .replace(/[íìî]/g, 'i')
      .replace(/[óòôõ]/g, 'o')
      .replace(/[úùû]/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // UTILITY - Calcular tempo de leitura
  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200; // Média de palavras por minuto
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }
}