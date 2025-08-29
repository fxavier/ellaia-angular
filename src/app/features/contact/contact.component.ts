import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { CardComponent } from '../../shared/components/ui/card.component';
import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, CardComponent],
  templateUrl: './contact.component.html'
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);
  
  submitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal<string | null>(null);
  contactForm: FormGroup;

  faqs = [
    {
      question: 'Quanto tempo demora uma resposta?',
      answer: 'Respondemos em até 24 horas durante os dias úteis.'
    },
    {
      question: 'Oferecem consultas gratuitas?',
      answer: 'Sim, oferecemos uma sessão de descoberta gratuita de 30 minutos.'
    },
    {
      question: 'Trabalham com empresas?',
      answer: 'Sim, oferecemos serviços de consultoria organizacional.'
    }
  ];

  constructor() {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      newsletter: [false],
      privacy: [false, [Validators.requiredTrue]]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.submitting.set(true);
      this.submitError.set(null);
      this.submitSuccess.set(false);

      const formData = this.contactForm.value;
      
      this.contactService.submitContactForm(formData).subscribe({
        next: (response) => {
          this.submitting.set(false);
          if (response.success) {
            this.submitSuccess.set(true);
            this.contactForm.reset();
            // Reset form state
            Object.keys(this.contactForm.controls).forEach(key => {
              const control = this.contactForm.get(key);
              control?.setErrors(null);
              control?.markAsUntouched();
            });
          } else {
            this.submitError.set(response.message || 'Erro ao enviar mensagem');
          }
        },
        error: (error) => {
          console.error('Error submitting contact form:', error);
          this.submitting.set(false);
          this.submitError.set('Erro ao enviar mensagem. Tenta novamente.');
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach(key => {
        const control = this.contactForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  // Reset success/error states when user starts typing again
  onFormChange() {
    if (this.submitSuccess() || this.submitError()) {
      this.submitSuccess.set(false);
      this.submitError.set(null);
    }
  }
}