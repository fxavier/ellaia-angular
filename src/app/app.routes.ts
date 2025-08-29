import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'sobre',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'voz-delas',
    loadComponent: () => import('./features/blog/blog-list.component').then(m => m.BlogListComponent)
  },
  {
    path: 'servicos',
    loadComponent: () => import('./features/services/services.component').then(m => m.ServicesComponent)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
