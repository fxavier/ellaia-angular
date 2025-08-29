import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html'
})
export class CardComponent {
  hover = input(false);
  border = input(true);
  shadow = input(true);
  padding = input(true);
  header = input(false);
  footer = input(false);

  cardClasses = computed(() => {
    let classes = 'card bg-white rounded-lg';

    if (this.border()) {
      classes += ' border border-gray-200';
    }

    if (this.shadow()) {
      classes += ' shadow-sm';
    }

    if (this.hover()) {
      classes += ' hover:shadow-md transition-shadow duration-200';
    }

    return classes;
  });

  contentClasses = computed(() => {
    let contentClasses = '';
    if (this.padding()) {
      contentClasses += ' px-6 py-4';
    }
    return contentClasses;
  });
}