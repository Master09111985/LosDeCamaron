export interface BajaDto {
  id: number;
  cantidad: number;
  fechaBaja: string; // Se maneja como string en formato ISO desde la API
  comentarios?: string;

  // Datos del Inventario (Aplanados)
  inventarioId: number;
  productoNombre: string;
  almacenNombre: string;
  unidadMedidaNombre: string;

  // Datos del Motivo
  motivoBajaId: number;
  motivoBajaNombre: string;
}

export interface CrearBajaDto {
  productoId: number;
  almacenId: number;
  cantidad: number;
  motivoBajaId: number;
  comentarios?: string;
}