import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { MotivoBaja, CrearMotivoBajaDto } from '../interfaces/motivo-baja.interface';

@Injectable({
    providedIn: 'root'
})

export class MotivoBajaService {
    
    private env: string = environment.apiUrl;
    private http = inject(HttpClient);
    private apiUrl = `${this.env}MotivoBaja`;

    getMotivos(): Observable<MotivoBaja[]> {
        return this.http.get<MotivoBaja[]>(`${this.apiUrl}/Listar`);
    }

    getMotivosActivos(): Observable<MotivoBaja[]> {
        return this.http.get<MotivoBaja[]>(`${this.apiUrl}/ListarActivos`);
    }

    crearMotivo(motivo: CrearMotivoBajaDto): Observable<MotivoBaja> {
    return this.http.post<MotivoBaja>(`${this.apiUrl}/Guardar`, motivo);
  }

  actualizarMotivo(id: number, motivo: MotivoBaja): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Actualizar/${id}`, motivo);
  }

  borrarMotivo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Eliminar/${id}`);
  }

}