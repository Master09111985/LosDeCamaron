export interface Permiso {
  id: number;
  nombre: string;
  descripcion?: string; // Es opcional
}

export interface CrearPermisoDto {
  nombre: string;
  descripcion?: string;
}