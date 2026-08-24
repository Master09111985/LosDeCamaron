import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { UsuarioDto, CrearUsuarioDto } from '../interfaces/usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl + 'Usuario';

  getUsuarios(): Observable<UsuarioDto[]> {
    return this.http.get<UsuarioDto[]>(`${this.apiUrl}/Listar`);
  }

  crearUsuario(usuario: CrearUsuarioDto): Observable<UsuarioDto> {
    return this.http.post<UsuarioDto>(`${this.apiUrl}/Guardar`, usuario);
  }

  actualizarUsuario(id: number, usuario: UsuarioDto): Observable<UsuarioDto> {
    return this.http.put<UsuarioDto>(`${this.apiUrl}/Actualizar/${id}`, usuario);
  }

  borrarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Eliminar/${id}`);
  }
}