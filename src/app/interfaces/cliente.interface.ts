export interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  direccion?: string;
  referencias?: string;
}

export interface CrearClienteDto {
  nombre: string;
  telefono: string;
  direccion?: string;
  referencias?: string;
}