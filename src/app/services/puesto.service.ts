import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { CrearPuestoDto, Puesto } from '../interfaces/puesto.interface';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class PuestoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/Puesto`;

    getPuestos(): Observable<Puesto[]> {
        return this.http.get<Puesto[]>(`${this.apiUrl}/listarpuestos`);
    }

    getPuestosActivos(): Observable<Puesto[]> {
        return this.http.get<Puesto[]>(`${this.apiUrl}/listarpuestosactivos`);
    }

    crearPuesto(puesto: CrearPuestoDto): Observable<Puesto> {
        return this.http.post<Puesto>(`${this.apiUrl}/crearpuesto`, puesto);
    }

    actualizarPuesto(id: number, puesto: Puesto): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}`, puesto);
    }

    borrarPuesto(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}