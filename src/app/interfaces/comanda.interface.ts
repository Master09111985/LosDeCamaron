export interface CrearComandaDto {
  tipoPedido: string;
  numeroMesa?: string;
  plataformaNombre?: string;
  direccionEntrega?: string;
  horaEntrega?: string;
  detalles: CrearComandaDetalleDto[];
}

export interface CrearComandaDetalleDto {
  platilloId: number;
  cantidad: number;
  precioUnitario: number;
  notas?: string;
}

export interface ItemCarrito {
  platilloId: number;
  nombre: string;
  fotoUrl: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notas: string;
}