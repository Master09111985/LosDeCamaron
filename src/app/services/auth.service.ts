import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

import { environment } from '../../../src/environments/environment';
import { LoginDto, UsuarioDto } from "../interfaces/auth.interface";

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

  // 2. Traer los permisos según el Rol
  getPermisosPorRol(rolId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}RolPermiso/PorRol/${rolId}`);
  }

  // 3. Guardar usuario y permisos normalizados en el sessionStorage
  guardarSesion(usuario: any, respuestaPermisos: any): void {
    localStorage.clear();

    // Aseguramos que el usuario tenga su propiedad id normalizada
    const usuarioNormalizado: UsuarioDto = {
      ...usuario,
      id: usuario.id ?? usuario.Id ?? usuario.usuarioId ?? 1,
      nombre: usuario.nombre ?? usuario.Nombre ?? '',
      rolId: usuario.rolId ?? usuario.RolId,
      rolNombre: usuario.rolNombre ?? usuario.RolNombre ?? ''
    };

    const dicPermisos = this.normalizarPermisos(respuestaPermisos);

    sessionStorage.setItem('usuario', JSON.stringify(usuarioNormalizado));
    sessionStorage.setItem('permisos', JSON.stringify(dicPermisos));

    this.usuarioActual.set(usuarioNormalizado);
    this.permisosActuales.set(dicPermisos);
  }

  // Convierte cualquier formato de respuesta de RolPermiso en Record<string, boolean>
  private normalizarPermisos(data: any): Record<string, boolean> {
    const mapa: Record<string, boolean> = {};
    if (!data) return mapa;

    // Caso 1: Viene como { permisos: { "Almacenes": true, ... } } o { Permisos: ... }
    const fuente = data.permisos ?? data.Permisos ?? data;

    // Caso 2: Si la fuente es un Arreglo (colección de permisos desde .NET)
    if (Array.isArray(fuente)) {
      for (const item of fuente) {
        if (typeof item === 'string') {
          mapa[item] = true;
        } else if (item && typeof item === 'object') {
          const nombre = item.permisoNombre || item.nombrePermiso || item.nombre || item.PermisoNombre || item.Nombre;
          // Si tiene propiedad activo/asignado/estado la respetamos, si solo devuelve los asignados es true
          const activo = item.asignado ?? item.activo ?? item.estado ?? item.tienePermiso ?? true;
          if (nombre) {
            mapa[nombre] = Boolean(activo);
          }
        }
      }
      return mapa;
    }

    // Caso 3: Si ya es un objeto diccionario { "VerCatalogos": true, "Almacenes": true }
    if (typeof fuente === 'object') {
      for (const key of Object.keys(fuente)) {
        if (key !== 'rolId' && key !== 'rolNombre' && key !== 'RolId' && key !== 'RolNombre') {
          mapa[key] = Boolean(fuente[key]);
        }
      }
    }

    return mapa;
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

    if (mapa[nombrePermiso] === true) return true;

    const claveEncontrada = Object.keys(mapa).find(
      k => k.toLowerCase() === nombrePermiso.toLowerCase()
    );
    return claveEncontrada ? mapa[claveEncontrada] === true : false;
  }

  // 6. Obtener los datos del usuario logueado al recargar con F5
  private cargarSesionInicial(): void {
    localStorage.clear();
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