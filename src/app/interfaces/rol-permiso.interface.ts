export interface RolPermisoDto {
  id: number;
  rolId: number;
  permisoId: number;
  permisoNombre: string;
  permisoDescripcion?: string;
  habilitado: boolean;
}

export interface PermisoActualizar {
  permisoId: number;
  habilitado: boolean;
}

export interface ActualizarPermisosRolDto {
  rolId: number;
  permisos: PermisoActualizar[];
}