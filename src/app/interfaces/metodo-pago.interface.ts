export interface MetodoPagos {
    id: number;
    nombre: string;
    estado: boolean;
}

export interface CrearMetodoPagoDto {
    nombre: string;
    estado: boolean;
}

export interface ActualizarMetodoPagoDto {
    id: number;
    nombre: string;
    estado: boolean;
}