import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../src/environments/environment';
import { RangoFechasDto, ReporteNominaDto } from '../interfaces/nomina.interface';

@Injectable({
  providedIn: 'root'
})
export class NominaService {
  private http = inject(HttpClient);
  // Ajusta la ruta base según cómo nombraste el Controller (ej. 'Nomina')
  private apiUrl = environment.someeUrl + 'Nomina';

  generarReporte(fechas: RangoFechasDto): Observable<ReporteNominaDto[]> {
    return this.http.post<ReporteNominaDto[]>(`${this.apiUrl}/Generar`, fechas);
  }
}