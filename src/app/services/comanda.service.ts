import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ComandaDto, CrearComandaDetalleDto, CrearComandaDto } from '../interfaces/comanda.interface';

@Injectable({
  providedIn: 'root'
})
export class ComandaService {
  private env: string = environment.apiUrl; 
  private http = inject(HttpClient);
  private apiUrl = `${this.env}comanda`;

  getComandas(): Observable<ComandaDto[]> {
    return this.http.get<ComandaDto[]>(`${this.apiUrl}/listar`);
  }

  getComanda(id: number): Observable<ComandaDto> {
    return this.http.get<ComandaDto>(`${this.apiUrl}/buscar/${id}`);
  }

  crearComanda(comanda: CrearComandaDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crearcomanda`, comanda);
  }

  agregarPlatillosAComanda(comandaId: number, detalles: CrearComandaDetalleDto[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${comandaId}/agregar-platillos`, detalles);
  }

  cambiarEstatus(id: number, nuevoEstatus: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/cambiarestatus/${id}`, nuevoEstatus);
  }

  pagarComanda(id: number, metodoPagoId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/pagar/${id}`, metodoPagoId);
  }
}