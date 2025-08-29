import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseDataService, ApiResponse } from './base-data.service';
import { Category } from '../../shared/models';

export interface CreateCategoryDto {
  name: string;
  description: string;
  color: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  color?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private baseService = inject(BaseDataService);
  private readonly ENTITY = 'categories';

  // GET - Todas as categorias
  getAllCategories(): Observable<ApiResponse<Category[]>> {
    return this.baseService.getAll<Category>(this.ENTITY);
  }

  // GET - Categoria por ID
  getCategoryById(id: string): Observable<ApiResponse<Category | null>> {
    return this.baseService.getById<Category>(this.ENTITY, id);
  }

  // GET - Categoria por slug
  getCategoryBySlug(slug: string): Observable<ApiResponse<Category | null>> {
    return this.getAllCategories().pipe(
      map(response => {
        if (!response.success) {
          return { ...response, data: null };
        }

        const category = response.data.find(c => c.slug === slug);
        return {
          data: category || null,
          success: !!category,
          message: category ? undefined : `Category with slug '${slug}' not found`
        };
      })
    );
  }

  // GET - Categorias ordenadas por nome
  getCategoriesSorted(): Observable<ApiResponse<Category[]>> {
    return this.getAllCategories().pipe(
      map(response => {
        if (!response.success) return response;

        const sortedCategories = [...response.data].sort((a, b) => 
          a.name.localeCompare(b.name)
        );

        return {
          ...response,
          data: sortedCategories
        };
      })
    );
  }

  // POST - Criar nova categoria
  createCategory(newCategory: CreateCategoryDto): Observable<ApiResponse<Category>> {
    const categoryData = {
      ...newCategory,
      slug: this.generateSlug(newCategory.name),
      createdAt: new Date().toISOString()
    };

    return this.baseService.create<Category>(this.ENTITY, categoryData);
  }

  // PUT - Atualizar categoria
  updateCategory(id: string, updates: UpdateCategoryDto): Observable<ApiResponse<Category>> {
    const updateData = {
      ...updates,
      // Atualizar slug se mudou o nome
      ...(updates.name && { slug: this.generateSlug(updates.name) })
    };

    return this.baseService.update<Category>(this.ENTITY, id, updateData);
  }

  // DELETE - Remover categoria
  deleteCategory(id: string): Observable<ApiResponse<boolean>> {
    return this.baseService.delete<Category>(this.ENTITY, id);
  }

  // UTILITY - Verificar se categoria existe por slug
  existsBySlug(slug: string): Observable<boolean> {
    return this.getCategoryBySlug(slug).pipe(
      map(response => response.success && !!response.data)
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