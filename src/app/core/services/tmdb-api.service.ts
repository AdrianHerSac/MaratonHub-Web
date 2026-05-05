import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Movie, TvShow, Person } from '../models/media.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TmdbApiService {
  // 1. Cambiamos el nombre aquí para que coincida con el resto
  private apiUrl = environment.apiUrl;

  private trendingMovies$: Observable<Movie[]>;
  private popularTvShows$: Observable<TvShow[]>;
  private popularPersons$: Observable<Person[]>;

  constructor(private http: HttpClient) {
    // Ahora 'this.apiUrl' ya existe y no dará error
    this.trendingMovies$ = this.http.get<Movie[]>(`${this.apiUrl}/movies/trending`).pipe(shareReplay(1));
    this.popularTvShows$ = this.http.get<TvShow[]>(`${this.apiUrl}/tvshows/popular`).pipe(shareReplay(1));
    this.popularPersons$ = this.http.get<Person[]>(`${this.apiUrl}/persons/popular`).pipe(shareReplay(1));
  }

    // Movies
    getTrendingMovies(): Observable<Movie[]> {
      return this.http.get<Movie[]>(`${this.apiUrl}/movies/trending`).pipe(shareReplay(1));
    }

    getPopularMovies(page: number = 1): Observable<Movie[]> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<Movie[]>(`${this.apiUrl}/movies/popular`, { params });
    }

    getMoviesByGenre(genreId: number): Observable<Movie[]> {
        return this.http.get<Movie[]>(`${this.apiUrl}/movies/genero/${genreId}`);
    }

    searchMovies(query: string): Observable<Movie[]> {
        const params = new HttpParams().set('query', query);
        return this.http.get<Movie[]>(`${this.apiUrl}/movies/search`, { params });
    }

    getMovieDetails(id: number): Observable<Movie> {
        return this.http.get<Movie>(`${this.apiUrl}/movies/${id}`);
    }

    getTopRatedMovies(page: number = 1): Observable<Movie[]> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<Movie[]>(`${this.apiUrl}/movies/top-rated`, { params });
    }

    // TV Shows
    getTrendingTvShows(): Observable<TvShow[]> {
        return this.http.get<TvShow[]>(`${this.apiUrl}/tvshows/trending`);
    }

    getPopularTvShows(page: number = 1): Observable<TvShow[]> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<TvShow[]>(`${this.apiUrl}/tvshows/popular`, { params });
    }

    searchTvShows(query: string): Observable<TvShow[]> {
        const params = new HttpParams().set('query', query);
        return this.http.get<TvShow[]>(`${this.apiUrl}/tvshows/search`, { params });
    }

    getTvShowDetails(id: number): Observable<TvShow> {
        return this.http.get<TvShow>(`${this.apiUrl}/tvshows/${id}`);
    }

    getTopRatedTvShows(page: number = 1): Observable<TvShow[]> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<TvShow[]>(`${this.apiUrl}/tvshows/top-rated`, { params });
    }

    // Persons
    getPopularPersons(): Observable<Person[]> {
        return this.popularPersons$;
    }

    searchPersons(query: string): Observable<Person[]> {
        const params = new HttpParams().set('query', query);
        return this.http.get<Person[]>(`${this.apiUrl}/persons/search`, { params });
    }

    getPersonDetails(id: number): Observable<Person> {
        return this.http.get<Person>(`${this.apiUrl}/persons/${id}`);
    }

    // Helper to get image URL
    getImageUrl(path: string, size: string = 'w500'): string {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `https://image.tmdb.org/t/p/${size}${path}`;
    }
}
