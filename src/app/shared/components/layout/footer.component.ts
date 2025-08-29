import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../ui/button.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './footer.component.html'
})
export class FooterComponent {}