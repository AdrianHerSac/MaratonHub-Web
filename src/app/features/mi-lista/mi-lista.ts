import { Component, OnInit } from '@angular/core';
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
export class MiListaComponent implements OnInit {
  reviews: Review[] = [];
  loading = true;
  error = false;
  fixStatus: 'idle' | 'loading' | 'done' | 'error' = 'idle';
  fixMessage = '';
  debugClaims: any = null;

  constructor(
    public authService: AuthService,
    private reviewService: ReviewService
  ) {}

  ngOnInit() {
    this.loadReviews();
  }

  loadReviews() {
    const username = this.authService.currentUser()?.username;
    if (username) {
      this.loading = true;
      this.reviewService.getReviewsByUser(username).subscribe({
        next: (reviews) => {
          this.reviews = reviews.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.loading = false;
        },
        error: () => {
          this.error = true;
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  fixUnknownReviews() {
    this.fixStatus = 'loading';
    this.reviewService.fixUnknownReviews().subscribe({
      next: (res) => {
        this.fixStatus = 'done';
        this.fixMessage = res.message;
        this.loadReviews();
      },
      error: (err) => {
        this.fixStatus = 'error';
        this.fixMessage = 'Error: ' + (err.error?.message || err.message);
      }
    });
  }

  showDebugClaims() {
    this.reviewService.debugClaims().subscribe({
      next: (data) => {
        this.debugClaims = data;
        console.log('DEBUG CLAIMS:', JSON.stringify(data, null, 2));
        alert('Claims en consola del navegador (F12):\n' + JSON.stringify(data.claims, null, 2));
      },
      error: (err) => console.error('Error debug claims:', err)
    });
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

  getStars(rating: number): number[] {
    return [1, 2, 3, 4, 5];
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
