import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SocialService, User, FriendGroup } from '../../core/services/social.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  activeTab: 'perfil' | 'social' | 'grupos' | 'configuracion' = 'perfil';
  
  // Settings
  emailNotifications = true;
  pushNotifications = true;
  publicProfile = true;

  // Groups creation
  showCreateForm = false;
  newGroupName = '';
  newGroupDesc = '';

  suggestedUsers: User[] = [];

  constructor(
    public authService: AuthService,
    public socialService: SocialService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Escuchar parámetros de consulta para cambiar de pestaña activa (ej. ?tab=settings)
    this.route.queryParams.subscribe((params) => {
      const tab = params['tab'];
      if (tab === 'settings' || tab === 'configuracion') {
        this.activeTab = 'configuracion';
      } else if (tab === 'social') {
        this.activeTab = 'social';
      } else if (tab === 'groups' || tab === 'grupos') {
        this.activeTab = 'grupos';
      } else {
        this.activeTab = 'perfil';
      }
    });

    this.loadSuggestedUsers();
  }

  setTab(tab: 'perfil' | 'social' | 'grupos' | 'configuracion') {
    this.activeTab = tab;
  }

  loadSuggestedUsers() {
    this.socialService.getSuggestedUsers().subscribe({
      next: (users) => {
        this.suggestedUsers = users;
      }
    });
  }

  follow(user: User) {
    this.socialService.followUser(user.id).subscribe({
      next: () => {
        this.loadSuggestedUsers();
      }
    });
  }

  unfollow(userId: string) {
    this.socialService.unfollowUser(userId).subscribe({
      next: () => {
        this.loadSuggestedUsers();
      }
    });
  }

  createGroup() {
    if (!this.newGroupName.trim()) return;
    this.socialService.createGroup(this.newGroupName, this.newGroupDesc).subscribe({
      next: () => {
        this.newGroupName = '';
        this.newGroupDesc = '';
        this.showCreateForm = false;
      }
    });
  }
}
