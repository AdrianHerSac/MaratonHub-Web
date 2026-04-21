import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

@Component({
  selector: 'app-navbar',
  imports: [FormsModule, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})

export class Navbar {
  searchQuery = '';
  isMobileMenuOpen = false;
  isUserDropdownOpen = false;
  isNotificationsPanelOpen = false;

  constructor(public authService: AuthService, private router: Router) {}

  user = {
    name: 'Usuario',
    avatar: 'U',
    email: 'usuario@movierate.com'
  };

  notifications: Notification[] = [
    {
      id: 1,
      title: 'Nueva serie disponible',
      message: 'The Last of Us temporada 2 ya está disponible',
      time: 'Hace 5 min',
      read: false,
      type: 'info'
    },
    {
      id: 2,
      title: 'Valoración recibida',
      message: 'A alguien le gustó tu reseña de Inception',
      time: 'Hace 1 hora',
      read: false,
      type: 'success'
    },
    {
      id: 3,
      title: 'Recordatorio',
      message: 'Dune 2 se estrena mañana',
      time: 'Hace 2 horas',
      read: true,
      type: 'warning'
    }
  ];

  get unreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }


  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Buscando:', this.searchQuery);
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
    console.log('Ir al perfil');
    this.isUserDropdownOpen = false;
  }

  goToRatings(): void {
    console.log('Ir a mis valoraciones');
    this.isUserDropdownOpen = false;
  }

  goToSettings(): void {
    console.log('Ir a configuración');
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

  markAsRead(notification: Notification): void {
    notification.read = true;
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  deleteNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  clearAllNotifications(): void {
    this.notifications = [];
  }
}
