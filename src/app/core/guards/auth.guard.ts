import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {Router} from '@angular/router';

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // @ts-ignore
    return true;
  }

  router.navigate(['/login']);
