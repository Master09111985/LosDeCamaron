import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.usuarioActual();

  // 1. Si no ha iniciado sesión, lo mandamos al Login
  if (!usuario) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};