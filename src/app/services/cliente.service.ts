import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { CrearClienteDto, Cliente } from '../interfaces/cliente.interface';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class ClienteService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}Cliente`;

    getClientes(): Observable<Cliente[]> {
        return this.http.get<Cliente[]>(`${this.apiUrl}/Listar`);
    }

    crearCliente(cliente: CrearClienteDto): Observable<Cliente> {
        return this.http.post<Cliente>(`${this.apiUrl}/Guardar`, cliente);
    }

    actualizarCliente(id: number, cliente: Cliente): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/Actualizar/${id}`, cliente);
    }

    borrarCliente(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/Eliminar/${id}`);
    }
}