import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { BaseDataService, ApiResponse } from './base-data.service';

export interface ContactSubmission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  newsletter?: boolean;
  privacy: boolean;
  submittedAt: string;
  status: 'PENDING' | 'PROCESSED' | 'RESPONDED';
}

export interface CreateContactDto {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  newsletter?: boolean;
  privacy: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private baseService = inject(BaseDataService);
  private readonly ENTITY = 'contact-submissions';

  /**
   * Submit a contact form
   */
  submitContactForm(formData: CreateContactDto): Observable<ApiResponse<ContactSubmission>> {
    const submissionData: ContactSubmission = {
      ...formData,
      id: this.generateId(),
      submittedAt: new Date().toISOString(),
      status: 'PENDING'
    };

    // For demo purposes, we'll simulate successful submission
    // In a real app, this would send an email or store in a database
    return this.simulateSubmission(submissionData);
  }

  /**
   * Get all contact submissions (admin functionality)
   */
  getAllSubmissions(): Observable<ApiResponse<ContactSubmission[]>> {
    return this.baseService.getAll<ContactSubmission>(this.ENTITY);
  }

  /**
   * Get a specific submission by ID
   */
  getSubmissionById(id: string): Observable<ApiResponse<ContactSubmission | null>> {
    return this.baseService.getById<ContactSubmission>(this.ENTITY, id);
  }

  /**
   * Update submission status (admin functionality)
   */
  updateSubmissionStatus(
    id: string, 
    status: ContactSubmission['status']
  ): Observable<ApiResponse<ContactSubmission>> {
    return this.baseService.update<ContactSubmission>(this.ENTITY, id, { status });
  }

  /**
   * Check if service is loading
   */
  isLoading(key: string): boolean {
    return this.baseService.isLoading(key);
  }

  private generateId(): string {
    return 'contact_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private simulateSubmission(data: ContactSubmission): Observable<ApiResponse<ContactSubmission>> {
    // Simulate network delay and success
    return of({
      success: true,
      data,
      message: 'Mensagem enviada com sucesso! Entraremos em contacto em breve.'
    }).pipe(delay(1500)); // Simulate network delay
  }
}