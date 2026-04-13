import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { combineLatest } from 'rxjs';
import { TmdbApiService } from '../../core/services/tmdb-api.service';
import { ReviewService } from '../../core/services/review.service';
import { Movie, TvShow, Person, Review } from '../../core/models/media.model';
import { ReviewFormComponent } from '../../shared/components/review-form/review-form.component';
import { ReviewListComponent } from '../../shared/components/review-list/review-list.component';

@Component({
  selector: 'app-media-detail',
  imports: [CommonModule, RouterModule, ReviewFormComponent, ReviewListComponent],
  templateUrl: './media-detail.html',
  styleUrl: './media-detail.css'
})
export class MediaDetailComponent implements OnInit {
  mediaType: 'movie' | 'tv' | 'person' = 'movie';
  mediaId!: number;
  media: Movie | TvShow | Person | null = null;
  reviews: Review[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private tmdbService: TmdbApiService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    combineLatest([this.route.url, this.route.params]).subscribe(([urlSegments, params]) => {
      if (urlSegments.length > 0) {
        this.mediaType = urlSegments[0].path as 'movie' | 'tv' | 'person';
      }
      this.mediaId = +params['id'];
      this.loadMediaDetails();
      this.loadReviews();
    });
  }

  loadMediaDetails() {
    this.loading = true;

    if (this.mediaType === 'movie') {
      this.tmdbService.getMovieDetails(this.mediaId).subscribe({
        next: (data) => {
          this.media = data;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading movie:', err);
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
    } else if (this.mediaType === 'tv') {
      this.tmdbService.getTvShowDetails(this.mediaId).subscribe({
        next: (data) => {
          this.media = data;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading TV show:', err);
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
    } else if (this.mediaType === 'person') {
      this.tmdbService.getPersonDetails(this.mediaId).subscribe({
        next: (data) => {
          this.media = data;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading person:', err);
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  loadReviews() {
    const mediaTypeMap = { 'movie': 'Movie', 'tv': 'TvShow', 'person': 'Person' };
    this.reviewService.getReviewsByMedia(mediaTypeMap[this.mediaType], this.mediaId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading reviews:', err)
    });
  }

  onReviewSubmitted(reviewData: { userName: string; rating: number; comment: string }) {
    const mediaTypeMap = { 'movie': 'Movie', 'tv': 'TvShow', 'person': 'Person' };

    this.reviewService.createReview({
      mediaId: this.mediaId,
      mediaType: mediaTypeMap[this.mediaType] as 'Movie' | 'TvShow' | 'Person',
      ...reviewData
    }).subscribe({
      next: () => this.loadReviews(),
      error: (err) => console.error('Error creating review:', err)
    });
  }

  getTitle(): string {
    if (!this.media) return '';
    if ('title' in this.media) return this.media.title;
    if ('name' in this.media) return this.media.name;
    return '';
  }

  getBackdropUrl(): string {
    if (!this.media) return '';
    const path = 'backdropPath' in this.media ? this.media.backdropPath : undefined;
    return this.tmdbService.getImageUrl(path || '', 'original');
  }

  getPosterUrl(): string {
    if (!this.media) return '';
    const path = 'posterPath' in this.media ? this.media.posterPath :
      'profilePath' in this.media ? this.media.profilePath : undefined;
    return this.tmdbService.getImageUrl(path || '', 'w500');
  }

  isMovie(media: any): media is Movie {
    return 'title' in media;
  }

  isTvShow(media: any): media is TvShow {
    return 'name' in media && 'firstAirDate' in media;
  }

  isPerson(media: any): media is Person {
    return 'biography' in media;
  }

  getAverageUserRating(): number {
    if (!this.reviews || this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / this.reviews.length;
  }

  getUserRatingCount(): number {
    return this.reviews ? this.reviews.length : 0;
  }

  getUserRatingStars(): number[] {
    return [1, 2, 3, 4, 5];
  }
}
