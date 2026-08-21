import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Cliente, CrearClienteDto } from '../interfaces/cliente.interface';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  // Tomamos baseUrl como prioridad según nuestra arquitectura
  private env: string = environment.apiUrl; 
  private http = inject(HttpClient);
  
  private apiUrl = `${this.env}Cliente`;

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/Listar`);
  }

  getCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/Buscar/${id}`);
  }

  getClientePorTelefono(telefono: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/BuscarPorTelefono/${telefono}`);
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