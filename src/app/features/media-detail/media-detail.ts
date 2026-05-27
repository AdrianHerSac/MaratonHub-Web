import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { combineLatest, Subscription } from 'rxjs';
import { TmdbApiService } from '../../core/services/tmdb-api.service';
import { ReviewService } from '../../core/services/review.service';
import { SignalRService } from '../../core/services/signalr.service';
import { Movie, TvShow, Person, Review, Video, CastMember } from '../../core/models/media.model';
import { ReviewFormComponent } from '../../shared/components/review-form/review-form.component';
import { ReviewListComponent } from '../../shared/components/review-list/review-list.component';

@Component({
  selector: 'app-media-detail',
  imports: [CommonModule, RouterModule, ReviewFormComponent, ReviewListComponent],
  templateUrl: './media-detail.html',
  styleUrl: './media-detail.css'
})
export class MediaDetailComponent implements OnInit, OnDestroy {
  mediaType: 'movie' | 'tv' | 'person' = 'movie';
  mediaId!: number;
  media: Movie | TvShow | Person | null = null;
  reviews: Review[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private tmdbService: TmdbApiService,
    private reviewService: ReviewService,
    private signalRService: SignalRService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private location: Location,
    private ngZone: NgZone
  ) { }

  private signalRSub?: Subscription;
  private pollInterval: any;
  private lastReviewCount = 0;
  private lastReviewIds = new Set<string>();

  goBack() {
    this.location.back();
  }

  ngOnInit() {
    combineLatest([this.route.url, this.route.params]).subscribe(([urlSegments, params]) => {
      if (urlSegments.length > 0) {
        this.mediaType = urlSegments[0].path as 'movie' | 'tv' | 'person';
      }
      this.mediaId = +params['id'];
      this.loadMediaDetails();
      this.loadReviews();
      this.startPolling();
    });

    // SignalR como canal extra (si está disponible)
    this.signalRSub = this.signalRService.onReviewUpdate.subscribe((data) => {
      if (data && data.mediaId === this.mediaId) {
        const mediaTypeMap: Record<string, string> = { 'movie': 'Movie', 'tv': 'TvShow', 'person': 'Person' };
        if (data.mediaType === mediaTypeMap[this.mediaType]) {
          this.loadReviews();
        }
      }
    });
  }

  private startPolling() {
    this.stopPolling();
    // Polling cada 8 segundos fuera de la zona Angular para no sobrecargar la detección de cambios
    this.ngZone.runOutsideAngular(() => {
      this.pollInterval = setInterval(() => {
        const mediaTypeMap: Record<string, string> = { 'movie': 'Movie', 'tv': 'TvShow', 'person': 'Person' };
        const dbType = mediaTypeMap[this.mediaType];
        this.reviewService.getReviewsByMedia(dbType, this.mediaId).subscribe({
          next: (reviews) => {
            // Solo actualizar si hay cambios reales (nuevas reseñas o cambios en las existentes)
            const newIds = new Set(reviews.map((r: Review) => r.id ?? ''));
            const hasChanges =
              reviews.length !== this.lastReviewCount ||
              reviews.some((r: Review) => !this.lastReviewIds.has(r.id ?? ''));

            if (hasChanges) {
              this.ngZone.run(() => {
                this.reviews = reviews;
                this.lastReviewCount = reviews.length;
                this.lastReviewIds = newIds;
                this.cdr.detectChanges();
              });
            }
          }
        });
      }, 8000);
    });
  }

  private stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  ngOnDestroy() {
    this.stopPolling();
    this.signalRSub?.unsubscribe();
  }

  loadMediaDetails() {
    this.loading = true;

    if (this.mediaType === 'movie') {
      this.tmdbService.getMovieDetails(this.mediaId).subscribe({
        next: (data) => {
          this.media = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading movie:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else if (this.mediaType === 'tv') {
      this.tmdbService.getTvShowDetails(this.mediaId).subscribe({
        next: (data) => {
          this.media = data;
          this.loading = false;
          
          if (this.media.seasons && this.media.seasons.length > 0) {
            const items = this.media.seasons.map(s => ({ mediaId: s.id, mediaType: 'Season' }));
            this.reviewService.getBatchAverages(items).subscribe({
              next: (avgs) => {
                (this.media as TvShow).seasons!.forEach(s => {
                  s.appRating = avgs[`Season_${s.id}`];
                });
                this.cdr.detectChanges();
              }
            });
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading TV show:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else if (this.mediaType === 'person') {
      this.tmdbService.getPersonDetails(this.mediaId).subscribe({
        next: (data) => {
          this.media = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading person:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  loadReviews() {
    const mediaTypeMap = { 'movie': 'Movie', 'tv': 'TvShow', 'person': 'Person' };
    this.reviewService.getReviewsByMedia(mediaTypeMap[this.mediaType], this.mediaId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading reviews:', err)
    });
  }

  onReviewSubmitted(reviewData: { rating: number; comment: string }) {
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

  getActorImageUrl(path: string | undefined): string {
    return this.tmdbService.getImageUrl(path || '', 'w185');
  }

  getTrailerUrl(): SafeResourceUrl | null {
    if (!this.media || !('videos' in this.media)) return null;
    const trailer = this.media.videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    if (trailer) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${trailer.key}`);
    }
    return null;
  }

  isMovie(media: any): media is Movie {
    return media && 'title' in media;
  }

  isTvShow(media: any): media is TvShow {
    return media && 'name' in media && 'firstAirDate' in media;
  }

  isPerson(media: any): media is Person {
    return media && 'biography' in media;
  }

  getCast(): CastMember[] {
    if (!this.media || !('cast' in this.media)) return [];
    return (this.media as Movie | TvShow).cast || [];
  }

  toggleSeason(season: any) {
    season.expanded = !season.expanded;
    if (season.expanded && !season.episodes && this.mediaType === 'tv') {
      season.loading = true;
      this.tmdbService.getTvShowSeason(this.mediaId, season.seasonNumber).subscribe({
        next: (data) => {
          season.episodes = data.episodes;
          season.loading = false;
          // Fetch episode ratings
          if (season.episodes && season.episodes.length > 0) {
            const items = season.episodes.map((e: any) => ({ mediaId: e.id, mediaType: 'Episode' }));
            this.reviewService.getBatchAverages(items).subscribe({
              next: (avgs) => {
                season.episodes.forEach((e: any) => {
                  e.appRating = avgs[`Episode_${e.id}`];
                });
                this.cdr.detectChanges();
              }
            });
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching season details', err);
          season.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  toggleReviewForm(item: any) {
    item.showReviewForm = !item.showReviewForm;
  }

  onItemReviewSubmitted(reviewData: { rating: number; comment: string }, targetId: number, mediaType: 'Season' | 'Episode', targetItem: any) {
    this.reviewService.createReview({
      mediaId: targetId,
      mediaType: mediaType as any,
      ...reviewData
    }).subscribe({
      next: () => {
        targetItem.showReviewForm = false;
        this.reviewService.getBatchAverages([{ mediaId: targetId, mediaType }]).subscribe({
          next: (avgs) => {
            targetItem.appRating = avgs[`${mediaType}_${targetId}`];
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => console.error('Error creating review:', err)
    });
  }

  hasTrailer(): boolean {
    return this.getTrailerUrl() !== null;
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

  onDeleteReview(id: string) {
    this.reviewService.deleteReview(id).subscribe({
      next: () => {
        this.loadReviews();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error deleting review:', err)
    });
  }
}
