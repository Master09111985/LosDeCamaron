import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { RegistrarChecadaDto, RespuestaChecadaDto } from '../interfaces/asistencia.interface';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}asistencia`;

  registrarChecada(datos: RegistrarChecadaDto): Observable<RespuestaChecadaDto> {
    return this.http.post<RespuestaChecadaDto>(`${this.apiUrl}/registrar`, datos)
      .pipe(
        catchError(this.handleError)
      );
  }


  private handleError(error: HttpErrorResponse) {
    let mensajeError = 'Error de conexión con el servidor.';
    
    if (error.error && error.error.mensaje) {
      mensajeError = error.error.mensaje;
    }

    return throwError(() => new Error(mensajeError));
  }
}