import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { CardComponent } from '../../shared/components/ui/card.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent],
  templateUrl: './services.component.html'
})
export class ServicesComponent {
  services = [
    {
      id: '1',
      title: 'Mentoria Individual',
      description: 'Acompanhamento personalizado focado nos teus objetivos específicos de carreira e liderança.',
      features: [
        'Sessões individuais semanais ou quinzenais',
        'Plano de desenvolvimento personalizado',
        'Acesso a recursos exclusivos',
        'Suporte por email entre sessões'
      ],
      cta: 'Saber Mais',
      iconBg: 'bg-ellaia-magenta/10',
      iconColor: 'text-ellaia-magenta',
      iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    },
    {
      id: '2',
      title: 'Programas de Grupo',
      description: 'Participa em programas estruturados com outras mulheres que partilham objetivos similares.',
      features: [
        'Grupos pequenos (máximo 8 participantes)',
        'Programa de 8-12 semanas',
        'Materiais didáticos incluídos',
        'Comunidade privada online'
      ],
      cta: 'Ver Programas',
      iconBg: 'bg-ellaia-coral/10',
      iconColor: 'text-ellaia-coral',
      iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    },
    {
      id: '3',
      title: 'Workshops & Masterclasses',
      description: 'Sessões intensivas sobre temas específicos ministradas por especialistas reconhecidas.',
      features: [
        'Temas especializados e atuais',
        'Formato online ou presencial',
        'Certificado de participação',
        'Materiais para download'
      ],
      cta: 'Próximos Eventos',
      iconBg: 'bg-ellaia-electric/10',
      iconColor: 'text-ellaia-electric',
      iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
    },
    {
      id: '4',
      title: 'Consultoria Organizacional',
      description: 'Apoiamos empresas na criação de ambientes mais inclusivos e no desenvolvimento de lideranças femininas.',
      features: [
        'Diagnóstico organizacional',
        'Programas de diversidade e inclusão',
        'Formação para equipas de liderança',
        'Acompanhamento e medição de resultados'
      ],
      cta: 'Falar com Especialista',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
    }
  ];

  processSteps = [
    {
      number: '1',
      title: 'Diagnóstico',
      description: 'Avaliamos a tua situação atual, objetivos e desafios específicos.'
    },
    {
      number: '2',
      title: 'Planeamento',
      description: 'Criamos um plano personalizado com metas claras e métricas de sucesso.'
    },
    {
      number: '3',
      title: 'Execução',
      description: 'Implementamos o plano com acompanhamento contínuo e ajustes quando necessário.'
    }
  ];
}