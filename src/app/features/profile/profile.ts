import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SocialService, User, FriendGroup } from '../../core/services/social.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private authService = inject(AuthService);
  private socialService = inject(SocialService);
  private route = inject(ActivatedRoute);
  
  currentUser = this.authService.currentUser;
  activeTab: string = 'perfil';

  // Social Data
  following = this.socialService.following;
  groups = this.socialService.groups;
  suggestedUsers: User[] = [];
  
  // Create Group Form
  newGroupName: string = '';
  newGroupDesc: string = '';
  showCreateGroup: boolean = false;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
    });

    this.loadSuggestedUsers();
  }

  loadSuggestedUsers() {
    this.socialService.getSuggestedUsers().subscribe(users => {
      this.suggestedUsers = users;
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  follow(userId: string) {
    this.socialService.followUser(userId).subscribe(() => {
      this.loadSuggestedUsers();
    });
  }

  unfollow(userId: string) {
    this.socialService.unfollowUser(userId).subscribe(() => {
      this.loadSuggestedUsers();
    });
  }

  createGroup() {
    if (this.newGroupName.trim()) {
      this.socialService.createGroup(this.newGroupName, this.newGroupDesc).subscribe(() => {
        this.newGroupName = '';
        this.newGroupDesc = '';
        this.showCreateGroup = false;
      });
    }
  }
}
