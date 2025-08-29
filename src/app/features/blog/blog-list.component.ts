import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { CardComponent } from '../../shared/components/ui/card.component';
import { BadgeComponent } from '../../shared/components/ui/badge.component';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, CardComponent, BadgeComponent],
  templateUrl: './blog-list.component.html'
})
export class BlogListComponent implements OnInit {
  selectedCategory = signal<string>('');
  loading = signal(false);
  posts = signal<any[]>([]);
  filteredPosts = signal<any[]>([]);

  categories = [
    { slug: 'carreira', name: 'Carreira' },
    { slug: 'autocuidado', name: 'Autocuidado' },
    { slug: 'tecnologia-com-proposito', name: 'Tecnologia' },
    { slug: 'escrita-de-cura', name: 'Escrita de Cura' },
    { slug: 'feminismos-e-cultura', name: 'Feminismos' }
  ];

  mockPosts = [
    {
      id: '1',
      slug: 'lideranca-feminina-tech-2024',
      title: 'Liderança Feminina no Setor Tech: Desafios e Oportunidades em 2024',
      excerpt: 'Uma análise profunda sobre o cenário atual da liderança feminina na tecnologia e como podemos criar mais oportunidades.',
      coverImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop',
      categorySlug: 'carreira',
      categoryName: 'Carreira',
      readingTime: 8,
      publishedAt: '2024-08-28T10:00:00Z',
      author: {
        name: 'Beatriz Santos',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      }
    },
    {
      id: '2',
      slug: 'autocuidado-digital-burnout',
      title: 'Autocuidado Digital: Como Prevenir o Burnout na Era Digital',
      excerpt: 'Estratégias práticas para manter o equilíbrio entre a vida digital e o bem-estar pessoal.',
      coverImage: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop',
      categorySlug: 'autocuidado',
      categoryName: 'Autocuidado',
      readingTime: 6,
      publishedAt: '2024-08-26T09:00:00Z',
      author: {
        name: 'Carolina Mendoça',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      }
    },
    {
      id: '3',
      slug: 'ia-impacto-social-comunidades',
      title: 'IA com Impacto: Como a Tecnologia Pode Transformar Comunidades',
      excerpt: 'Explorando projetos de inteligência artificial que estão a criar mudanças positivas em comunidades vulneráveis.',
      coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
      categorySlug: 'tecnologia-com-proposito',
      categoryName: 'Tecnologia com Propósito',
      readingTime: 10,
      publishedAt: '2024-08-24T16:00:00Z',
      author: {
        name: 'Ana Sofia Carvalho',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      }
    }
  ];

  ngOnInit() {
    this.posts.set(this.mockPosts);
    this.updateFilteredPosts();
  }

  selectCategory(categorySlug: string) {
    this.selectedCategory.set(this.selectedCategory() === categorySlug ? '' : categorySlug);
    this.updateFilteredPosts();
  }

  clearFilters() {
    this.selectedCategory.set('');
    this.updateFilteredPosts();
  }

  private updateFilteredPosts() {
    const category = this.selectedCategory();
    if (!category) {
      this.filteredPosts.set(this.posts());
    } else {
      this.filteredPosts.set(
        this.posts().filter(post => post.categorySlug === category)
      );
    }
  }

  getCategoryVariant(categorySlug: string): 'primary' | 'secondary' {
    return ['carreira', 'a-voz-delas'].includes(categorySlug) ? 'primary' : 'secondary';
  }

  hasMorePosts(): boolean {
    return false; // For demo purposes
  }

  loadMorePosts() {
    this.loading.set(true);
    // Simulate API call
    setTimeout(() => {
      this.loading.set(false);
    }, 1000);
  }
}