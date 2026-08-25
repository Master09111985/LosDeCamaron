export interface CajaTurno {
  id: number;
  usuarioCajeroId: number;
  fondoInicial: number;
  fechaApertura: string;
  estaAbierta: boolean;
}

export interface TicketCorteDto {
  turnoId: number;
  nombreCajero: string;
  nombreSupervisor: string;
  fechaApertura: string;
  fechaCierre: string;
  fondoInicial: number;
  totalVentasEfectivo: number;
  totalVentasTarjeta: number;
  totalPagosProveedores: number;
  efectivoCalculadoSistema: number;
  efectivoFisicoReportado: number;
  diferencia: number;
}