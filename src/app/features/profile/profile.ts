import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SocialService, User } from '../../core/services/social.service';
import { GroupService } from '../../core/services/group.service';
import { GroupSummary } from '../../core/models/group.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  activeTab: 'perfil' | 'grupos' = 'perfil';
  
  isEditing = false;
  editUsername = '';
  editEmail = '';
  editAvatarUrl = '';

  // Groups creation
  showCreateForm = false;
  newGroupName = '';
  newGroupDesc = '';

  suggestedUsers: User[] = [];

  // Real groups from backend database
  groups: GroupSummary[] = [];
  loadingGroups = false;
  groupsError = '';

  constructor(
    public authService: AuthService,
    public socialService: SocialService,
    private groupService: GroupService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Escuchar parámetros de consulta para cambiar de pestaña activa (ej. ?tab=groups)
    this.route.queryParams.subscribe((params) => {
      const tab = params['tab'];
      if (tab === 'groups' || tab === 'grupos') {
        this.activeTab = 'grupos';
      } else {
        this.activeTab = 'perfil';
      }
      this.cdr.detectChanges();
    });

    this.loadSuggestedUsers();
    this.loadRealGroups();
  }

  loadRealGroups() {
    this.loadingGroups = true;
    this.groupsError = '';
    this.cdr.detectChanges();
    this.groupService.getMyGroups().subscribe({
      next: (data) => {
        this.groups = data;
        this.loadingGroups = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.groupsError = 'Error al cargar los grupos.';
        this.loadingGroups = false;
        this.cdr.detectChanges();
        console.error('Error loading real groups:', err);
      }
    });
  }

  setTab(tab: 'perfil' | 'grupos') {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  startEdit() {
    const user = this.authService.currentUser();
    if (user) {
      this.editUsername = user.username;
      this.editEmail = user.email || '';
      this.editAvatarUrl = user.avatarUrl || '';
      this.isEditing = true;
      this.cdr.detectChanges();
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.cdr.detectChanges();
  }

  saveEdit() {
    if (!this.editUsername.trim() || !this.editEmail.trim()) return;
    this.authService.updateProfile(this.editUsername.trim(), this.editEmail.trim(), this.editAvatarUrl.trim());
    this.isEditing = false;
    this.cdr.detectChanges();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editAvatarUrl = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  loadSuggestedUsers() {
    this.socialService.getSuggestedUsers().subscribe({
      next: (users) => {
        this.suggestedUsers = users;
        this.cdr.detectChanges();
      }
    });
  }

  follow(user: User) {
    this.socialService.followUser(user.id).subscribe({
      next: () => {
        this.loadSuggestedUsers();
        this.cdr.detectChanges();
      }
    });
  }

  unfollow(userId: string) {
    this.socialService.unfollowUser(userId).subscribe({
      next: () => {
        this.loadSuggestedUsers();
        this.cdr.detectChanges();
      }
    });
  }

  createGroup() {
    if (!this.newGroupName.trim()) return;
    this.groupService.createGroup({
      name: this.newGroupName.trim(),
      description: this.newGroupDesc.trim()
    }).subscribe({
      next: () => {
        this.newGroupName = '';
        this.newGroupDesc = '';
        this.showCreateForm = false;
        this.loadRealGroups();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating real group:', err);
        this.cdr.detectChanges();
      }
    });
  }
}
