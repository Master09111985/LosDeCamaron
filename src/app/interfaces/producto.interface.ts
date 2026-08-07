export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  unidadId: number;
  unidadNombre: string;
  fechaRegistro: string | Date;
  estado: boolean;
}

export interface CrearProductoDto {
  nombre: string;
  descripcion?: string;
  unidadId: number;
}

export interface ActualizarProductoDto {
  id: number;
  nombre: string;
  descripcion?: string;
  unidadId: number;
  estado: boolean;
}