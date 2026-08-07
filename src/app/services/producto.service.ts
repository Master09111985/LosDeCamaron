import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Producto, CrearProductoDto, ActualizarProductoDto } from '../interfaces/producto.interface';

@Injectable({
    providedIn: 'root'
})

export class ProductoService {

    private environment: string = environment.apiUrl;
    private http = inject(HttpClient);
    private apiUrl = `${this.environment}Producto`;

    getProductos(): Observable<Producto[]> {
        return this.http.get<Producto[]>(`${this.apiUrl}/Listar`);
    }

    getProductosActivos(): Observable<Producto[]> {
        return this.http.get<Producto[]>(`${this.apiUrl}/ListarActivos`);
    }

    crearProducto(producto: CrearProductoDto): Observable<Producto> {
        return this.http.post<Producto>(`${this.apiUrl}/Guardar`, producto);
    }

    actualizarProducto(id: number, producto: ActualizarProductoDto):Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/Actualizar/${id}`, producto);
    }

    borrarProducto(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}Eliminar/${id}`);
    }
}