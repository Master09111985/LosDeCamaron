import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.usuarioActual();

  // Verificamos que exista un usuario real con id válido y que NO sea un usuario de prueba
  if (usuario && usuario.id && usuario.nombre !== 'Tester Local') {
    return true;
  }

  // Si no hay credenciales válidas, limpiamos cualquier rastro y mandamos a /login
  localStorage.clear();
  sessionStorage.clear();
  router.navigate(['/login']);
  return false;
};