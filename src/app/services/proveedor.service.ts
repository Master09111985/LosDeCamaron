import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proveedor, CrearProveedorDto, ActualizarProveedorDto } from '../interfaces/proveedor.interface';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class ProveedorService {

    private environment: string = environment.apiUrl;
    private http = inject(HttpClient);
    private apiUrl = `${this.environment}proveedor`;

    getProveedores(): Observable<Proveedor[]> {
        return this.http.get<Proveedor[]>(`${this.apiUrl}/listarproveedores`);
    }

    getProveedoresActivos(): Observable<Proveedor[]> {
        return this.http.get<Proveedor[]>(`${this.apiUrl}/listarproveedoresactivos`);
    }

    crearProveedor(proveedor: CrearProveedorDto): Observable<Proveedor> {
        return this.http.post<Proveedor>(`${this.apiUrl}/crearproveedor`, proveedor);
    }

    actualizarProveedor(id: number, proveedor: ActualizarProveedorDto): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}`, proveedor);
    }

    borrarProveedor(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

}