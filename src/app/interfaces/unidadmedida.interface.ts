export interface UnidadMedida {
    id: number,
    nombre: string,
    estado: boolean
}

export interface CrearUnidadMedidaDto {
    nombre: string,
    estado: boolean
}