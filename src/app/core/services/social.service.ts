import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';

export interface User {
  id: string;
  username: string;
  avatar?: string;
  isFollowing?: boolean;
}

export interface FriendGroup {
  id: string;
  name: string;
  members: User[];
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocialService {
  private apiUrl = `${environment.apiUrl}/social`;

  // Mock data
  private mockUsers: User[] = [
    { id: '1', username: 'PacoGamer', isFollowing: true },
    { id: '2', username: 'Cinefila99', isFollowing: false },
    { id: '3', username: 'SeriesLover', isFollowing: true },
    { id: '4', username: 'MaratonMan', isFollowing: false },
  ];

  private mockGroups: FriendGroup[] = [
    {
      id: '1',
      name: 'Los Vengadores del Cine',
      description: 'Grupo para comentar pelis de Marvel',
      members: [this.mockUsers[0], this.mockUsers[1]]
    }
  ];

  following = signal<User[]>(this.mockUsers.filter(u => u.isFollowing));
  groups = signal<FriendGroup[]>(this.mockGroups);

  constructor(private http: HttpClient) { }

  followUser(userId: string): Observable<any> {
    const user = this.mockUsers.find(u => u.id === userId);
    if (user) {
      user.isFollowing = true;
      this.following.set(this.mockUsers.filter(u => u.isFollowing));
    }
    return of({ success: true });
  }

  unfollowUser(userId: string): Observable<any> {
    const user = this.mockUsers.find(u => u.id === userId);
    if (user) {
      user.isFollowing = false;
      this.following.set(this.mockUsers.filter(u => u.isFollowing));
    }
    return of({ success: true });
  }

  createGroup(name: string, description: string): Observable<FriendGroup> {
    const newGroup: FriendGroup = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      members: []
    };
    this.groups.update(gs => [...gs, newGroup]);
    return of(newGroup);
  }

  getSuggestedUsers(): Observable<User[]> {
    return of(this.mockUsers.filter(u => !u.isFollowing));
  }
}
