import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GroupService } from '../../core/services/group.service';
import { AuthService } from '../../core/services/auth.service';
import { SignalRService } from '../../core/services/signalr.service';
import { TmdbApiService } from '../../core/services/tmdb-api.service';
import { Group, GroupMember, GroupRating, ChatMessage, CreateGroupRatingDto } from '../../core/models/group.model';
import { Movie, TvShow, Person } from '../../core/models/media.model';
import { Subscription, Subject, forkJoin, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-group-detail',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './group-detail.html',
  styleUrl: './groups.css'
})
export class GroupDetailComponent implements OnInit, OnDestroy {
  @ViewChild('chatMessages') chatMessagesRef?: ElementRef;

  group?: Group;
  loading = true;
  error = '';
  activeTab: 'chat' | 'ratings' | 'members' = 'chat';

  // Members
  myRole: string | null = null;

  // Invite
  inviteCode = '';
  showInviteModal = false;
  copied = false;

  // Chat
  messages: ChatMessage[] = [];
  newMessage = '';
  chatLoading = true;
  private messageSub?: Subscription;
  private connectedSub?: Subscription;

  // Search for Rating
  searchQuery = '';
  searchLoading = false;
  searchResultMovies: Movie[] = [];
  searchResultShows: TvShow[] = [];
  searchResultPersons: Person[] = [];
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  // Ratings
  ratings: GroupRating[] = [];
  ratingsLoading = true;
  showRatingModal = false;
  ratingDto: CreateGroupRatingDto = {
    mediaId: 0,
    mediaType: 'Movie',
    mediaTitle: '',
    posterPath: '',
    rating: 5,
    comment: ''
  };
  submittingRating = false;
  ratingError = '';

  constructor(
    private route: ActivatedRoute,
    public groupService: GroupService,
    public authService: AuthService,
    private signalR: SignalRService,
    private cdr: ChangeDetectorRef,
    private tmdbService: TmdbApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGroup(id);
    }
    
    // Setup Search
    this.searchSub = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          this.searchResultMovies = [];
          this.searchResultShows = [];
          this.searchResultPersons = [];
          this.searchLoading = false;
          this.cdr.detectChanges();
          return of(null);
        }
        this.searchLoading = true;
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.messageSub?.unsubscribe();
    this.connectedSub?.unsubscribe();
    this.searchSub?.unsubscribe();
    if (this.group?.id) {
      this.signalR.leaveGroup(this.group.id);
    }
  }

  private loadGroup(id: string): void {
    this.loading = true;
    this.groupService.getGroup(id).subscribe({
      next: (group) => {
        this.group = group;
        this.loading = false;
        const me = group.members.find(m => m.userId === this.authService.currentUser()?.id);
        this.myRole = me?.role ?? null;
        this.inviteCode = group.inviteCode || '';
        this.connectToChat(id);
        this.loadChat(id);
        this.loadRatings(id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar el grupo';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private connectToChat(groupId: string): void {
    this.signalR.start();
    
    this.connectedSub = this.signalR.onConnected.subscribe(connected => {
      if (connected) {
        this.signalR.joinGroup(groupId);
      }
    });

    this.messageSub = this.signalR.onMessage.subscribe(msg => {
      if (msg.groupId === groupId) {
        this.messages.push(msg);
        this.scrollChat();
        this.cdr.detectChanges();
      }
    });
  }

  private loadChat(groupId: string): void {
    this.chatLoading = true;
    this.groupService.getChatMessages(groupId).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.chatLoading = false;
        setTimeout(() => this.scrollChat(), 100);
        this.cdr.detectChanges();
      },
      error: () => {
        this.chatLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadRatings(groupId: string): void {
    this.ratingsLoading = true;
    this.groupService.getGroupRatings(groupId).subscribe({
      next: (ratings) => {
        this.ratings = ratings;
        this.ratingsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.ratingsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.group?.id) return;
    this.signalR.sendMessage(this.group.id, this.newMessage.trim());
    this.newMessage = '';
    this.cdr.detectChanges();
  }

  private scrollChat(): void {
    setTimeout(() => {
      if (this.chatMessagesRef?.nativeElement) {
        this.chatMessagesRef.nativeElement.scrollTop = this.chatMessagesRef.nativeElement.scrollHeight;
      }
    }, 50);
  }

  generateInvite(): void {
    if (!this.group?.id) return;
    this.groupService.generateInviteCode(this.group.id).subscribe({
      next: (res) => {
        this.inviteCode = res.inviteCode;
        if (this.group) this.group.inviteCode = res.inviteCode;
        this.cdr.detectChanges();
      }
    });
  }

  copyInviteCode(): void {
    navigator.clipboard.writeText(this.inviteCode);
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }

  leaveGroup(): void {
    if (!this.group?.id) return;
    if (!confirm('¿Estás seguro de abandonar este grupo?')) return;
    this.groupService.leaveGroup(this.group.id).subscribe({
      next: () => window.location.href = '/groups'
    });
  }

  promoteMember(userId: string): void {
    if (!this.group?.id) return;
    this.groupService.promoteMember(this.group.id, userId).subscribe({
      next: () => this.loadGroup(this.group!.id!)
    });
  }

  removeMember(userId: string): void {
    if (!this.group?.id) return;
    if (!confirm('¿Eliminar a este miembro del grupo?')) return;
    this.groupService.removeMember(this.group.id, userId).subscribe({
      next: () => this.loadGroup(this.group!.id!)
    });
  }

  openRatingModal(): void {
    this.showRatingModal = true;
    this.ratingDto = { mediaId: 0, mediaType: 'Movie', mediaTitle: '', posterPath: '', rating: 5, comment: '' };
    this.ratingError = '';
    this.clearSearch();
  }

  submitRating(): void {
    if (!this.ratingDto.mediaId || !this.ratingDto.mediaTitle.trim()) {
      this.ratingError = 'Debes buscar y seleccionar una película, serie o famoso.';
      return;
    }
    if (!this.group?.id) return;
    this.submittingRating = true;
    this.ratingError = '';
    this.groupService.createGroupRating(this.group.id, this.ratingDto).subscribe({
      next: () => {
        this.submittingRating = false;
        this.showRatingModal = false;
        this.loadRatings(this.group!.id!);
      },
      error: () => {
        this.submittingRating = false;
        this.ratingError = 'Error al enviar la valoración';
      }
    });
  }

  isCurrentUser(userId: string): boolean {
    return userId === this.authService.currentUser()?.id;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString();
  }

  starsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
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
    this.cdr.detectChanges();
  }

  selectMedia(media: any, type: 'Movie' | 'TvShow' | 'Person') {
    this.ratingDto.mediaId = media.id;
    this.ratingDto.mediaType = type;
    this.ratingDto.mediaTitle = media.title || media.name;
    this.ratingDto.posterPath = media.posterPath || media.profilePath || '';
    this.clearSearch();
  }

  clearSelection() {
    this.ratingDto.mediaId = 0;
    this.ratingDto.mediaTitle = '';
    this.ratingDto.posterPath = '';
    this.cdr.detectChanges();
  }

  getImageUrl(path: string | undefined, size: string = 'w500'): string {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
    return this.tmdbService.getImageUrl(path, size);
  }
}
