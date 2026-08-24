import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';
import { Rol, CrearRolDto } from '../interfaces/rol.interface';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + 'Rol';

  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.apiUrl}/Listar`);
  }

  crearRol(rol: CrearRolDto): Observable<Rol> {
    return this.http.post<Rol>(`${this.apiUrl}/Guardar`, rol);
  }

  actualizarRol(id: number, rol: Rol): Observable<Rol> {
    return this.http.put<Rol>(`${this.apiUrl}/Actualizar/${id}`, rol);
  }

  borrarRol(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Eliminar/${id}`);
  }
}