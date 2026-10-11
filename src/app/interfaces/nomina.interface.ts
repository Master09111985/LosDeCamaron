export interface RangoFechasDto {
  fechaInicio: string;
  fechaFin: string;
}

export interface ReporteNominaDto {
  empleadoId: number;
  nombreEmpleado: string;
  salarioSemanal: number;
  pagoPorMinuto: number;
  totalMinutosTrabajados: number;
  minutosRetardo: number;
  descuentoRetardos: number;
  totalAPagar: number;
  totalAsistencias: number;
}