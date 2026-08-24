import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

import { environment } from "../environments/environment";
import { LoginDto, MapaPermisosDto, UsuarioDto } from "../interfaces/auth.interface";


@Injectable({
    providedIn: 'root'
})

export class AuthService {

    private apiUrl = environment.apiUrl;
    private http = inject(HttpClient);

    usuarioActual = signal<UsuarioDto | null>(null);
    permisosActuales = signal<Record<string, boolean>>({});

    constructor() {
        this.cargarSesionInicial();        
    }

    // 1. Enviar credenciales a la API
    login(credenciales: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/Usuario/Login`, credenciales);
    }

    // 2. Traer el diccionario de permisos segun el Rol
    getPermisosPorRol(rolId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/RolPermiso/PorRol/${rolId}`);
    }

    // 3. Guardar usuario y permisos en el localStorage
    guardarSesion(usuario: UsuarioDto, mapa: MapaPermisosDto): void {
        localStorage.setItem('usuario', JSON.stringify(usuario));
        // Guardamos solo el diccionario de permisos {"Ventas": true, ...}
        localStorage.setItem('permisos', JSON.stringify(mapa.permisos));
        // Actualizamos las signals
        this.usuarioActual.set(usuario);
        this.permisosActuales.set(mapa.permisos);
    }

    // 4. Limpiar la sesion al salir
    cerrarSesion(): void {
        localStorage.removeItem('usuario');
        localStorage.removeItem('permisos');
        this.usuarioActual.set(null);
        this.permisosActuales.set({});
    }

    // 5. Verificar si tiene permiso
    tienePermiso(nombrePermiso: string): boolean {
        return this.permisosActuales()[nombrePermiso] === true;
    }

    // 6. Obtener los datos del usuario logueado
    private cargarSesionInicial(): void {
        const usuarioStr = localStorage.getItem('usuario');
        const permisosStr = localStorage.getItem('permisos');
    
        if (usuarioStr && permisosStr) {
        this.usuarioActual.set(JSON.parse(usuarioStr));
        this.permisosActuales.set(JSON.parse(permisosStr));
        }
    }

}