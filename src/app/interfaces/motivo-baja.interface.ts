export interface MotivoBaja {
    id: number;
    nombre: string;
    descripcion?: string;
    estado: boolean;
}

export interface CrearMotivoBajaDto {
    nombre: string;
    descripcion?: string;
    estado: boolean;
}