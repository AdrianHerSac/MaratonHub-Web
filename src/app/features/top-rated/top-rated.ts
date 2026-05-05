import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TmdbApiService } from '../../core/services/tmdb-api.service';
import { Movie, TvShow } from '../../core/models/media.model';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-top-rated',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './top-rated.html',
  styleUrl: './top-rated.css'
})
export class TopRatedComponent implements OnInit {
  private tmdbService = inject(TmdbApiService);

  allMedia: any[] = [];
  displayedMedia: any[] = [];

  pageSize = 40;
  currentPage = 1;
  isLoading = signal(false);

  ngOnInit() {
    this.loadTopRated();
  }

  loadTopRated() {
    this.isLoading.set(true);
    
    // Fetch 2 pages of movies and 2 pages of series from local MongoDB
    forkJoin({
      m1: this.tmdbService.getTopRatedMovies(1),
      m2: this.tmdbService.getTopRatedMovies(2),
      s1: this.tmdbService.getTopRatedTvShows(1),
      s2: this.tmdbService.getTopRatedTvShows(2)
    }).subscribe({
      next: (data) => {
        const allMovies = [...data.m1, ...data.m2].map(m => ({ ...m, mediaType: 'movie' }));
        const allSeries = [...data.s1, ...data.s2].map(s => ({ ...s, mediaType: 'tv' }));
        
        // Películas primero, luego series
        this.allMedia = [...allMovies, ...allSeries];
        this.updateDisplayedMedia();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading top rated:', err);
        this.isLoading.set(false);
      }
    });
  }

  updateDisplayedMedia() {
    const end = this.currentPage * this.pageSize;
    this.displayedMedia = this.allMedia.slice(0, end);
  }

  loadMore() {
    this.currentPage++;
    this.updateDisplayedMedia();
  }

  getImageUrl(path: string) {
    return this.tmdbService.getImageUrl(path);
  }
}
