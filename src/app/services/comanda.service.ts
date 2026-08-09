import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { CrearComandaDto } from '../interfaces/comanda.interface';

@Injectable({
  providedIn: 'root'
})
export class ComandaService {
  private env: string = environment.apiUrl;
  private http = inject(HttpClient);
  private apiUrl = `${this.env}Comanda`;

  crearComanda(comanda: CrearComandaDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/Guardar`, comanda);
  }
}