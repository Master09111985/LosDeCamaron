import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.usuarioActual();

  // 1. Verificamos que exista un usuario real logueado
  if (!usuario || !usuario.id || usuario.nombre === 'Tester Local') {
    authService.cerrarSesion();
    return router.createUrlTree(['/login']);
  }

  // 2. Si la ruta exige un permiso específico en data.permiso, lo validamos contra su Rol
  const permisoRequerido = route.data?.['permiso'] as string | undefined;
  if (permisoRequerido && !authService.tienePermiso(permisoRequerido)) {
    return router.createUrlTree(['/']);
  }

  return true;
};