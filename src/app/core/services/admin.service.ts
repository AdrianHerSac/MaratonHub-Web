import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminStats {
  totalUsers: number;
  totalReviews: number;
  connectedUsers: number;
  systemStatus: string;
  lastUpdate: string;
  recentUsers: { username: string, createdAt: string, isOnline: boolean }[];
}

export interface UserManagementInfo {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  googleId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`);
  }

  getUsers(): Observable<UserManagementInfo[]> {
    return this.http.get<UserManagementInfo[]>(`${this.apiUrl}/users`);
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`);
  }

  updateUserRole(userId: string, newRole: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/role`, `"${newRole}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
