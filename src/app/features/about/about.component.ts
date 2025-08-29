import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { CardComponent } from '../../shared/components/ui/card.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, CardComponent],
  templateUrl: './about.component.html'
})
export class AboutComponent {
  teamMembers = [
    {
      id: '1',
      name: 'Ana Sofia Carvalho',
      role: 'Fundadora & CEO',
      bio: 'Especialista em liderança feminina e transformação digital com mais de 15 anos de experiência.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Beatriz Santos',
      role: 'Head of Technology',
      bio: 'Engenheira de software com paixão por diversidade e inclusão no setor tech.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'Carolina Mendoça',
      role: 'Especialista em Bem-estar',
      bio: 'Psicóloga especializada em bem-estar digital e saúde mental.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  ];
}