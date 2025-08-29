import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { CardComponent } from '../../shared/components/ui/card.component';
import { BadgeComponent } from '../../shared/components/ui/badge.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, CardComponent, BadgeComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  featuredPosts = [
    {
      id: '1',
      slug: 'lideranca-feminina-tech-2024',
      title: 'Liderança Feminina no Setor Tech: Desafios e Oportunidades em 2024',
      excerpt: 'Uma análise profunda sobre o cenário atual da liderança feminina na tecnologia e como podemos criar mais oportunidades.',
      coverImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop',
      category: 'Carreira',
      readingTime: 8,
      publishedAt: '2024-08-28T10:00:00Z'
    },
    {
      id: '2',
      slug: 'autocuidado-digital-burnout',
      title: 'Autocuidado Digital: Como Prevenir o Burnout na Era Digital',
      excerpt: 'Estratégias práticas para manter o equilíbrio entre a vida digital e o bem-estar pessoal.',
      coverImage: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop',
      category: 'Autocuidado',
      readingTime: 6,
      publishedAt: '2024-08-26T09:00:00Z'
    },
    {
      id: '3',
      slug: 'ia-impacto-social-comunidades',
      title: 'IA com Impacto: Como a Tecnologia Pode Transformar Comunidades',
      excerpt: 'Explorando projetos de inteligência artificial que estão a criar mudanças positivas em comunidades vulneráveis.',
      coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
      category: 'Tecnologia',
      readingTime: 10,
      publishedAt: '2024-08-24T16:00:00Z'
    }
  ];
}