import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { RolPermisoDto, ActualizarPermisosRolDto } from '../interfaces/rol-permiso.interface';

@Injectable({
  providedIn: 'root'
})
export class RolPermisoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + 'RolPermiso';

  // Obtenemos todos y filtramos por el rol en Angular
  getPermisosDeUnRol(rolId: number): Observable<RolPermisoDto[]> {
    return this.http.get<RolPermisoDto[]>(`${this.apiUrl}/Listar`).pipe(
      map(todos => todos.filter(rp => rp.rolId === rolId))
    );
  }

  // Guardar los cambios masivos
  actualizarPermisos(data: ActualizarPermisosRolDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/ActualizarPorRol`, data);
  }
}