import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { TmdbApiService } from '../../core/services/tmdb-api.service';
import { ReviewService } from '../../core/services/review.service';
import { Movie, TvShow, Person } from '../../core/models/media.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})

export class HomeComponent implements OnInit, OnDestroy {
  trendingMovies: Movie[] = [];
  popularTvShows: TvShow[] = [];
  popularPersons: Person[] = [];
  loading = true;

  // Búsqueda global
  searchQuery = '';
  searchLoading = false;
  searchResultMovies: Movie[] = [];
  searchResultShows: TvShow[] = [];
  searchResultPersons: Person[] = [];
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  movieRatings = new Map<number, number>();
  showRatings = new Map<number, number>();

  constructor(
    private tmdbService: TmdbApiService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadData();
    this.searchSub = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          this.searchResultMovies = [];
          this.searchResultShows = [];
          this.searchResultPersons = [];
          this.searchLoading = false;
          this.cdr.markForCheck();
          return of(null);
        }
        this.searchLoading = true;
        this.cdr.markForCheck();
        return forkJoin({
          movies: this.tmdbService.searchMovies(query).pipe(catchError(() => of([]))),
          shows: this.tmdbService.searchTvShows(query).pipe(catchError(() => of([]))),
          persons: this.tmdbService.searchPersons(query).pipe(catchError(() => of([])))
        });
      })
    ).subscribe(results => {
      if (results && typeof results === 'object' && 'movies' in results) {
        this.searchResultMovies = (results as any).movies;
        this.searchResultShows = (results as any).shows;
        this.searchResultPersons = (results as any).persons;
        this.searchLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
  }

  loadData() {
    this.loading = true;

    forkJoin({
      movies: this.tmdbService.getTrendingMovies(),
      shows: this.tmdbService.getPopularTvShows(),
      persons: this.tmdbService.getPopularPersons()
    }).subscribe({
      next: ({ movies, shows, persons }) => {
        this.trendingMovies = movies;
        this.popularTvShows = shows;
        this.popularPersons = persons;
        this.loading = false;
        this.cdr.markForCheck();

        // Cargar ratings de MongoDB en paralelo
        this.loadRatings(movies, shows);
      },
      error: (err) => {
        console.error('Error loading home data:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadRatings(movies: Movie[], shows: TvShow[]) {
    const movieRequests = movies.map(m =>
      this.reviewService.getAverageRating('Movie', m.id).pipe(
        catchError(() => of({ average: 0, percentage: 0, totalReviews: 0 }))
      )
    );
    const showRequests = shows.map(s =>
      this.reviewService.getAverageRating('TvShow', s.id).pipe(
        catchError(() => of({ average: 0, percentage: 0, totalReviews: 0 }))
      )
    );

    if (movieRequests.length > 0) {
      forkJoin(movieRequests).subscribe(results => {
        results.forEach((r, i) => this.movieRatings.set(movies[i].id, r.percentage));
        this.cdr.markForCheck();
      });
    }

    if (showRequests.length > 0) {
      forkJoin(showRequests).subscribe(results => {
        results.forEach((r, i) => this.showRatings.set(shows[i].id, r.percentage));
        this.cdr.markForCheck();
      });
    }
  }

  getMovieRating(id: number): number {
    return this.movieRatings.get(id) ?? 0;
  }

  getShowRating(id: number): number {
    return this.showRatings.get(id) ?? 0;
  }

  getRatingColor(pct: number): string {
    if (pct >= 70) return '#22c55e';  // verde
    if (pct >= 40) return '#f59e0b';  // amarillo
    return '#ef4444';                 // rojo
  }

  getImageUrl(path: string | undefined, size: string = 'w500'): string {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
    return this.tmdbService.getImageUrl(path, size);
  }

  getBackdropUrl(path: string | undefined): string {
    if (!path) return 'https://via.placeholder.com/1920x1080?text=No+Image';
    return this.tmdbService.getImageUrl(path, 'original');
  }

  onSearchInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResultMovies = [];
    this.searchResultShows = [];
    this.searchResultPersons = [];
    this.cdr.markForCheck();
  }
}

export class home {
}
