import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/layout/header.component';
import { FooterComponent } from './shared/components/layout/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-header></app-header>
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `
})
export class App {}
