import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UnidadMedida, CrearUnidadMedidaDto } from "../interfaces/unidadmedida.interface";
import { environment } from "../environments/environment";

@Injectable({
    providedIn: 'root'
})

export class UnidadMedidaService {

    private environment: string = environment.apiUrl; 
    private http = inject(HttpClient);
    private apiUrl = `${this.environment}unidad`;

    getUnidadMedidas(): Observable<UnidadMedida[]> {
        return this.http.get<UnidadMedida[]>(`${this.apiUrl}/listarunidades`);
    }

    getUnidadesActivas(): Observable<UnidadMedida[]> {
        return this.http.get<UnidadMedida[]>(`${this.apiUrl}/listarunidadesactivas`);
    }

    crearUnidad(unidad: CrearUnidadMedidaDto): Observable<UnidadMedida> {
        return this.http.post<UnidadMedida>(`${this.apiUrl}/crearunidad`, unidad);
    }

    actualizarUnidad(id: number, unidad: UnidadMedida): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}`, unidad);
    }

    borrarUnidad(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}