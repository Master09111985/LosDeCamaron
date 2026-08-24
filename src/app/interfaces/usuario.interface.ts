export interface UsuarioDto {
  id: number;
  nombre: string;
  fechaRegistro?: Date | string;
  estado: boolean;
  rolId: number;
  rolNombre?: string;
  empleadoId?: number;
  empleadoNombre?: string;
}

export interface CrearUsuarioDto {
  nombre: string;
  password?: string; // Opcional porque solo se envía al crear
  rolId: number;
  empleadoId?: number;
}