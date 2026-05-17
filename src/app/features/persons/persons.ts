import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Person } from '../../core/models/media.model';
import { TmdbApiService } from '../../core/services/tmdb-api.service';
import { ReviewService } from '../../core/services/review.service';
import { forkJoin, Subject, of, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, timeout } from 'rxjs/operators';
import { RouterModule } from '@angular/router';

export interface DepartmentFilter {
  id: string;
  name: string;
  emoji: string;
}

@Component({
  selector: 'app-persons',
  imports: [CommonModule, RouterModule],
  templateUrl: './persons.html',
  styleUrl: './persons.css',
})
export class PersonsComponent implements OnInit, OnDestroy {
  popularPersons: Person[] = [];
  filteredPersons: Person[] = [];
  searchPersonsList: Person[] = [];
  loading = true;
  searchLoading = false;
  loadError = false;

  searchQuery = '';
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  selectedDeptKey = 'Todos';
  selectedDeptId = 'All';

  departments: DepartmentFilter[] = [
    { id: 'All', name: 'Todos', emoji: '⭐' },
    { id: 'Acting', name: 'Actores', emoji: '🎭' },
    { id: 'Directing', name: 'Directores', emoji: '🎬' },
    { id: 'Writing', name: 'Escritores', emoji: '✍️' },
    { id: 'Production', name: 'Productores', emoji: '💼' }
  ];

  activeView: 'all' | 'search' = 'all';
  ratings = new Map<number, number>();

  constructor(
    private tmdbService: TmdbApiService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadAll();
    this.searchSub = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          this.searchPersonsList = [];
          this.searchLoading = false;
          this.activeView = 'all';
          this.cdr.markForCheck();
          return of([]);
        }
        this.searchLoading = true;
        this.activeView = 'search';
        this.cdr.markForCheck();
        return this.tmdbService.searchPersons(query).pipe(catchError(() => of([])));
      })
    ).subscribe(persons => {
      if (Array.isArray(persons)) {
        this.searchPersonsList = persons;
        this.searchLoading = false;
        this.loadRatingBatch(persons);
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
    this.tmdbService.getPopularPersons().pipe(
      timeout(20000),
      catchError(() => of([]))
    ).subscribe({
      next: (persons) => {
        this.popularPersons = persons as Person[];
        this.applyFilter();
        if (!persons.length) this.loadError = true;
        this.loading = false;
        this.cdr.markForCheck();
        this.loadRatingBatch(this.popularPersons);
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilter() {
    if (this.selectedDeptId === 'All') {
      this.filteredPersons = this.popularPersons;
    } else {
      this.filteredPersons = this.popularPersons.filter(p =>
        p.knownForDepartment === this.selectedDeptId ||
        (this.selectedDeptId === 'Acting' && !p.knownForDepartment)
      );
    }
  }

  onSearchInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchPersonsList = [];
    this.activeView = 'all';
    this.selectedDeptKey = 'Todos';
    this.selectedDeptId = 'All';
    this.applyFilter();
    this.cdr.markForCheck();
  }

  onDeptChange(event: Event) {
    const name = (event.target as HTMLSelectElement).value;
    this.selectedDeptKey = name;
    this.searchQuery = '';
    const dept = this.departments.find(d => d.name === name);
    if (dept) {
      this.selectedDeptId = dept.id;
      this.activeView = 'all';
      this.applyFilter();
    }
  }

  loadRatingBatch(persons: Person[]) {
    if (!persons.length) return;
    const reqs = persons.map(p =>
      this.reviewService.getAverageRating('Person', p.id).pipe(
        catchError(() => of({ average: 0, percentage: 0, totalReviews: 0 }))
      )
    );
    forkJoin(reqs).subscribe(results => {
      results.forEach((r, i) => this.ratings.set(persons[i].id, r.percentage));
      this.cdr.markForCheck();
    });
  }

  getRating(id: number): number { return this.ratings.get(id) ?? 0; }

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
