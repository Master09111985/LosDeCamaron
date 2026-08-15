import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plataforma, CrearPlataformaDto, ActualizarPlataformaDto } from '../interfaces/plataforma.interface';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class PlataformaService {

    private environment: string = environment.apiUrl;
    private http = inject(HttpClient);
    private apiUrl = `${this.environment}plataforma`;

    getPlataformas(): Observable<Plataforma[]> {
        return this.http.get<Plataforma[]>(`${this.apiUrl}/listarplataformas`);
    }

    getPlataformasActivas(): Observable<Plataforma[]> {
        return this.http.get<Plataforma[]>(`${this.apiUrl}/listarplataformasactivas`);
    }

    crearPlataforma(plataforma: CrearPlataformaDto): Observable<Plataforma> {
        return this.http.post<Plataforma>(`${this.apiUrl}/crearplataforma`, plataforma);
    }

    actualizarPlataforma(id: number, plataforma: ActualizarPlataformaDto): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}`, plataforma);
    }

    borrarPlataforma(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

}