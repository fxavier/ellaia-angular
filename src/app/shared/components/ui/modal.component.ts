import { Component, input, output, computed, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './modal.component.html'
})
export class ModalComponent {
  isOpen = input(false);
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  closable = input(true);
  closeOnBackdrop = input(true);
  showHeader = input(true);
  showFooter = input(false);

  onClose = output<void>();

  @ViewChild('backdrop') backdrop!: ElementRef;
  @ViewChild('modal') modal!: ElementRef;

  modalSizeClasses = computed(() => {
    let classes = '';
    switch (this.size()) {
      case 'sm':
        classes = 'sm:max-w-sm';
        break;
      case 'md':
        classes = 'sm:max-w-lg';
        break;
      case 'lg':
        classes = 'sm:max-w-2xl';
        break;
      case 'xl':
        classes = 'sm:max-w-4xl';
        break;
    }
    return classes;
  });

  close() {
    this.onClose.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (this.closeOnBackdrop() && event.target === this.backdrop.nativeElement) {
      this.close();
    }
  }
}