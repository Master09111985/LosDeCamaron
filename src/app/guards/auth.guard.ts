import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Verificamos el signal de usuario actual
    if (authService.usuarioActual()) {
        return true; // Tine sesion, lo dejamos pasar
    }

    // No tiene sesion, lo mandamos al login
    router.navigate(['/login']);
    return false;
};