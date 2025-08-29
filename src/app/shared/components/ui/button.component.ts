import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html'
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  disabled = input(false);
  loading = input(false);
  type = input<'button' | 'submit' | 'reset'>('button');
  fullWidth = input(false);

  buttonClasses = computed(() => {
    const baseClasses = 'btn focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200';
    
    let variantClasses = '';
    switch (this.variant()) {
      case 'primary':
        variantClasses = 'btn-primary';
        break;
      case 'secondary':
        variantClasses = 'btn-secondary';
        break;
      case 'outline':
        variantClasses = 'btn-outline';
        break;
      case 'ghost':
        variantClasses = 'text-ellaia-ink hover:bg-ellaia-stone';
        break;
    }

    let sizeClasses = '';
    switch (this.size()) {
      case 'sm':
        sizeClasses = 'px-3 py-1.5 text-sm';
        break;
      case 'md':
        sizeClasses = 'px-4 py-2 text-sm';
        break;
      case 'lg':
        sizeClasses = 'px-6 py-3 text-base';
        break;
    }

    const widthClasses = this.fullWidth() ? 'w-full' : '';

    return `${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses}`.trim();
  });

  handleClick() {
    if (!this.disabled() && !this.loading()) {
      // Let the click event bubble up naturally
    }
  }
}