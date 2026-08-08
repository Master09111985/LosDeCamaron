export interface Inventario {
    id: number;
    cantidad: number;

    // Relacion con Almacen
    almacenId: number;
    almacenNombre: string;

    // Relacion con Producto
    productoId: number;
    productoNombre: string;

    // Relacion con Unidad de Medida
    unidadMedidaId: number;
    unidadMedidaNombre: string;
}

export interface CrearInventarioDto {
    cantidad: number;
    productoId: number;
    almacenId: number;
    unidadMedidaId: number;
}

export interface TrasladoInventarioDto {
    productoId: number;
    almacenOrigenId: number;
    almacenDestinoId: number;
    cantidad: number;
}