import { Component, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ReviewService } from '../../core/services/review.service';
import { TmdbApiService } from '../../core/services/tmdb-api.service';
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
  mediaTitles = new Map<string, string>();

  constructor(
    public authService: AuthService,
    private reviewService: ReviewService,
    private tmdbService: TmdbApiService,
    private cdr: ChangeDetectorRef
  ) {
    // Cargar y actualizar las valoraciones de forma reactiva cuando el usuario cambie
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
          this.hydrateReviews(this.reviews);
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

  hydrateReviews(reviews: Review[]) {
    reviews.forEach(review => {
      const cacheKey = `${review.mediaType}_${review.mediaId}`;
      if (this.mediaTitles.has(cacheKey)) return;

      // Colocar un texto de carga temporal
      this.mediaTitles.set(cacheKey, 'Cargando título...');

      if (review.mediaType === 'Movie') {
        this.tmdbService.getMovieDetails(review.mediaId).subscribe({
          next: (movie) => {
            this.mediaTitles.set(cacheKey, movie.title);
            this.cdr.markForCheck();
          },
          error: () => {
            this.mediaTitles.set(cacheKey, `Película (ID: ${review.mediaId})`);
            this.cdr.markForCheck();
          }
        });
      } else if (review.mediaType === 'TvShow') {
        this.tmdbService.getTvShowDetails(review.mediaId).subscribe({
          next: (show) => {
            this.mediaTitles.set(cacheKey, show.name);
            this.cdr.markForCheck();
          },
          error: () => {
            this.mediaTitles.set(cacheKey, `Serie (ID: ${review.mediaId})`);
            this.cdr.markForCheck();
          }
        });
      } else if (review.mediaType === 'Person') {
        this.tmdbService.getPersonDetails(review.mediaId).subscribe({
          next: (person) => {
            this.mediaTitles.set(cacheKey, person.name);
            this.cdr.markForCheck();
          },
          error: () => {
            this.mediaTitles.set(cacheKey, `Celebridad (ID: ${review.mediaId})`);
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  getMediaTitle(review: Review): string {
    const cacheKey = `${review.mediaType}_${review.mediaId}`;
    return this.mediaTitles.get(cacheKey) || 'Cargando título...';
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
