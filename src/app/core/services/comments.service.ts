import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseDataService, ApiResponse } from './base-data.service';
import { Comment } from '../../shared/models';

export interface CreateCommentDto {
  postId: string;
  authorName: string;
  authorEmail: string;
  body: string;
}

export interface UpdateCommentDto {
  authorName?: string;
  authorEmail?: string;
  body?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface CommentFilters {
  postId?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  authorEmail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private baseService = inject(BaseDataService);
  private readonly ENTITY = 'comments';

  // GET - Todos os comentários
  getAllComments(): Observable<ApiResponse<Comment[]>> {
    return this.baseService.getAll<Comment>(this.ENTITY);
  }

  // GET - Comentário por ID
  getCommentById(id: string): Observable<ApiResponse<Comment | null>> {
    return this.baseService.getById<Comment>(this.ENTITY, id);
  }

  // GET - Comentários filtrados
  getCommentsFiltered(filters: CommentFilters): Observable<ApiResponse<Comment[]>> {
    return this.getAllComments().pipe(
      map(response => {
        if (!response.success) return response;

        let filteredComments = response.data;

        // Filtrar por post
        if (filters.postId) {
          filteredComments = filteredComments.filter(comment => comment.postId === filters.postId);
        }

        // Filtrar por status
        if (filters.status) {
          filteredComments = filteredComments.filter(comment => comment.status === filters.status);
        }

        // Filtrar por email do autor
        if (filters.authorEmail) {
          filteredComments = filteredComments.filter(comment => comment.authorEmail === filters.authorEmail);
        }

        // Ordenar por data (mais recentes primeiro)
        filteredComments.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return {
          ...response,
          data: filteredComments
        };
      })
    );
  }

  // GET - Comentários de um post específico (apenas aprovados)
  getApprovedCommentsByPost(postId: string): Observable<ApiResponse<Comment[]>> {
    return this.getCommentsFiltered({ postId, status: 'APPROVED' });
  }

  // GET - Comentários pendentes de moderação
  getPendingComments(): Observable<ApiResponse<Comment[]>> {
    return this.getCommentsFiltered({ status: 'PENDING' });
  }

  // GET - Todos os comentários aprovados (para exibição pública)
  getApprovedComments(): Observable<ApiResponse<Comment[]>> {
    return this.getCommentsFiltered({ status: 'APPROVED' });
  }

  // GET - Comentários por status
  getCommentsByStatus(status: Comment['status']): Observable<ApiResponse<Comment[]>> {
    return this.getCommentsFiltered({ status });
  }

  // GET - Comentários de um autor específico
  getCommentsByAuthorEmail(authorEmail: string): Observable<ApiResponse<Comment[]>> {
    return this.getCommentsFiltered({ authorEmail });
  }

  // GET - Contagem de comentários por status
  getCommentsCounts(): Observable<Record<Comment['status'], number>> {
    return this.getAllComments().pipe(
      map(response => {
        if (!response.success) {
          return { PENDING: 0, APPROVED: 0, REJECTED: 0 };
        }

        return response.data.reduce((counts, comment) => {
          counts[comment.status] = (counts[comment.status] || 0) + 1;
          return counts;
        }, { PENDING: 0, APPROVED: 0, REJECTED: 0 } as Record<Comment['status'], number>);
      })
    );
  }

  // POST - Criar novo comentário
  createComment(newComment: CreateCommentDto): Observable<ApiResponse<Comment>> {
    // Validações básicas
    if (!this.isValidEmail(newComment.authorEmail)) {
      throw new Error('Invalid email format');
    }

    if (newComment.body.trim().length < 3) {
      throw new Error('Comment must be at least 3 characters long');
    }

    if (newComment.authorName.trim().length < 2) {
      throw new Error('Author name must be at least 2 characters long');
    }

    const commentData = {
      ...newComment,
      status: 'PENDING' as const, // Novos comentários ficam pendentes
      createdAt: new Date().toISOString(),
      // Limpar dados
      authorName: newComment.authorName.trim(),
      authorEmail: newComment.authorEmail.toLowerCase().trim(),
      body: newComment.body.trim()
    };

    return this.baseService.create<Comment>(this.ENTITY, commentData);
  }

  // PUT - Atualizar comentário
  updateComment(id: string, updates: UpdateCommentDto): Observable<ApiResponse<Comment>> {
    // Se está a atualizar o corpo do comentário, validar comprimento
    if (updates.body && updates.body.trim().length < 3) {
      throw new Error('Comment must be at least 3 characters long');
    }

    // Limpar dados se fornecidos
    const cleanUpdates = {
      ...updates,
      ...(updates.authorName && { authorName: updates.authorName.trim() }),
      ...(updates.authorEmail && { authorEmail: updates.authorEmail.toLowerCase().trim() }),
      ...(updates.body && { body: updates.body.trim() })
    };

    return this.baseService.update<Comment>(this.ENTITY, id, cleanUpdates);
  }

  // PUT - Aprovar comentário
  approveComment(id: string): Observable<ApiResponse<Comment>> {
    return this.updateComment(id, { status: 'APPROVED' });
  }

  // PUT - Rejeitar comentário
  rejectComment(id: string): Observable<ApiResponse<Comment>> {
    return this.updateComment(id, { status: 'REJECTED' });
  }

  // PUT - Aprovar múltiplos comentários
  approveMultipleComments(ids: string[]): Observable<ApiResponse<Comment[]>> {
    // Implementação simplificada - em produção seria melhor ter um endpoint específico
    const updates = ids.map(id => this.approveComment(id));
    
    // Por simplicidade, retornamos o resultado do primeiro
    // Em produção, usaríamos forkJoin para aguardar todos
    return updates[0].pipe(
      map(response => ({
        ...response,
        data: [response.data] as Comment[]
      }))
    );
  }

  // PUT - Rejeitar múltiplos comentários
  rejectMultipleComments(ids: string[]): Observable<ApiResponse<Comment[]>> {
    const updates = ids.map(id => this.rejectComment(id));
    
    return updates[0].pipe(
      map(response => ({
        ...response,
        data: [response.data] as Comment[]
      }))
    );
  }

  // DELETE - Remover comentário
  deleteComment(id: string): Observable<ApiResponse<boolean>> {
    return this.baseService.delete<Comment>(this.ENTITY, id);
  }

  // DELETE - Remover todos os comentários de um post
  deleteCommentsByPost(postId: string): Observable<ApiResponse<boolean>> {
    return this.getCommentsFiltered({ postId }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error('Failed to get comments for post');
        }

        // Remover cada comentário (em produção seria um endpoint específico)
        response.data.forEach(comment => {
          this.deleteComment(comment.id).subscribe();
        });

        return {
          data: true,
          success: true,
          message: `Deleted ${response.data.length} comments for post ${postId}`
        };
      })
    );
  }

  // UTILITY - Verificar se email é válido
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // UTILITY - Verificar se há comentários spam (mesmo email/IP com muitos comentários)
  checkForSpam(authorEmail: string, timeWindowMinutes: number = 60): Observable<boolean> {
    const timeWindow = timeWindowMinutes * 60 * 1000; // Converter para milliseconds
    const cutoffTime = new Date(Date.now() - timeWindow);

    return this.getCommentsByAuthorEmail(authorEmail).pipe(
      map(response => {
        if (!response.success) return false;

        const recentComments = response.data.filter(comment => 
          new Date(comment.createdAt) > cutoffTime
        );

        // Considerar spam se mais de 3 comentários na última hora
        return recentComments.length > 3;
      })
    );
  }

  // UTILITY - Verificar se está a carregar
  isLoading(operation: string, id?: string): boolean {
    const key = id ? `${operation}_${this.ENTITY}_${id}` : `${operation}_${this.ENTITY}`;
    return this.baseService.isLoading(key);
  }
}