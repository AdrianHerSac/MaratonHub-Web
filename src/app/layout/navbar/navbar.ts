import { Component, OnInit, OnDestroy, effect, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { SignalRService } from '../../core/services/signalr.service';
import { NotificationModel } from '../../core/models/group.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [FormsModule, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  standalone: true
})

export class Navbar implements OnInit, OnDestroy {
  searchQuery = '';
  isMobileMenuOpen = false;
  isUserDropdownOpen = false;
  isNotificationsPanelOpen = false;

  notifications: NotificationModel[] = [];
  private notificationSub?: Subscription;
  private unreadSub?: Subscription;

  constructor(
    public authService: AuthService, 
    private notificationService: NotificationService,
    private signalR: SignalRService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      const currentUser = this.authService.currentUser();
      if (currentUser) {
        this.initializeNotifications();
      } else {
        this.notifications = [];
        this.signalR.stop();
        this.notificationSub?.unsubscribe();
        this.unreadSub?.unsubscribe();
        this.cdr.detectChanges();
      }
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.notificationSub?.unsubscribe();
    this.unreadSub?.unsubscribe();
    this.signalR.stop();
  }

  initializeNotifications(): void {
    this.notificationSub?.unsubscribe();
    this.unreadSub?.unsubscribe();

    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
        this.cdr.detectChanges();
      }
    });

    this.signalR.start();

    this.notificationSub = this.signalR.onNotification.subscribe({
      next: (notif) => {
        this.notifications = [notif, ...this.notifications];
        this.cdr.detectChanges();
      }
    });

    this.unreadSub = this.signalR.onUnreadCount.subscribe({
      next: (count) => {
        console.log('Unread count updated:', count);
        this.cdr.detectChanges();
      }
    });
  }

  get unreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'Ahora';
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

  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Buscando:', this.searchQuery);
      this.router.navigate(['/inicio'], { queryParams: { q: this.searchQuery } });
      this.isMobileMenuOpen = false;
    }
  }

  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
    if (this.isUserDropdownOpen) {
      this.isNotificationsPanelOpen = false;
    }
  }

  goToProfile(): void {
    this.router.navigate(['/perfil']);
    this.isUserDropdownOpen = false;
  }

  goToRatings(): void {
    this.router.navigate(['/mi-lista']);
    this.isUserDropdownOpen = false;
  }

  logout(): void {
    console.log('Cerrando sesión...');
    this.authService.logout();
    this.isUserDropdownOpen = false;
    this.router.navigate(['/']);
  }

  toggleNotificationsPanel(): void {
    this.isNotificationsPanelOpen = !this.isNotificationsPanelOpen;
    if (this.isNotificationsPanelOpen) {
      this.isUserDropdownOpen = false;
    }
  }

  markAsRead(notification: NotificationModel): void {
    if (notification.read) return;
    notification.read = true;
    this.cdr.detectChanges();
    this.notificationService.markAsRead(notification.id).subscribe({
      error: (err) => console.error('Error marking notification as read:', err)
    });
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.cdr.detectChanges();
    this.notificationService.markAllAsRead().subscribe({
      error: (err) => console.error('Error marking all notifications as read:', err)
    });
  }

  deleteNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.cdr.detectChanges();
    this.notificationService.deleteNotification(id).subscribe({
      error: (err) => console.error('Error deleting notification:', err)
    });
  }

  clearAllNotifications(): void {
    this.notifications = [];
    this.cdr.detectChanges();
    this.notificationService.clearAll().subscribe({
      error: (err) => console.error('Error clearing notifications:', err)
    });
  }
}
