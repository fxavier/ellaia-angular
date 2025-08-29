import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { CardComponent } from '../../shared/components/ui/card.component';
import { BadgeComponent } from '../../shared/components/ui/badge.component';
import { PostsService } from '../../core/services/posts.service';
import { CategoriesService } from '../../core/services/categories.service';
import { Post, Category } from '../../shared/models';

interface FeaturedPost extends Post {
  categoryName?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, CardComponent, BadgeComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private postsService = inject(PostsService);
  private categoriesService = inject(CategoriesService);

  featuredPosts = signal<FeaturedPost[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadFeaturedPosts();
  }

  loadFeaturedPosts() {
    this.loading.set(true);
    this.error.set(null);

    // Carregar posts em destaque
    this.postsService.getFeaturedPosts(3).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadCategoryNames(response.data);
        } else {
          this.error.set(response.message || 'Erro ao carregar posts em destaque');
          this.loading.set(false);
        }
      },
      error: (error) => {
        console.error('Error loading featured posts:', error);
        this.error.set('Erro ao carregar posts em destaque');
        this.loading.set(false);
      }
    });
  }

  private loadCategoryNames(posts: Post[]) {
    // Carregar nomes das categorias
    this.categoriesService.getAllCategories().subscribe({
      next: (response) => {
        if (response.success) {
          const categories = response.data;
          const postsWithCategoryNames = posts.map(post => {
            const category = categories.find(cat => cat.id === post.categoryId);
            return {
              ...post,
              categoryName: category?.name || 'Sem Categoria'
            } as FeaturedPost;
          });

          this.featuredPosts.set(postsWithCategoryNames);
        } else {
          // Mesmo que não carregue categorias, mostrar os posts
          this.featuredPosts.set(posts.map(post => ({
            ...post,
            categoryName: 'Sem Categoria'
          })));
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        // Mesmo com erro nas categorias, mostrar os posts
        this.featuredPosts.set(posts.map(post => ({
          ...post,
          categoryName: 'Sem Categoria'
        })));
        this.loading.set(false);
      }
    });
  }

  // Getter para verificar se está carregando
  get isLoadingPosts(): boolean {
    return this.postsService.isLoading('get', 'posts') || this.loading();
  }
}