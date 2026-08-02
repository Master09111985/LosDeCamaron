import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from '../environments/environment';
import { CrearEmpleadoDto, ActualizarEmpleadoDto, Empleado } from "../interfaces/empleado.interface";
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class EmpleadoService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}Empleado`;

    getEmpleados(): Observable<Empleado[]> {
        return this.http.get<Empleado[]>(`${this.apiUrl}/Listar`);
    }

    getEmpleado(id: number): Observable<Empleado> {
        return this.http.get<Empleado>(`${this.apiUrl}/Buscar/${id}`);
    }

    getEmpleadoPorCodigo(codigo: string): Observable<Empleado> {
        return this.http.get<Empleado>(`${this.apiUrl}/BuscarPorCodigo/${codigo}`);
    }

    crearEmpleado(empleadoDto: CrearEmpleadoDto): Observable<Empleado> {
        const formData = new FormData();
        formData.append('nombre', empleadoDto.nombre);
        formData.append('direccion', empleadoDto.direccion);
        formData.append('telefono', empleadoDto.telefono);
        formData.append('edad', empleadoDto.edad);
        formData.append('salarioSemanal', empleadoDto.salarioSemanal.toString());

        // Checar si es fecha
        const fecha = typeof empleadoDto.fechaContrato === 'string' 
        ? empleadoDto.fechaContrato 
        : empleadoDto.fechaContrato.toISOString();

        formData.append('fechaContrato', fecha);
        formData.append('puestoId', empleadoDto.puestoId.toString());
        formData.append('foto', empleadoDto.foto);

        return this.http.post<Empleado>(`${this.apiUrl}/Guardar`, formData);
    }

    actualizarEmpleado(id: number, empleadoDto: ActualizarEmpleadoDto): Observable<Empleado> {
        const formData = new FormData();
        formData.append('id', empleadoDto.id.toString());
        formData.append('nombre', empleadoDto.nombre);
        formData.append('direccion', empleadoDto.direccion);
        formData.append('telefono', empleadoDto.telefono);
        formData.append('edad', empleadoDto.edad);
        formData.append('salarioSemanal', empleadoDto.salarioSemanal.toString());
    
        const fecha = typeof empleadoDto.fechaContrato === 'string' 
        ? empleadoDto.fechaContrato 
        : empleadoDto.fechaContrato.toISOString();
      
        formData.append('fechaContrato', fecha);
        formData.append('estado', empleadoDto.estado ? 'true' : 'false');
        formData.append('puestoId', empleadoDto.puestoId.toString());
    
        if (empleadoDto.foto) {
            formData.append('foto', empleadoDto.foto);
        }

        return this.http.put<Empleado>(`${this.apiUrl}/Actualizar/${id}`, formData);
    }

    borrarEmpleado(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/Eliminar/${id}`);
  }
}