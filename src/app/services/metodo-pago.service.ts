import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MetodoPagos, CrearMetodoPagoDto, ActualizarMetodoPagoDto } from '../interfaces/metodo-pago.interface';
import { environment } from '../environments/environment';
import { MetodoPago } from '../pages/metodo-pago/metodo-pago';

@Injectable({
    providedIn: 'root'
})

export class MetodoPagoService {

    private environment: string = environment.apiUrl;
    private http = inject(HttpClient);
    private apiUrl = `${this.environment}metodopago`;

    getMetodoPagos(): Observable<MetodoPagos[]> {
        return this.http.get<MetodoPagos[]>(`${this.apiUrl}/listarmetodopago`);
    }

    getMetodosPagoActivos(): Observable<MetodoPagos[]> {
        return this.http.get<MetodoPagos[]>(`${this.apiUrl}/listarmetodospagoactivos`);
    }

    crearMetodoPago(metodoPago: CrearMetodoPagoDto): Observable<MetodoPago> {
        return this.http.post<MetodoPago>(`${this.apiUrl}/crearmetodopago`, metodoPago);
    }

    actualizarMetodoPago(id: number, metodoPago: ActualizarMetodoPagoDto): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}`, metodoPago);
    }

    borrarMetodoPago(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}