import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Permiso, CrearPermisoDto } from '../interfaces/permiso.interface';

@Injectable({
  providedIn: 'root'
})

export class PermisoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + 'Permiso';

  getPermisos(): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(`${this.apiUrl}/Listar`);
  }

  crearPermiso(permiso: CrearPermisoDto): Observable<Permiso> {
    return this.http.post<Permiso>(`${this.apiUrl}/Guardar`, permiso);
  }

  actualizarPermiso(id: number, permiso: Permiso): Observable<Permiso> {
    return this.http.put<Permiso>(`${this.apiUrl}/Actualizar/${id}`, permiso);
  }

  borrarPermiso(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Eliminar/${id}`);
  }
}