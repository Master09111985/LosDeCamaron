export interface Platillo {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  codigo: string;
  fotoUrl: string;
  fechaRegistro: string; // ISO String
  estado: boolean;
}