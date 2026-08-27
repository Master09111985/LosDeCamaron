export interface ComandaDetalleDto {
  id: number;
  platilloId: number;
  numeroPlato: number;
  platilloNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notas?: string;
}

export interface ComandaDto {
  id: number;
  tipoPedido: string;
  numeroMesa?: string;
  plataformaNombre?: string;
  direccionEntrega?: string;
  horaEntrega?: string;
  subtotal: number;
  total: number;
  fechaRegistro: string;
  estado: string;
  detalles: ComandaDetalleDto[];
}

export interface CrearComandaDetalleDto {
  platilloId: number;
  numeroPlato: number;
  cantidad: number;
  precioUnitario: number;
  notas?: string;
}

export interface CrearComandaDto {
  tipoPedido: number;
  numeroMesa?: string;
  nombreClienteLlevar?: string;
  clienteId?: number;
  fechaHoraAgendada?: string;
  plataformaId?: number;
  detalles: CrearComandaDetalleDto[];
}