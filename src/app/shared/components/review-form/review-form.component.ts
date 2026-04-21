import { Component, EventEmitter, Output, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-review-form',
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div class="review-form">
      <h3>Escribe tu opinión</h3>
      
      @if (authService.isLoggedIn()) {
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
      } @else {
        <div class="login-prompt">
          <p>Debes iniciar sesión para valorar.</p>
          <a routerLink="/login" class="login-btn">Ir al Login</a>
        </div>
      }
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

    .login-prompt {
      text-align: center;
      padding: 2rem 0;
    }

    .login-prompt p {
      color: #fff;
      margin-bottom: 1rem;
    }

    .login-btn {
      display: inline-block;
      background: #9333ea;
      color: white;
      padding: 0.5rem 1.5rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: background 0.2s;
    }

    .login-btn:hover {
      background: #7e22ce;
    }
  `]
})
export class ReviewFormComponent {
    authService = inject(AuthService);

    @Input() mediaId!: number;
    @Input() mediaType!: 'Movie' | 'TvShow' | 'Person';
    @Output() reviewSubmitted = new EventEmitter<{
        rating: number;
        comment: string;
    }>();

    rating = 0;
    comment = '';

    setRating(stars: number) {
        this.rating = stars;
    }

    isValid(): boolean {
        return this.rating > 0 &&
            this.comment.trim().length > 0;
    }

    submitReview() {
        if (this.isValid()) {
            this.reviewSubmitted.emit({
                rating: this.rating,
                comment: this.comment
            });

            // Reset form
            this.rating = 0;
            this.comment = '';
        }
    }
}
