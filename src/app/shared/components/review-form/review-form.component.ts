import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-review-form',
    imports: [CommonModule, FormsModule],
    template: `
    <div class="review-form">
      <h3>Escribe tu opinión</h3>
      
      <div class="form-group">
        <label for="userName">Tu nombre</label>
        <input 
          id="userName"
          type="text" 
          [(ngModel)]="userName" 
          placeholder="Ingresa tu nombre"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label>Calificación</label>
        <div class="rating-selector">
          @for (star of [1, 2, 3, 4, 5]; track star) {
            <button type="button" class="star-button" [class.active]="star <= rating" (click)="setRating(star)">★</button>
          }
        </div>
      </div>

      <div class="form-group">
        <label for="comment">Comentario</label>
        <textarea
         id="comment"
          [(ngModel)]="comment"
          placeholder="Comparte tu opinión..."
          rows="4"
          class="form-textarea"
        ></textarea>
      </div>

      <button class="submit-button" (click)="submitReview()" [disabled]="!isValid()">Publicar opinión</button>

    </div>`,
    styles: [`
    .review-form {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .review-form h3 {
      color: #fff;
      margin-bottom: 20px;
      font-size: 1.5rem;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      color: #fff;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .form-input {
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.3);
      color: #fff;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #9333ea;
      box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
    }

    .rating-selector {
      display: flex;
      gap: 8px;
    }

    .star-button {
      background: none;
      border: none;
      font-size: 2rem;
      color: rgba(255, 255, 255, 0.3);
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 0;
    }

    .star-button:hover {
      transform: scale(1.2);
      color: rgba(255, 215, 0, 0.8);
    }

    .star-button.active {
      color: #ffd700;
    }

    .form-textarea {
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.3);
      color: #fff;
      font-size: 1rem;
      resize: vertical;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .form-textarea:focus {
      outline: none;
      border-color: #9333ea;
      box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
    }

    .submit-button {
      background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 100%;
    }

    .submit-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(147, 51, 234, 0.4);
    }

    .submit-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ReviewFormComponent {
    @Input() mediaId!: number;
    @Input() mediaType!: 'Movie' | 'TvShow' | 'Person';
    @Output() reviewSubmitted = new EventEmitter<{
        userName: string;
        rating: number;
        comment: string;
    }>();

    userName = '';
    rating = 0;
    comment = '';

    setRating(stars: number) {
        this.rating = stars;
    }

    isValid(): boolean {
        return this.userName.trim().length > 0 &&
            this.rating > 0 &&
            this.comment.trim().length > 0;
    }

    submitReview() {
        if (this.isValid()) {
            this.reviewSubmitted.emit({
                userName: this.userName,
                rating: this.rating,
                comment: this.comment
            });

            // Reset form
            this.userName = '';
            this.rating = 0;
            this.comment = '';
        }
    }
}
