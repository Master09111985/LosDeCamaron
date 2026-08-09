import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

// Asegúrate de tener estas interfaces exportadas en un archivo baja.interface.ts
import { BajaDto, CrearBajaDto } from '../interfaces/baja.interface'; 

@Injectable({
  providedIn: 'root'
})

export class BajaService {
  private env: string = environment.apiUrl;
  private http = inject(HttpClient);
  private apiUrl = `${this.env}Baja`;

  getBajas(): Observable<BajaDto[]> {
    return this.http.get<BajaDto[]>(`${this.apiUrl}/Listar`);
  }

  crearBaja(baja: CrearBajaDto): Observable<BajaDto> {
    return this.http.post<BajaDto>(`${this.apiUrl}/Guardar`, baja);
  }
}