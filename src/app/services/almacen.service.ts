import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Almacen, CrearAlmacenDto, ActualizarAlmacenDto } from '../interfaces/almacen.interface';

@Injectable({
    providedIn: 'root'
})

export class AlmacenService {

    private http = inject(HttpClient);
    private apiUrl = '';

    getAlmacenes(): Observable<Almacen[]> {
    return this.http.get<Almacen[]>(`${this.apiUrl}/listaralmacenes`);
  }

  getAlmacenesActivos(): Observable<Almacen[]> {
    return this.http.get<Almacen[]>(`${this.apiUrl}/listaralmacenesactivos`);
  }

  crearAlmacen(almacen: CrearAlmacenDto): Observable<Almacen> {
    return this.http.post<Almacen>(`${this.apiUrl}/crearalmacen`, almacen);
  }

  actualizarAlmacen(id: number, almacen: ActualizarAlmacenDto): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}`, almacen);
  }

  borrarAlmacen(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}