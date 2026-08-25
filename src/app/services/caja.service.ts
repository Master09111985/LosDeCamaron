import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { CajaTurno, TicketCorteDto } from '../interfaces/caja.interface';

@Injectable({ providedIn: 'root' })
export class CajaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}caja`;

  getTurnoAbierto(cajeroId: number): Observable<CajaTurno> {
    return this.http.get<CajaTurno>(`${this.apiUrl}/turno-abierto/${cajeroId}`);
  }

  abrirTurno(data: any): Observable<CajaTurno> {
    return this.http.post<CajaTurno>(`${this.apiUrl}/abrir`, data);
  }

  cobrarComanda(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cobrar`, data);
  }

  pagarProveedor(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/pago-proveedor`, data);
  }

  cerrarTurno(data: any): Observable<TicketCorteDto> {
    return this.http.post<TicketCorteDto>(`${this.apiUrl}/cerrar`, data);
  }
}