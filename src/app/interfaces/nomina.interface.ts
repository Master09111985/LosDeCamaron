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
  totalAPagar: number;
  totalAsistencias: number;
}