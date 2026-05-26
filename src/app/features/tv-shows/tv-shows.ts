import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { TmdbApiService } from '../../core/services/tmdb-api.service';
import { ReviewService } from '../../core/services/review.service';
import { Movie, TvShow, Person } from '../../core/models/media.model';

export interface GenreOption {
  id: number | null;
  name: string;
  emoji: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './tv-shows.html',
  styleUrl: './tv-shows.css'
})

export class TvShowsComponent implements OnInit, OnDestroy {
  popularTvShows: TvShow[] = [];
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

  selectedGenreId: number | null = null;
  selectedGenreKey = 'Todos';
  genreTvShows: TvShow[] = [];
  genreLoading = false;
  activeView: 'all' | 'genre' | 'search' = 'all';

  genres: GenreOption[] = [
    { id: null, name: 'Todos', emoji: '🎬' },
    { id: 18, name: 'Drama', emoji: '🎭' },
    { id: 35, name: 'Comedia', emoji: '😂' },
    { id: 16, name: 'Animación', emoji: '🎨' },
    { id: 10765, name: 'Ciencia Ficción y Fantasía', emoji: '🚀' },
    { id: 10759, name: 'Acción y Aventura', emoji: '💥' },
    { id: 99, name: 'Documental', emoji: '📽️' },
    { id: 80, name: 'Crimen', emoji: '🔪' },
    { id: 9648, name: 'Misterio', emoji: '🕵️' },
  ];

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
          this.activeView = this.selectedGenreId !== null ? 'genre' : 'all';
          this.cdr.markForCheck();
          return of(null);
        }
        this.searchLoading = true;
        this.activeView = 'search';
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
        if ((results as any).shows && (results as any).shows.length > 0) {
          this.loadRatings([], (results as any).shows);
        }
      }
    });
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
  }

  loadData() {
    this.loading = true;

    this.tmdbService.getPopularTvShows().subscribe({
      next: (shows) => {
        this.popularTvShows = shows;
        this.loading = false;
        this.cdr.markForCheck();

        // Corregido: Pasamos un array vacío para movies ya que aquí solo hay shows
        this.loadRatings([], shows);
      },
      error: (err) => {
        console.error('Error loading tv data:', err);
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
    this.activeView = this.selectedGenreId !== null ? 'genre' : 'all';
    this.cdr.markForCheck();
  }

  selectView(genre: GenreOption) {
    if (genre.id === null) {
      this.activeView = 'all';
      this.selectedGenreId = null;
      this.genreTvShows = [];
      return;
    }

    this.activeView = 'genre';
    this.selectedGenreId = genre.id;
    this.genreLoading = true;
    this.genreTvShows = [];

    this.tmdbService.getTvShowsByGenre(genre.id).subscribe({
      next: (shows) => {
        this.genreTvShows = shows;
        this.genreLoading = false;
        this.cdr.markForCheck();
        this.loadRatings([], shows);
      },
      error: () => {
        this.genreLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onGenreChange(event: Event) {
    const name = (event.target as HTMLSelectElement).value;
    this.selectedGenreKey = name;
    this.searchQuery = '';
    const genre = this.genres.find(g => g.name === name);
    if (genre) this.selectView(genre);
  }
}
