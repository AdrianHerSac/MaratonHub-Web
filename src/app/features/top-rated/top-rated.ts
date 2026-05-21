import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TmdbApiService } from '../../core/services/tmdb-api.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-top-rated',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './top-rated.html',
  styleUrl: './top-rated.css'
})
export class TopRatedComponent implements OnInit {
  private tmdbService = inject(TmdbApiService);

  movies: any[] = [];
  series: any[] = [];
  persons: any[] = [];

  pageSize = 20;
  
  moviesPage = 1;
  seriesPage = 1;
  personsPage = 1;

  isLoadingMovies = signal(false);
  isLoadingSeries = signal(false);
  isLoadingPersons = signal(false);

  hasMoreMovies = true;
  hasMoreSeries = true;
  hasMorePersons = true;

  ngOnInit() {
    this.loadMovies();
    this.loadSeries();
    this.loadPersons();
  }

  loadMovies() {
    if (!this.hasMoreMovies) return;
    this.isLoadingMovies.set(true);
    
    this.tmdbService.getHydratedAppTopRatedMedia('movie', this.moviesPage, this.pageSize)
      .subscribe({
        next: (data) => {
          this.movies = [...this.movies, ...data];
          if (data.length < this.pageSize) this.hasMoreMovies = false;
          this.isLoadingMovies.set(false);
        },
        error: (err) => {
          console.error('Error loading top rated movies:', err);
          this.isLoadingMovies.set(false);
        }
      });
  }

  loadSeries() {
    if (!this.hasMoreSeries) return;
    this.isLoadingSeries.set(true);
    
    this.tmdbService.getHydratedAppTopRatedMedia('tv', this.seriesPage, this.pageSize)
      .subscribe({
        next: (data) => {
          this.series = [...this.series, ...data];
          if (data.length < this.pageSize) this.hasMoreSeries = false;
          this.isLoadingSeries.set(false);
        },
        error: (err) => {
          console.error('Error loading top rated series:', err);
          this.isLoadingSeries.set(false);
        }
      });
  }

  loadPersons() {
    if (!this.hasMorePersons) return;
    this.isLoadingPersons.set(true);
    
    this.tmdbService.getHydratedAppTopRatedMedia('person', this.personsPage, this.pageSize)
      .subscribe({
        next: (data) => {
          this.persons = [...this.persons, ...data];
          if (data.length < this.pageSize) this.hasMorePersons = false;
          this.isLoadingPersons.set(false);
        },
        error: (err) => {
          console.error('Error loading top rated persons:', err);
          this.isLoadingPersons.set(false);
        }
      });
  }

  loadMoreMovies() {
    this.moviesPage++;
    this.loadMovies();
  }

  loadMoreSeries() {
    this.seriesPage++;
    this.loadSeries();
  }

  loadMorePersons() {
    this.personsPage++;
    this.loadPersons();
  }

  getImageUrl(path: string) {
    return this.tmdbService.getImageUrl(path);
  }
}
