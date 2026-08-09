import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Platillo } from '../interfaces/platillo.interface';

@Injectable({
  providedIn: 'root'
})
export class PlatilloService {
  private env: string = environment.apiUrl;
  private http = inject(HttpClient);
  private apiUrl = `${this.env}Platillo`;

  getPlatillos(): Observable<Platillo[]> {
    return this.http.get<Platillo[]>(`${this.apiUrl}/Listar`);
  }

  // Filtrado en memoria ya que no creamos un ListarActivos en tu backend de platillos
  getProductosActivos(): Observable<Platillo[]> {
      return this.http.get<Platillo[]>(`${this.apiUrl}/Listar`);
  }

  // IMPORTANTE: Recibe FormData en lugar de un DTO normal
  crearPlatillo(formData: FormData): Observable<Platillo> {
    return this.http.post<Platillo>(`${this.apiUrl}/Guardar`, formData);
  }

  actualizarPlatillo(id: number, formData: FormData): Observable<Platillo> {
    return this.http.put<Platillo>(`${this.apiUrl}/Actualizar/${id}`, formData);
  }

  borrarPlatillo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Eliminar/${id}`);
  }
}