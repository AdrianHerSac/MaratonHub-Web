import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Review } from '../../../core/models/media.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-review-list',
    imports: [CommonModule],
    template: `
    <div class="review-list">
      <h3>Opiniones ({{ reviews.length }})</h3>
      
      @if (reviews.length === 0) {
        <p class="no-reviews">Sé el primero en opinar</p>
      }

      <div class="reviews">
        @for (review of reviews; track review.id) {
          <div class="review-card">
            <div class="review-header">
              <div class="user-info">
                <div class="avatar">{{ review.userName.charAt(0).toUpperCase() }}</div>
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <h4>{{ review.userName }}</h4>
                    @if (canDelete(review)) {
                      <button (click)="onDelete(review.id)" 
                              class="delete-btn" 
                              title="Eliminar opinión"
                              style="background: none; border: none; color: rgba(255, 255, 255, 0.4); cursor: pointer; padding: 2px; display: flex; align-items: center; transition: color 0.2s;"
                              onmouseover="this.style.color='#f87171'"
                              onmouseout="this.style.color='rgba(255, 255, 255, 0.4)'">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px;">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    }
                  </div>
                  <p class="date">{{ formatDate(review.createdAt) }}</p>
                </div>
              </div>
              <div class="rating">
                @for (star of [1, 2, 3, 4, 5]; track star) {
                  <span [class.filled]="star <= review.rating">★</span>
                }
              </div>
            </div>
            <p class="comment">{{ review.comment }}</p>
          </div>
        }
      </div>
    </div>
  `,
    styles: [`
    .review-list {
      margin-top: 32px;
    }

    .review-list h3 {
      color: #fff;
      font-size: 1.5rem;
      margin-bottom: 20px;
    }

    .no-reviews {
      color: rgba(255, 255, 255, 0.6);
      text-align: center;
      padding: 40px;
      font-style: italic;
    }

    .reviews {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .review-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .review-card:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateX(4px);
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .user-info {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 1.2rem;
    }

    .user-info h4 {
      color: #fff;
      margin: 0;
      font-size: 1rem;
    }

    .date {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.85rem;
      margin: 4px 0 0 0;
    }

    .rating {
      display: flex;
      gap: 2px;
    }

    .rating span {
      color: rgba(255, 255, 255, 0.3);
      font-size: 1.2rem;
    }

    .rating span.filled {
      color: #ffd700;
    }

    .comment {
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6;
      margin: 0;
    }
  `]
})
export class ReviewListComponent {
    authService = inject(AuthService);

    @Input() reviews: Review[] = [];
    @Output() deleteReview = new EventEmitter<string>();

    isCurrentUser(userId: string): boolean {
        return userId === this.authService.currentUser()?.id;
    }

    canDelete(review: Review): boolean {
        return this.isCurrentUser(review.userId) || this.authService.isAdmin();
    }

    onDelete(id: string | undefined) {
        if (!id) return;
        if (confirm('¿Estás seguro de que deseas eliminar esta opinión?')) {
            this.deleteReview.emit(id);
        }
    }

    formatDate(date: Date): string {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;

        return d.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}
