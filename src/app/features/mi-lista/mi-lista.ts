import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ReviewService } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { TmdbApiService } from '../../core/services/tmdb-api.service';
import { Review } from '../../core/models/media.model';

interface RatedMedia {
  review: Review;
  title: string;
  posterUrl: string;
}

@Component({
  selector: 'app-mi-lista',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mi-lista.html',
  styleUrl: './mi-lista.css'
})
export class MiListaComponent implements OnInit {
  ratedItems: RatedMedia[] = [];
  isLoading = true;

  constructor(
    private reviewService: ReviewService,
    public authService: AuthService,
    private tmdbService: TmdbApiService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.username) {
      this.loadUserReviews(user.username);
    } else {
      this.isLoading = false;
    }
  }

  loadUserReviews(username: string) {
    this.reviewService.getReviewsByUser(username).pipe(
      switchMap(reviews => {
        if (!reviews || reviews.length === 0) {
          return of([]);
        }
        
        const mediaRequests = reviews.map(review => {
          if (review.mediaType === 'Movie') {
            return this.tmdbService.getMovieDetails(review.mediaId).pipe(
              map(movie => ({
                review,
                title: movie.title,
                posterUrl: this.tmdbService.getImageUrl(movie.posterPath || '')
              }))
            );
          } else if (review.mediaType === 'TvShow') {
             return this.tmdbService.getTvShowDetails(review.mediaId).pipe(
              map(tvShow => ({
                review,
                title: tvShow.name,
                posterUrl: this.tmdbService.getImageUrl(tvShow.posterPath || '')
              }))
            );
          }
          return of(null);
        });

        return forkJoin(mediaRequests);
      })
    ).subscribe({
      next: (results) => {
        this.ratedItems = results.filter(item => item !== null) as RatedMedia[];
        // Ordenar por las valoraciones más recientes
        this.ratedItems.sort((a, b) => {
           return new Date(b.review.createdAt).getTime() - new Date(a.review.createdAt).getTime();
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.isLoading = false;
      }
    });
  }
}
