export interface ComandaDetalleDto {
  id: number;
  numeroPlato: number;
  platilloId: number;
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
  numeroPlato: number;
  prioridad: number;
  plataformaNombre?: string;
  horaEntrega?: Date;
  subtotal: number;
  total: number;
  fechaRegistro: Date;
  estado: string;
  detalles: ComandaDetalleDto[];

  // --- DATOS DE CLIENTE Y ENTREGA ---
  clienteId?: number;
  nombreClienteLlevar?: string;
  clienteNombre?: string;
  clienteTelefono?: string;
  clienteDireccion?: string;
  direccionEntrega?: string;
  clienteReferencias?: string;
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