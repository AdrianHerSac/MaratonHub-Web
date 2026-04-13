import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TmdbApiService } from '../../../core/services/tmdb-api.service';
import { Movie } from '../../../core/models/media.model';

@Component({
    selector: 'app-movie-carousel',
    imports: [CommonModule],
    templateUrl: './movie-carousel.html',
    styleUrl: './movie-carousel.css'
})

export class MovieCarousel implements OnInit {
    protected currentIndex = signal(0);
    protected movies = signal<Movie[]>([]);
    protected isLoading = signal(true);
    protected error = signal<string | null>(null);

    constructor(private tmdbService: TmdbApiService) { }

    ngOnInit(): void {
        this.loadTrendingMovies();
    }

    private loadTrendingMovies(): void {
        this.isLoading.set(true);
        this.error.set(null);

        this.tmdbService.getTrendingMovies().subscribe({
            next: (movies) => {
                this.movies.set(movies);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error loading trending movies:', err);
                this.error.set('No se pudieron cargar las películas. Asegúrate de que la API está en marcha.');
                this.isLoading.set(false);
            }
        });
    }

    protected getPosterUrl(posterPath: string | undefined): string {
        return this.tmdbService.getImageUrl(posterPath ?? '', 'w500');
    }

    protected getBackdropUrl(backdropPath: string | undefined): string {
        return this.tmdbService.getImageUrl(backdropPath ?? '', 'w780');
    }

    protected next(): void {
        this.currentIndex.update(current => (current + 1) % this.movies().length);
    }

    protected previous(): void {
        this.currentIndex.update(current =>
            current === 0 ? this.movies().length - 1 : current - 1
        );
    }

    protected goToSlide(index: number): void {
        this.currentIndex.set(index);
    }

    protected getVisibleMovies(): Movie[] {
        const all = this.movies();
        if (all.length === 0) return [];
        const visible: Movie[] = [];
        const total = all.length;
        const current = this.currentIndex();

        for (let i = 0; i < 5; i++) {
            const index = (current + i) % total;
            visible.push(all[index]);
        }

        return visible;
    }

    protected formatRating(rating: number): string {
        return rating.toFixed(1);
    }
}
