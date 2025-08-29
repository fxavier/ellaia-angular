import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap, of } from 'rxjs';
import { BaseDataService, ApiResponse } from './base-data.service';
import { Tag } from '../../shared/models';

export interface CreateTagDto {
  name: string;
}

export interface UpdateTagDto {
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TagsService {
  private baseService = inject(BaseDataService);
  private readonly ENTITY = 'tags';

  // GET - Todas as tags
  getAllTags(): Observable<ApiResponse<Tag[]>> {
    return this.baseService.getAll<Tag>(this.ENTITY);
  }

  // GET - Tag por ID
  getTagById(id: string): Observable<ApiResponse<Tag | null>> {
    return this.baseService.getById<Tag>(this.ENTITY, id);
  }

  // GET - Tag por slug
  getTagBySlug(slug: string): Observable<ApiResponse<Tag | null>> {
    return this.getAllTags().pipe(
      map(response => {
        if (!response.success) {
          return { ...response, data: null };
        }

        const tag = response.data.find(t => t.slug === slug);
        return {
          data: tag || null,
          success: !!tag,
          message: tag ? undefined : `Tag with slug '${slug}' not found`
        };
      })
    );
  }

  // GET - Tags por nome (busca parcial)
  searchTagsByName(searchTerm: string): Observable<ApiResponse<Tag[]>> {
    return this.getAllTags().pipe(
      map(response => {
        if (!response.success) return response;

        const filteredTags = response.data.filter(tag =>
          tag.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return {
          ...response,
          data: filteredTags
        };
      })
    );
  }

  // GET - Tags ordenadas por nome
  getTagsSorted(): Observable<ApiResponse<Tag[]>> {
    return this.getAllTags().pipe(
      map(response => {
        if (!response.success) return response;

        const sortedTags = [...response.data].sort((a, b) => 
          a.name.localeCompare(b.name)
        );

        return {
          ...response,
          data: sortedTags
        };
      })
    );
  }

  // GET - Tags mais utilizadas (baseado nos posts)
  getMostUsedTags(limit: number = 10): Observable<ApiResponse<Tag[]>> {
    // Nota: Esta implementação é simplificada. 
    // Em produção, teríamos uma relação post_tags para contar usage
    return this.getTagsSorted().pipe(
      map(response => {
        if (!response.success) return response;

        // Por agora, retornamos as primeiras tags ordenadas por nome
        // Em produção, ordenarías por contagem de uso
        const topTags = response.data.slice(0, limit);

        return {
          ...response,
          data: topTags
        };
      })
    );
  }

  // GET - Sugestões de tags (para autocomplete)
  getTagSuggestions(partial: string, limit: number = 5): Observable<ApiResponse<Tag[]>> {
    return this.searchTagsByName(partial).pipe(
      map(response => {
        if (!response.success) return response;

        // Ordenar por relevância (exato primeiro, depois parcial)
        const exactMatches = response.data.filter(tag => 
          tag.name.toLowerCase() === partial.toLowerCase()
        );
        const partialMatches = response.data.filter(tag => 
          tag.name.toLowerCase() !== partial.toLowerCase()
        );

        const suggestions = [...exactMatches, ...partialMatches].slice(0, limit);

        return {
          ...response,
          data: suggestions
        };
      })
    );
  }

  // POST - Criar nova tag
  createTag(newTag: CreateTagDto): Observable<ApiResponse<Tag>> {
    // Validação
    if (!newTag.name.trim()) {
      throw new Error('Tag name is required');
    }

    if (newTag.name.trim().length < 2) {
      throw new Error('Tag name must be at least 2 characters long');
    }

    const tagData = {
      name: newTag.name.trim(),
      slug: this.generateSlug(newTag.name.trim())
    };

    return this.baseService.create<Tag>(this.ENTITY, tagData);
  }

  // POST - Criar tag se não existir
  createTagIfNotExists(tagName: string): Observable<ApiResponse<Tag>> {
    const slug = this.generateSlug(tagName);
    
    return this.getTagBySlug(slug).pipe(
      switchMap(response => {
        if (response.success && response.data) {
          // Tag já existe - return as Observable
          return of(response as ApiResponse<Tag>);
        }

        // Tag não existe, criar nova
        return this.createTag({ name: tagName });
      })
    );
  }

  // POST - Criar múltiplas tags
  createMultipleTags(tagNames: string[]): Observable<ApiResponse<Tag[]>> {
    const uniqueNames = [...new Set(tagNames.map(name => name.trim()))];
    const createdTags: Tag[] = [];

    // Implementação simplificada - em produção usaríamos forkJoin
    const createPromises = uniqueNames.map(name => {
      return this.createTagIfNotExists(name).toPromise();
    });

    return new Observable(subscriber => {
      Promise.all(createPromises).then(results => {
        const successfulTags = results
          .filter(result => result?.success)
          .map(result => result!.data)
          .filter(Boolean) as Tag[];

        subscriber.next({
          data: successfulTags,
          success: true,
          message: `Created ${successfulTags.length} tags`
        });
        subscriber.complete();
      }).catch(error => {
        subscriber.error({
          data: [],
          success: false,
          message: `Failed to create tags: ${error.message}`
        });
      });
    });
  }

  // PUT - Atualizar tag
  updateTag(id: string, updates: UpdateTagDto): Observable<ApiResponse<Tag>> {
    const updateData = {
      ...updates,
      // Atualizar slug se mudou o nome
      ...(updates.name && { 
        name: updates.name.trim(),
        slug: this.generateSlug(updates.name.trim()) 
      })
    };

    return this.baseService.update<Tag>(this.ENTITY, id, updateData);
  }

  // DELETE - Remover tag
  deleteTag(id: string): Observable<ApiResponse<boolean>> {
    return this.baseService.delete<Tag>(this.ENTITY, id);
  }

  // DELETE - Remover múltiplas tags
  deleteMultipleTags(ids: string[]): Observable<ApiResponse<boolean>> {
    // Implementação simplificada
    ids.forEach(id => {
      this.deleteTag(id).subscribe();
    });

    return new Observable(subscriber => {
      subscriber.next({
        data: true,
        success: true,
        message: `Deleted ${ids.length} tags`
      });
      subscriber.complete();
    });
  }

  // UTILITY - Verificar se tag existe por slug
  existsBySlug(slug: string): Observable<boolean> {
    return this.getTagBySlug(slug).pipe(
      map(response => response.success && !!response.data)
    );
  }

  // UTILITY - Verificar se nome da tag já existe
  existsByName(name: string, excludeId?: string): Observable<boolean> {
    const slug = this.generateSlug(name);
    return this.getAllTags().pipe(
      map(response => {
        if (!response.success) return false;

        return response.data.some(tag => 
          tag.slug === slug && tag.id !== excludeId
        );
      })
    );
  }

  // UTILITY - Converter nomes em tags (para usar em formulários)
  convertNamesToTags(tagNames: string[]): Observable<ApiResponse<Tag[]>> {
    const uniqueNames = [...new Set(tagNames.map(name => name.trim()))];
    
    return this.getAllTags().pipe(
      map(response => {
        if (!response.success) return { ...response, data: [] };

        const existingTags = response.data.filter(tag =>
          uniqueNames.some(name => this.generateSlug(name) === tag.slug)
        );

        return {
          ...response,
          data: existingTags
        };
      })
    );
  }

  // UTILITY - Verificar se está a carregar
  isLoading(operation: string, id?: string): boolean {
    const key = id ? `${operation}_${this.ENTITY}_${id}` : `${operation}_${this.ENTITY}`;
    return this.baseService.isLoading(key);
  }

  // UTILITY - Gerar slug
  private generateSlug(name: string): string {
    return name
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
}