import { Component, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ReviewService } from '../../core/services/review.service';
import { Review } from '../../core/models/media.model';

@Component({
  selector: 'app-mi-lista',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mi-lista.html',
  styleUrl: './mi-lista.css',
})
export class MiListaComponent {
  reviews: Review[] = [];
  loading = true;
  error = false;

  constructor(
    public authService: AuthService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {
    // Cargar y actualizar las valoraciones de forma reactiva cuando el usuario cambie (por ejemplo, tras el login de Google)
    effect(() => {
      this.loadReviews();
    });
  }

  loadReviews() {
    const username = this.authService.currentUser()?.username;
    if (username) {
      this.loading = true;
      this.cdr.markForCheck();
      this.reviewService.getReviewsByUser(username).subscribe({
        next: (reviews) => {
          this.reviews = reviews.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = true;
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.reviews = [];
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  getMediaRoute(review: Review): string {
    if (review.mediaType === 'Movie') return `/movie/${review.mediaId}`;
    if (review.mediaType === 'TvShow') return `/tv/${review.mediaId}`;
    return `/person/${review.mediaId}`;
  }

  getMediaTypeLabel(mediaType: string): string {
    if (mediaType === 'Movie') return 'Película';
    if (mediaType === 'TvShow') return 'Serie';
    return 'Persona';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  get movieReviews(): Review[] {
    return this.reviews.filter(r => r.mediaType === 'Movie');
  }

  get tvReviews(): Review[] {
    return this.reviews.filter(r => r.mediaType === 'TvShow');
  }

  get averageRating(): number {
    if (this.reviews.length === 0) return 0;
    return this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
  }
}
