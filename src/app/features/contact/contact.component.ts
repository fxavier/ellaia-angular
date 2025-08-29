import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { CardComponent } from '../../shared/components/ui/card.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, CardComponent],
  templateUrl: './contact.component.html'
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  
  submitting = signal(false);
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
      
      // Simulate form submission
      setTimeout(() => {
        this.submitting.set(false);
        alert('Mensagem enviada com sucesso! Entraremos em contacto em breve.');
        this.contactForm.reset();
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach(key => {
        const control = this.contactForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}