import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { CardComponent } from '../../shared/components/ui/card.component';
import { BadgeComponent } from '../../shared/components/ui/badge.component';
import { PostsService } from '../../core/services/posts.service';
import { CategoriesService } from '../../core/services/categories.service';
import { Post, Category } from '../../shared/models';
import { ApiResponse } from '../../core/services/base-data.service';

interface BlogPost extends Post {
  categoryName?: string;
  authorName?: string;
}

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, CardComponent, BadgeComponent],
  templateUrl: './blog-list.component.html'
})
export class BlogListComponent implements OnInit {
  private postsService = inject(PostsService);
  private categoriesService = inject(CategoriesService);

  // State signals for reactivity in the component
  // Using Angular's signal for state management

  selectedCategory = signal<string>('');
  loading = signal(true);
  error = signal<string | null>(null);
  
  posts = signal<BlogPost[]>([]);
  filteredPosts = signal<BlogPost[]>([]);
  categories = signal<Category[]>([]);
  
  currentPage = signal(1);
  postsPerPage = 6;
  totalPosts = signal(0);
  hasMorePosts = signal(false);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    // Load categories first, then posts
    this.categoriesService.getAllCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories.set(response.data);
          this.loadPosts();
        } else {
          this.error.set('Erro ao carregar categorias');
          this.loading.set(false);
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error.set('Erro ao carregar categorias');
        this.loading.set(false);
      }
    });
  }

  private loadPosts() {
    const filters = {
      status: 'PUBLISHED' as const,
      limit: this.postsPerPage * this.currentPage(),
      offset: 0,
      categoryId: this.selectedCategory() || undefined
    };

    this.postsService.getPostsFiltered(filters).subscribe({
      next: (response: ApiResponse<Post[]>) => {
        if (response.success) {
          const postsWithMetadata = response.data.map((post: Post) => {
            const category = this.categories().find(cat => cat.id === post.categoryId);
            return {
              ...post,
              categoryName: category?.name || 'Sem Categoria',
              authorName: post.authorId // TODO: Load author names
            } as BlogPost;
          });

          this.posts.set(postsWithMetadata);
          this.updateFilteredPosts();
          
          // Update pagination info
          this.totalPosts.set(response.data.length);
          this.hasMorePosts.set(response.data.length >= this.postsPerPage * this.currentPage());
        } else {
          this.error.set(response.message || 'Erro ao carregar posts');
        }
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading posts:', error);
        this.error.set('Erro ao carregar posts');
        this.loading.set(false);
      }
    });
  }

  selectCategory(categoryId: string) {
    const currentSelected = this.selectedCategory();
    this.selectedCategory.set(currentSelected === categoryId ? '' : categoryId);
    this.currentPage.set(1); // Reset pagination
    this.loadPosts();
  }

  clearFilters() {
    this.selectedCategory.set('');
    this.currentPage.set(1);
    this.loadPosts();
  }

  private updateFilteredPosts() {
    const category = this.selectedCategory();
    if (!category) {
      this.filteredPosts.set(this.posts());
    } else {
      this.filteredPosts.set(
        this.posts().filter(post => post.categoryId === category)
      );
    }
  }

  getCategoryVariant(categorySlug: string): 'primary' | 'secondary' {
    return ['carreira', 'a-voz-delas'].includes(categorySlug) ? 'primary' : 'secondary';
  }

  loadMorePosts() {
    if (this.loading()) return;
    
    this.currentPage.set(this.currentPage() + 1);
    this.loadPosts();
  }

  // Retry method for error state
  retryLoad() {
    this.currentPage.set(1);
    this.selectedCategory.set('');
    this.loadData();
  }
}