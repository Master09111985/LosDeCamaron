export interface Plataforma {
    id: number;
    nombre: string;
    estado: boolean;
}

export interface CrearPlataformaDto {
    nombre: string;
    estado: boolean;
}

export interface ActualizarPlataformaDto {
    id: number;
    nombre: string;
    estado: boolean;
}