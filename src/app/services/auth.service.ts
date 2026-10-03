import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

import { environment } from '../../../src/environments/environment';
import { LoginDto, MapaPermisosDto, UsuarioDto } from "../interfaces/auth.interface";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.someeUrl;
  private http = inject(HttpClient);

  usuarioActual = signal<UsuarioDto | null>(null);
  permisosActuales = signal<Record<string, boolean>>({});

  constructor() {
    this.cargarSesionInicial();        
  }

  // 1. Enviar credenciales a la API
  login(credenciales: LoginDto): Observable<any> {
    return this.http.post(`${this.apiUrl}Usuario/Login`, credenciales);
  }

  // 2. Traer el diccionario de permisos según el Rol
  getPermisosPorRol(rolId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}RolPermiso/PorRol/${rolId}`);
  }

  // 3. Guardar usuario y permisos en el sessionStorage
  guardarSesion(usuario: UsuarioDto, mapa: MapaPermisosDto): void {
    localStorage.clear(); // Limpiamos cualquier sesión vieja que haya quedado en localStorage
    const dicPermisos = mapa?.permisos || {};
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
    sessionStorage.setItem('permisos', JSON.stringify(dicPermisos));
    
    this.usuarioActual.set(usuario);
    this.permisosActuales.set(dicPermisos);
  }

  // 4. Limpiar la sesión al salir
  cerrarSesion(): void {
    localStorage.clear();
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('permisos');
    sessionStorage.clear();
    this.usuarioActual.set(null);
    this.permisosActuales.set({});
  }

  // 5. Verificar si tiene permiso exclusivamente por el mapa de su Rol
  tienePermiso(nombrePermiso: string): boolean {
    const mapa = this.permisosActuales();
    if (!mapa) return false;

    // Verificación directa
    if (mapa[nombrePermiso] === true) return true;

    // Verificación insensible a mayúsculas/minúsculas por seguridad
    const claveEncontrada = Object.keys(mapa).find(
      k => k.toLowerCase() === nombrePermiso.toLowerCase()
    );
    return claveEncontrada ? mapa[claveEncontrada] === true : false;
  }

  // 6. Obtener los datos del usuario logueado al recargar con F5
  private cargarSesionInicial(): void {
    localStorage.clear(); // Evita que cargue sesiones viejas de pruebas
    const usuarioStr = sessionStorage.getItem('usuario');
    const permisosStr = sessionStorage.getItem('permisos');
  
    if (usuarioStr && permisosStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        const permisos = JSON.parse(permisosStr);

        if (usuario && usuario.id && usuario.nombre !== 'Tester Local') {
          this.usuarioActual.set(usuario);
          this.permisosActuales.set(permisos);
        } else {
          this.cerrarSesion();
        }
      } catch {
        this.cerrarSesion();
      }
    }
  }
}