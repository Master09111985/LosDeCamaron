export interface Rol {
  id: number;
  nombre: string;
  categoria?: string;
  funcion?: string;
}

export interface CrearRolDto {
  nombre: string;
  categoria?: string;
  funcion?: string;
}