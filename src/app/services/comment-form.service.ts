import { Injectable, signal } from '@angular/core';


/**
 * Service for managing comment form state
 */
@Injectable({
  providedIn: 'root',
})
export class CommentFormService {
  private readonly authorSignal = signal<string>('');
  private readonly contentSignal = signal<string>('');
  private readonly isSubmittingSignal = signal<boolean>(false);

  readonly author = this.authorSignal.asReadonly();
  readonly content = this.contentSignal.asReadonly();
  readonly isSubmitting = this.isSubmittingSignal.asReadonly();

  /**
   * Update author name
   */
  updateAuthor(author: string): void {
    const data = author;
    this.authorSignal.set(data);
  }

  /**
   * Update comment content
   */
  updateContent(content: string): void {
    this.contentSignal.set(content);
  }

  /**
   * Set submitting state
   */
  setSubmitting(value: boolean): void {
    this.isSubmittingSignal.set(value);
  }

  /**
   * Reset form
   */
  resetForm(): void {
    this.authorSignal.set('');
    this.contentSignal.set('');
    this.isSubmittingSignal.set(false);
  }

  /**
   * Validate form
   */
  isValid(): boolean {
    return this.author().trim().length > 0 && this.content().trim().length > 0;
  }
}
