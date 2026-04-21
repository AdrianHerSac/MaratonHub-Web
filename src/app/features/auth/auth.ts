import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SocialAuthService, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, GoogleSigninButtonModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthComponent implements OnInit {
  isLogin = true;
  username = '';
  password = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private socialAuthService: SocialAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.socialAuthService.authState.subscribe((user) => {
      if (user && user.idToken) {
        this.authService.googleLogin(user.idToken).subscribe({
          next: () => this.router.navigate(['/']),
          error: (err) => {
            console.error(err);
            this.errorMessage = 'Falló el inicio de sesión con Google.';
          }
        });
      }
    });
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
  }

  onSubmit() {
    if (!this.username || !this.password) return;

    if (this.isLogin) {
      this.authService.login(this.username, this.password).subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => {
          this.errorMessage = 'Usuario o contraseña incorrectos.';
        }
      });
    } else {
      this.authService.register(this.username, this.password).subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => {
          this.errorMessage = 'Error en el registro. Quizás el usuario ya existe.';
        }
      });
    }
  }
}
