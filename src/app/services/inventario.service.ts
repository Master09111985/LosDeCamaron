import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../environments/environment";
import { Inventario, CrearInventarioDto } from "../interfaces/inventario.interface";

@Injectable({
    providedIn: 'root'
})

export class InventarioService {

    private env: string = environment.apiUrl;
    private http = inject(HttpClient);

    private apiUrl = `${this.env}Inventario`;

    getInventarios(): Observable<Inventario[]> {
        return this.http.get<Inventario[]>(`${this.apiUrl}/Listar`);
    }

    getInventario(id: number): Observable<Inventario> {
        return this.http.get<Inventario>(`${this.apiUrl}/Buscar/${id}`);
    }

    getInventariosPorAlmacen(almacenId: number): Observable<Inventario[]> {
        return this.http.get<Inventario[]>(`${this.apiUrl}/PorAlmacen/${almacenId}`);
    }

    getInventariosPorProducto(productoId: number): Observable<Inventario[]> {
        return this.http.get<Inventario[]>(`${this.apiUrl}/PorProducto/${productoId}`);
    }

    guardarInventario(inventario: CrearInventarioDto): Observable<Inventario> {
        return this.http.post<Inventario>(`${this.apiUrl}/Guardar`, inventario);
    }

    actualizarInventario(id: number, inventario: Inventario): Observable<Inventario> {
        return this.http.put<Inventario>(`${this.apiUrl}/Actualizar/${id}`, inventario);
    }

    eliminarInventario(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/Eliminar/${id}`);
    }
}