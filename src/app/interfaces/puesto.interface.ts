export interface Puesto {
  id: number;
  nombre: string;
  estado: boolean;
}

export interface CrearPuestoDto {
  nombre: string;
  estado: boolean;
}