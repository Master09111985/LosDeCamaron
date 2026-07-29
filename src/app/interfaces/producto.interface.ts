export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  fechaRegistro: string | Date;
  estado: boolean;
  cantidadTotal: number;
}

export interface CrearProductoDto {
  nombre: string;
  descripcion?: string;
}

export interface ActualizarProductoDto {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
}