import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Review } from '../../../core/models/media.model';

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
                  <h4>{{ review.userName }}</h4>
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
    @Input() reviews: Review[] = [];

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
