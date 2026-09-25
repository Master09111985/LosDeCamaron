import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    // DESACTIVADO PARA PRUEBAS LOCALES - Siempre permite el acceso
    return true; 
    
    /* Código original comentado:
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.usuarioActual()) {
        return true; 
    }

    router.navigate(['/login']);
    return false;
    */
};