import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html'
})
export class BadgeComponent {
  variant = input<BadgeVariant>('primary');
  size = input<BadgeSize>('md');
  rounded = input(false);

  badgeClasses = computed(() => {
    let classes = 'chip inline-flex items-center font-medium';

    // Size classes
    switch (this.size()) {
      case 'sm':
        classes += ' px-2 py-0.5 text-xs';
        break;
      case 'md':
        classes += ' px-2.5 py-0.5 text-xs';
        break;
      case 'lg':
        classes += ' px-3 py-1 text-sm';
        break;
    }

    // Variant classes
    switch (this.variant()) {
      case 'primary':
        classes += ' chip-primary';
        break;
      case 'secondary':
        classes += ' chip-secondary';
        break;
      case 'success':
        classes += ' bg-green-100 text-green-800';
        break;
      case 'warning':
        classes += ' bg-yellow-100 text-yellow-800';
        break;
      case 'danger':
        classes += ' bg-red-100 text-red-800';
        break;
      case 'info':
        classes += ' bg-blue-100 text-blue-800';
        break;
    }

    // Shape classes
    classes += this.rounded() ? ' rounded-full' : ' rounded';

    return classes;
  });
}