import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SocialAuthService } from '@abacritt/angularx-social-login';

export interface UserInfo {
  username: string;
  role: string;
  email?: string;
  id?: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'maratonhub_token';
  private userKey = 'maratonhub_user';
  private roleKey = 'maratonhub_role';

  public currentUser: WritableSignal<UserInfo | null> = signal(null);

  constructor(
    private http: HttpClient,
    private socialAuthService: SocialAuthService
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem(this.tokenKey);
    const username = localStorage.getItem(this.userKey);
    const role = localStorage.getItem(this.roleKey);
    if (token && username) {
      let id = undefined;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        id = payload.sub;
      } catch (e) {}

      this.currentUser.set({ 
        username, 
        role: role || 'User',
        id: id
      });
    }
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  public isAdmin(): boolean {
    return this.currentUser()?.role === 'Admin' || this.currentUser()?.username === 'Adrian';
  }

  public register(username: string, password: string):Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { username, password })
      .pipe(tap(res => this.handleAuthSuccess(res)));
  }

  public login(username: string, password: string):Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(tap(res => this.handleAuthSuccess(res)));
  }

  public googleLogin(idToken: string):Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/google-login`, { idToken })
      .pipe(tap(res => this.handleAuthSuccess(res)));
  }

  public logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.roleKey);
    this.currentUser.set(null);
    try {
      this.socialAuthService.signOut().catch(() => {});
    } catch (error) {
      console.error('Error signing out from Google:', error);
    }
  }

  private handleAuthSuccess(response: AuthResponse) {
    console.log('--- DEBUG AUTH ---');
    console.log('Usuario:', response.username);
    console.log('Rol recibido:', response.role);
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, response.username);
    localStorage.setItem(this.roleKey, response.role);
    
    let id = undefined;
    try {
      const payload = JSON.parse(atob(response.token.split('.')[1]));
      id = payload.sub;
    } catch (e) {}

    this.currentUser.set({ username: response.username, role: response.role, id: id });
  }
}
