export interface Proveedor {
    id: number;
    nombre: string;
    comentario?: string;
    estado: boolean;
}

export interface CrearProveedorDto {
    nombre: string;
    comentario?: string;
    estado: boolean;
}

export interface ActualizarProveedorDto {
    id: number;
    nombre: string;
    comentario?: string;
    estado: boolean;
}