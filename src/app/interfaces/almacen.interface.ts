export interface Almacen {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
}

export interface CrearAlmacenDto {
  nombre: string;
  descripcion?: string;
  estado: boolean;
}

export interface ActualizarAlmacenDto {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
}