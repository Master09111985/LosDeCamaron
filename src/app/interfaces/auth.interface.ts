export interface LoginDto {
  nombre: string;
  password?: string; 
}

export interface UsuarioDto {
  id: number;
  nombre: string;
  rolId: number;
  rolNombre?: string;
  empleadoId?: number;
  empleadoNombre?: string;
  estado: boolean;
}

export interface MapaPermisosDto {
  rolId: number;
  rolNombre: string;
  permisos: Record<string, boolean>; // Esto tipa el diccionario de C#
}