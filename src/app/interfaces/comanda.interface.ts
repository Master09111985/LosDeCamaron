// ==========================================
// DTOs PARA ENVIAR AL BACKEND
// ==========================================

export interface CrearComandaDto {
  tipoPedido: number; // 1: Local, 2: Llevar, 3: Domicilio, 4: Agendado, 5: Plataforma
  numeroMesa?: string;
  nombreClienteLlevar?: string;
  clienteId?: number;
  fechaHoraAgendada?: string; // Formato ISO de fecha (Ej. 2026-08-10T14:30:00Z)
  plataformaId?: number;
  metodoPagoId: number;
  detalles: CrearComandaDetalleDto[];
}

export interface CrearComandaDetalleDto {
  platilloId: number;
  cantidad: number;
  precioUnitario: number;
  notas?: string; // Las notas para el cocinero (Sin cebolla, etc.)
}

// ==========================================
// INTERFAZ VISUAL PARA EL CARRITO (FRONTEND)
// ==========================================

export interface ItemCarrito {
  platilloId: number;
  nombre: string;
  fotoUrl: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notas: string;
}