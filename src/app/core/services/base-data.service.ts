import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BaseDataService {
  private http = inject(HttpClient);
  private readonly STORAGE_PREFIX = 'ellaia_';
  private readonly DELAY_MS = 500; // Simular latência de rede

  // Simular operações de rede com loading states
  private loadingStates = signal<Record<string, boolean>>({});

  constructor() {
    // Inicializar localStorage com dados dos assets na primeira execução
    this.initializeLocalStorage();
  }

  private initializeLocalStorage(): void {
    const entities = ['posts', 'categories', 'authors', 'comments', 'tags'];
    
    entities.forEach(entity => {
      const storageKey = `${this.STORAGE_PREFIX}${entity}`;
      if (!localStorage.getItem(storageKey)) {
        // Carregar dados dos assets na primeira vez
        this.loadFromAssets<any[]>(`assets/mock-data/${entity}.json`).subscribe({
          next: (data) => {
            localStorage.setItem(storageKey, JSON.stringify(data));
          },
          error: (error) => {
            console.warn(`Failed to load ${entity} from assets:`, error);
          }
        });
      }
    });
  }

  private loadFromAssets<T>(url: string): Observable<T> {
    return this.http.get<T>(url).pipe(
      catchError(error => {
        console.error(`Error loading from assets: ${url}`, error);
        return throwError(() => error);
      })
    );
  }

  private setLoading(key: string, loading: boolean): void {
    this.loadingStates.update(states => ({
      ...states,
      [key]: loading
    }));
  }

  isLoading(key: string): boolean {
    return this.loadingStates()[key] || false;
  }

  // GET - Obter todos os registos
  getAll<T>(entity: string): Observable<ApiResponse<T[]>> {
    const loadingKey = `get_${entity}`;
    this.setLoading(loadingKey, true);

    const storageKey = `${this.STORAGE_PREFIX}${entity}`;
    const data = localStorage.getItem(storageKey);

    if (data) {
      return of({
        data: JSON.parse(data),
        success: true
      }).pipe(
        delay(this.DELAY_MS),
        map(response => {
          this.setLoading(loadingKey, false);
          return response;
        }),
        catchError(error => {
          this.setLoading(loadingKey, false);
          return throwError(() => error);
        })
      );
    }

    // Fallback para assets se não existir no localStorage
    return this.loadFromAssets<T[]>(`assets/mock-data/${entity}.json`).pipe(
      delay(this.DELAY_MS),
      map((data: T[]) => {
        // Guardar no localStorage para próximas operações
        localStorage.setItem(storageKey, JSON.stringify(data));
        this.setLoading(loadingKey, false);
        return {
          data,
          success: true
        } as ApiResponse<T[]>;
      }),
      catchError(error => {
        this.setLoading(loadingKey, false);
        return throwError(() => ({
          data: [] as T[],
          success: false,
          message: `Failed to load ${entity}: ${error.message}`
        }));
      })
    );
  }

  // GET BY ID - Obter um registo específico
  getById<T extends { id: string }>(entity: string, id: string): Observable<ApiResponse<T | null>> {
    const loadingKey = `get_${entity}_${id}`;
    this.setLoading(loadingKey, true);

    return this.getAll<T>(entity).pipe(
      map((response: ApiResponse<T[]>) => {
        const item = response.data.find(item => item.id === id);
        this.setLoading(loadingKey, false);
        return {
          data: item || null,
          success: !!item,
          message: item ? undefined : `${entity} with id ${id} not found`
        };
      }),
      catchError(error => {
        this.setLoading(loadingKey, false);
        return throwError(() => error);
      })
    );
  }

  // POST - Criar novo registo
  create<T extends { id?: string }>(entity: string, newItem: Omit<T, 'id'>): Observable<ApiResponse<T>> {
    const loadingKey = `create_${entity}`;
    this.setLoading(loadingKey, true);

    return this.getAll<T>(entity).pipe(
      map((response: ApiResponse<T[]>) => {
        // Gerar ID único
        const id = this.generateId();
        const itemWithId = { ...newItem, id } as T;
        
        // Adicionar à lista existente
        const updatedData = [...response.data, itemWithId];
        
        // Guardar no localStorage
        const storageKey = `${this.STORAGE_PREFIX}${entity}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedData));
        
        this.setLoading(loadingKey, false);
        return {
          data: itemWithId,
          success: true,
          message: `${entity} created successfully`
        };
      }),
      delay(this.DELAY_MS),
      catchError(error => {
        this.setLoading(loadingKey, false);
        return throwError(() => ({
          data: null as any,
          success: false,
          message: `Failed to create ${entity}: ${error.message}`
        }));
      })
    );
  }

  // PUT - Atualizar registo existente
  update<T extends { id: string }>(entity: string, id: string, updatedItem: Partial<T>): Observable<ApiResponse<T>> {
    const loadingKey = `update_${entity}_${id}`;
    this.setLoading(loadingKey, true);

    return this.getAll<T>(entity).pipe(
      map((response: ApiResponse<T[]>) => {
        const existingIndex = response.data.findIndex(item => item.id === id);
        
        if (existingIndex === -1) {
          throw new Error(`${entity} with id ${id} not found`);
        }

        // Atualizar o item
        const existingItem = response.data[existingIndex];
        const updated = { ...existingItem, ...updatedItem, id } as T;
        
        // Atualizar na lista
        const updatedData = [...response.data];
        updatedData[existingIndex] = updated;
        
        // Guardar no localStorage
        const storageKey = `${this.STORAGE_PREFIX}${entity}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedData));
        
        this.setLoading(loadingKey, false);
        return {
          data: updated,
          success: true,
          message: `${entity} updated successfully`
        };
      }),
      delay(this.DELAY_MS),
      catchError(error => {
        this.setLoading(loadingKey, false);
        return throwError(() => ({
          data: null as any,
          success: false,
          message: `Failed to update ${entity}: ${error.message}`
        }));
      })
    );
  }

  // DELETE - Remover registo
  delete<T extends { id: string }>(entity: string, id: string): Observable<ApiResponse<boolean>> {
    const loadingKey = `delete_${entity}_${id}`;
    this.setLoading(loadingKey, true);

    return this.getAll<T>(entity).pipe(
      map((response: ApiResponse<T[]>) => {
        const filteredData = response.data.filter(item => item.id !== id);
        
        if (filteredData.length === response.data.length) {
          throw new Error(`${entity} with id ${id} not found`);
        }
        
        // Guardar no localStorage
        const storageKey = `${this.STORAGE_PREFIX}${entity}`;
        localStorage.setItem(storageKey, JSON.stringify(filteredData));
        
        this.setLoading(loadingKey, false);
        return {
          data: true,
          success: true,
          message: `${entity} deleted successfully`
        };
      }),
      delay(this.DELAY_MS),
      catchError(error => {
        this.setLoading(loadingKey, false);
        return throwError(() => ({
          data: false,
          success: false,
          message: `Failed to delete ${entity}: ${error.message}`
        }));
      })
    );
  }

  // Utility: Gerar ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Utility: Reset local storage (útil para desenvolvimento)
  resetLocalStorage(): void {
    const entities = ['posts', 'categories', 'authors', 'comments', 'tags'];
    entities.forEach(entity => {
      const storageKey = `${this.STORAGE_PREFIX}${entity}`;
      localStorage.removeItem(storageKey);
    });
    this.initializeLocalStorage();
  }
}