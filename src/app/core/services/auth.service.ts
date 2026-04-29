import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SocialAuthService } from '@abacritt/angularx-social-login';

export interface UserInfo {
  username: string;
}

export interface AuthResponse {
  token: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'maratonhub_token';
  private userKey = 'maratonhub_user';

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
    if (token && username) {
      this.currentUser.set({ username });
    }
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public isLoggedIn(): boolean {
    return this.currentUser() !== null;
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
    this.currentUser.set(null);
    try {
      this.socialAuthService.signOut().catch(() => {});
    } catch (error) {
      console.error('Error signing out from Google:', error);
    }
  }

  private handleAuthSuccess(response: AuthResponse) {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, response.username);
    this.currentUser.set({ username: response.username });
  }
}
