import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { shareReplay, switchMap, map, catchError } from 'rxjs/operators';
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

    getTvShowSeason(tvId: number, seasonNumber: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/tvshows/${tvId}/season/${seasonNumber}`);
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

    // App Top Rated
    getAppTopRatedMedia(mediaType: string, page: number = 1, pageSize: number = 20): Observable<any[]> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());
        return this.http.get<any[]>(`${this.apiUrl}/reviews/top-rated/${mediaType}`, { params });
    }

    getHydratedAppTopRatedMedia(mediaType: string, page: number = 1, pageSize: number = 20): Observable<any[]> {
        return this.getAppTopRatedMedia(mediaType, page, pageSize).pipe(
            switchMap(topRated => {
                if (!topRated || topRated.length === 0) return of([]);
                
                const requests = topRated.map(item => {
                    let detailReq: Observable<any>;
                    if (mediaType === 'movie') detailReq = this.getMovieDetails(item.mediaId);
                    else if (mediaType === 'tv') detailReq = this.getTvShowDetails(item.mediaId);
                    else if (mediaType === 'person') detailReq = this.getPersonDetails(item.mediaId);
                    else detailReq = of(item);

                    return detailReq.pipe(
                        map((detail: any) => ({
                            ...(detail as object),
                            mediaType: mediaType,
                            appAverage: item.average,
                            appPercentage: item.percentage,
                            appTotalReviews: item.totalReviews,
                            voteAverage: item.average
                        })),
                        catchError(() => of(null))
                    );
                });

                return forkJoin(requests).pipe(
                    map(results => results.filter(r => r !== null))
                );
            })
        );
    }
}
