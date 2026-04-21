import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from "@angular/common";
import { Movie } from '../../core/models/media.model';
import { TmdbApiService } from '../../core/services/tmdb-api.service';
import { ReviewService } from '../../core/services/review.service';
import { forkJoin, Subject, TimeoutError } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, timeout } from 'rxjs/operators';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { MovieCarousel } from '../../shared/components/movie-carousel/movie-carousel';
import { Subscription } from 'rxjs';

export interface Genre {
  id: number | null;
  name: string;
  emoji: string;
}

@Component({
  selector: 'app-movies',
  imports: [CommonModule, RouterModule],
  templateUrl: './peliculas.html',
  styleUrl: './peliculas.css',
})
export class PeliculasComponent implements OnInit, OnDestroy {
  trendingMovies: Movie[] = [];
  popularMovies: Movie[] = [];
  genreMovies: Movie[] = [];
  searchMovies: Movie[] = [];
  loading = true;
  genreLoading = false;
  searchLoading = false;
  loadError = false;

  // Búsqueda por texto
  searchQuery = '';
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  selectedGenreId: number | null = null;
  selectedGenreKey = 'Todos';

  genres: Genre[] = [
    { id: null, name: 'Todos', emoji: '🎬' },
    { id: null, name: 'Tendencia', emoji: '🔥' },
    { id: 27, name: 'Terror', emoji: '😱' },
    { id: 35, name: 'Comedia', emoji: '😂' },
    { id: 28, name: 'Acción', emoji: '💥' },
    { id: 878, name: 'Ciencia Ficción', emoji: '🚀' },
    { id: 16, name: 'Animación', emoji: '🎨' },
    { id: 18, name: 'Drama', emoji: '🎭' },
    { id: 10749, name: 'Romance', emoji: '❤️' },
    { id: 53, name: 'Thriller', emoji: '🔪' },
    { id: 12, name: 'Aventura', emoji: '🗺️' },
    { id: 99, name: 'Documental', emoji: '📽️' },
  ];

  // Vista activa: 'all' = trending+popular, 'genre' = por género, 'search' = búsqueda
  activeView: 'all' | 'genre' | 'search' = 'all';

  trendingRatings = new Map<number, number>();
  popularRatings = new Map<number, number>();
  genreRatings = new Map<number, number>();

  constructor(
    private tmdbService: TmdbApiService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadAll();
    // Debounce de búsqueda: espera 400ms tras el último keystroke
    this.searchSub = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          this.searchMovies = [];
          this.searchLoading = false;
          this.activeView = 'all';
          this.cdr.markForCheck();
          return of([]);
        }
        this.searchLoading = true;
        this.activeView = 'search';
        this.cdr.markForCheck();
        return this.tmdbService.searchMovies(query).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe(movies => {
      if (Array.isArray(movies)) {
        this.searchMovies = movies;
        this.searchLoading = false;
        this.loadRatingBatch(movies, this.genreRatings);
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
  }

  loadAll() {
    this.loading = true;
    this.loadError = false;
    forkJoin({
      trending: this.tmdbService.getTrendingMovies().pipe(timeout(20000), catchError(() => of([]))),
      popular: this.tmdbService.getPopularMovies().pipe(timeout(20000), catchError(() => of([])))
    }).subscribe({
      next: ({ trending, popular }) => {
        this.trendingMovies = trending as Movie[];
        this.popularMovies = popular as Movie[];
        if (!trending.length && !popular.length) {
          this.loadError = true;
        }
        this.loading = false;
        this.cdr.markForCheck();
        this.loadRatingBatch(this.trendingMovies, this.trendingRatings);
        this.loadRatingBatch(this.popularMovies, this.popularRatings);
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
        this.cdr.markForCheck();
      }
    });
  }

  selectView(genre: Genre) {
    // "Todos" y "Tendencia" vuelven a la vista general
    if (genre.id === null) {
      this.activeView = 'all';
      this.selectedGenreId = null;
      this.genreMovies = [];
      return;
    }

    this.activeView = 'genre';
    this.selectedGenreId = genre.id;
    this.genreLoading = true;
    this.genreMovies = [];

    this.tmdbService.getMoviesByGenre(genre.id).subscribe({
      next: (movies) => {
        this.genreMovies = movies;
        this.genreLoading = false;
        this.cdr.markForCheck();
        this.loadRatingBatch(movies, this.genreRatings);
      },
      error: () => {
        this.genreLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  isActive(genre: Genre): boolean {
    if (genre.id === null) return this.activeView === 'all';
    return this.activeView === 'genre' && this.selectedGenreId === genre.id;
  }

  onSearchInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchMovies = [];
    this.activeView = 'all';
    this.selectedGenreKey = 'Todos';
    this.selectedGenreId = null;
    this.cdr.markForCheck();
  }

  onGenreChange(event: Event) {
    const name = (event.target as HTMLSelectElement).value;
    this.selectedGenreKey = name;
    // Si hay texto buscado, lo limpiamos al cambiar de género
    this.searchQuery = '';
    const genre = this.genres.find(g => g.name === name);
    if (genre) this.selectView(genre);
  }

  loadRatingBatch(movies: Movie[], ratingsMap: Map<number, number>) {
    if (!movies.length) return;
    const reqs = movies.map(m =>
      this.reviewService.getAverageRating('Movie', m.id).pipe(
        catchError(() => of({ average: 0, percentage: 0, totalReviews: 0 }))
      )
    );
    forkJoin(reqs).subscribe(results => {
      results.forEach((r, i) => ratingsMap.set(movies[i].id, r.percentage));
      this.cdr.markForCheck();
    });
  }

  getRating(id: number): number {
    return this.trendingRatings.get(id)
      ?? this.popularRatings.get(id)
      ?? this.genreRatings.get(id)
      ?? 0;
  }

  getRatingColor(pct: number): string {
    if (pct >= 70) return '#22c55e';
    if (pct >= 40) return '#f59e0b';
    return '#ef4444';
  }

  getImageUrl(path: string | undefined, size: string = 'w500'): string {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
    return this.tmdbService.getImageUrl(path, size);
  }
}
