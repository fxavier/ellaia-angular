import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseDataService, ApiResponse } from './base-data.service';
import { Author } from '../../shared/models';

export interface CreateAuthorDto {
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
}

export interface UpdateAuthorDto {
  name?: string;
  email?: string;
  role?: 'READER' | 'AUTHOR' | 'EDITOR' | 'ADMIN';
  bio?: string;
  avatar?: string;
  links?: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
    github?: string;
    medium?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthorsService {
  private baseService = inject(BaseDataService);
  private readonly ENTITY = 'authors';

  // GET - Todos os autores
  getAllAuthors(): Observable<ApiResponse<Author[]>> {
    return this.baseService.getAll<Author>(this.ENTITY);
  }

  // GET - Autor por ID
  getAuthorById(id: string): Observable<ApiResponse<Author | null>> {
    return this.baseService.getById<Author>(this.ENTITY, id);
  }

  // GET - Autor por email
  getAuthorByEmail(email: string): Observable<ApiResponse<Author | null>> {
    return this.getAllAuthors().pipe(
      map(response => {
        if (!response.success) {
          return { ...response, data: null };
        }

        const author = response.data.find(a => a.email === email);
        return {
          data: author || null,
          success: !!author,
          message: author ? undefined : `Author with email '${email}' not found`
        };
      })
    );
  }

  // GET - Autores por papel
  getAuthorsByRole(role: Author['role']): Observable<ApiResponse<Author[]>> {
    return this.getAllAuthors().pipe(
      map(response => {
        if (!response.success) return response;

        const filteredAuthors = response.data.filter(author => author.role === role);
        return {
          ...response,
          data: filteredAuthors
        };
      })
    );
  }

  // GET - Autores ativos (AUTHOR, EDITOR, ADMIN)
  getActiveAuthors(): Observable<ApiResponse<Author[]>> {
    return this.getAllAuthors().pipe(
      map(response => {
        if (!response.success) return response;

        const activeAuthors = response.data.filter(author => 
          ['AUTHOR', 'EDITOR', 'ADMIN'].includes(author.role)
        );

        return {
          ...response,
          data: activeAuthors
        };
      })
    );
  }

  // GET - Equipa (para página About)
  getTeamMembers(): Observable<ApiResponse<Author[]>> {
    return this.getAllAuthors().pipe(
      map(response => {
        if (!response.success) return response;

        // Ordenar por hierarquia de papel e depois por nome
        const roleOrder = { 'ADMIN': 1, 'EDITOR': 2, 'AUTHOR': 3, 'READER': 4 };
        
        const teamMembers = response.data
          .filter(author => ['ADMIN', 'EDITOR', 'AUTHOR'].includes(author.role))
          .sort((a, b) => {
            const roleComparison = roleOrder[a.role] - roleOrder[b.role];
            if (roleComparison !== 0) return roleComparison;
            return a.name.localeCompare(b.name);
          });

        return {
          ...response,
          data: teamMembers
        };
      })
    );
  }

  // POST - Criar novo autor
  createAuthor(newAuthor: CreateAuthorDto): Observable<ApiResponse<Author>> {
    const authorData = {
      ...newAuthor,
      createdAt: new Date().toISOString()
    };

    return this.baseService.create<Author>(this.ENTITY, authorData);
  }

  // PUT - Atualizar autor
  updateAuthor(id: string, updates: UpdateAuthorDto): Observable<ApiResponse<Author>> {
    return this.baseService.update<Author>(this.ENTITY, id, updates);
  }

  // PUT - Atualizar perfil do autor (bio, avatar, links)
  updateAuthorProfile(id: string, profileData: Pick<UpdateAuthorDto, 'bio' | 'avatar' | 'links'>): Observable<ApiResponse<Author>> {
    return this.updateAuthor(id, profileData);
  }

  // PUT - Alterar papel do autor
  changeAuthorRole(id: string, newRole: Author['role']): Observable<ApiResponse<Author>> {
    return this.updateAuthor(id, { role: newRole });
  }

  // DELETE - Remover autor
  deleteAuthor(id: string): Observable<ApiResponse<boolean>> {
    return this.baseService.delete<Author>(this.ENTITY, id);
  }

  // UTILITY - Verificar se email já existe
  emailExists(email: string, excludeId?: string): Observable<boolean> {
    return this.getAllAuthors().pipe(
      map(response => {
        if (!response.success) return false;

        return response.data.some(author => 
          author.email === email && author.id !== excludeId
        );
      })
    );
  }

  // UTILITY - Obter contagem de autores por papel
  getAuthorCountsByRole(): Observable<Record<Author['role'], number>> {
    return this.getAllAuthors().pipe(
      map(response => {
        if (!response.success) {
          return { READER: 0, AUTHOR: 0, EDITOR: 0, ADMIN: 0 };
        }

        return response.data.reduce((counts, author) => {
          counts[author.role] = (counts[author.role] || 0) + 1;
          return counts;
        }, { READER: 0, AUTHOR: 0, EDITOR: 0, ADMIN: 0 } as Record<Author['role'], number>);
      })
    );
  }

  // UTILITY - Verificar se está a carregar
  isLoading(operation: string, id?: string): boolean {
    const key = id ? `${operation}_${this.ENTITY}_${id}` : `${operation}_${this.ENTITY}`;
    return this.baseService.isLoading(key);
  }
}