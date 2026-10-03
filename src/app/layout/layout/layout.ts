import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {

  authService = inject(AuthService);
  private router = inject(Router);

  isSidebarOpen = signal(true);
  isCatalogosOpen = signal(false);
  isPlataformasOpen = signal(false);
  isReportesOpen = signal(false);

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  toggleCatalogos() {
    if (!this.isSidebarOpen()) {
      this.isSidebarOpen.set(true);
      this.isCatalogosOpen.set(true);
    } else {
      this.isCatalogosOpen.update(v => !v);
    }
  }

  togglePlataformas() {
    if (!this.isSidebarOpen()) {
      this.isSidebarOpen.set(true);
      this.isPlataformasOpen.set(true);
    } else {
      this.isPlataformasOpen.update(v => !v);
    }
  }

  toggleReportes() {
    if (!this.isSidebarOpen()) {
      this.isSidebarOpen.set(true);
      this.isReportesOpen.set(true);
    } else {
      this.isReportesOpen.update(v => !v);
    }
  }

  // Método para obtener iniciales del usuario (ej: 'Juan Perez' -> 'JP')
  getIniciales(): string {
    const usuario = this.authService.usuarioActual();
    if (!usuario) return 'US';
    
    // Si tiene empleadoNombre lo usamos, si no, su nombre de usuario
    const nombre = usuario.empleadoNombre || usuario.nombre;
    const partes = nombre.trim().split(' ');
    
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  tienePermiso(nombrePermiso: string): boolean {
    const usuario: any = this.authService.usuarioActual();
    if (!usuario || !usuario.id) return false;

    // Si es Desarrollador o Administrador tiene acceso a todo el menú
    const rol = (usuario.rolNombre || '').toLowerCase();
    if (rol === 'desarrollador' || rol === 'administrador') {
      return true;
    }

    // Validamos en el arreglo de permisos del usuario (soporta array de strings o array de objetos { nombre })
    const permisos: any[] = usuario.permisos || [];
    return permisos.some(p => {
      const nombre = typeof p === 'string' ? p : p?.nombre || p?.permisoNombre || '';
      return nombre.toLowerCase() === nombrePermiso.toLowerCase();
    });
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}