export interface Empleado {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  edad: string;
  salarioSemanal: number;
  codigo: string;
  fechaContrato: string | Date;
  fechaRegistro: string | Date;
  fotoUrl: string;
  estado: boolean;
  puestoId: number;
  puestoNombre?: string;
}

export interface CrearEmpleadoDto {
  nombre: string;
  direccion: string;
  telefono: string;
  edad: string;
  salarioSemanal: number;
  fechaContrato: string | Date;
  puestoId: number;
  foto: File;
}

export interface ActualizarEmpleadoDto extends CrearEmpleadoDto {
  id: number;
  estado: boolean;
}