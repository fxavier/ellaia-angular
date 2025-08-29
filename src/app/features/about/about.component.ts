import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { CardComponent } from '../../shared/components/ui/card.component';
import { AuthorsService } from '../../core/services/authors.service';
import { Author } from '../../shared/models';

interface TeamMember extends Author {
  displayRole?: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, CardComponent],
  templateUrl: './about.component.html'
})
export class AboutComponent implements OnInit {
  private authorsService = inject(AuthorsService);

  teamMembers = signal<TeamMember[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadTeamMembers();
  }

  loadTeamMembers() {
    this.loading.set(true);
    this.error.set(null);

    this.authorsService.getTeamMembers().subscribe({
      next: (response) => {
        if (response.success) {
          // Mapear roles para display names mais amigáveis
          const membersWithDisplayRole = response.data.map(member => ({
            ...member,
            displayRole: this.getDisplayRole(member.role)
          }));

          this.teamMembers.set(membersWithDisplayRole);
        } else {
          this.error.set(response.message || 'Erro ao carregar membros da equipa');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading team members:', error);
        this.error.set('Erro ao carregar membros da equipa');
        this.loading.set(false);
      }
    });
  }

  private getDisplayRole(role: Author['role']): string {
    const roleMap: Record<Author['role'], string> = {
      'ADMIN': 'Fundadora & CEO',
      'EDITOR': 'Editora',
      'AUTHOR': 'Autora',
      'READER': 'Leitora'
    };
    return roleMap[role] || role;
  }

  // Getter para verificar se está carregando
  get isLoadingTeam(): boolean {
    return this.authorsService.isLoading('get', 'authors') || this.loading();
  }
}