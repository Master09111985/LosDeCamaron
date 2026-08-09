import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { InventarioService } from '../../services/inventario.service';
import { AlmacenService } from '../../services/almacen.service';
import { ProductoService } from '../../services/producto.service';
import { ToastService } from '../../services/toast.service';
import { BajaService } from '../../services/baja.service';
import { MotivoBajaService } from '../../services/motivo-baja.service';

import { Inventario, CrearInventarioDto, TrasladoInventarioDto } from '../../interfaces/inventario.interface';
import { Almacen } from '../../interfaces/almacen.interface';
import { Producto } from '../../interfaces/producto.interface';
import { MotivoBaja } from '../../interfaces/motivo-baja.interface';
import { CrearBajaDto } from '../../interfaces/baja.interface';


@Component({
  selector: 'app-inventario',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css',
})

export class Inventarios implements OnInit {

  private inventarioService = inject(InventarioService);
  private almacenService = inject(AlmacenService);
  private productoService = inject(ProductoService);
  private bajaService = inject(BajaService);
  private motivoService = inject(MotivoBajaService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  inventarios = signal<Inventario[]>([]);
  almacenes = signal<Almacen[]>([]);
  productos = signal<Producto[]>([]);
  motivosBaja = signal<MotivoBaja[]>([]);

  loading = signal<boolean>(true);
  guardando = signal<boolean>(false);
  modalAbierto = signal<boolean>(false);
  modalTrasladoAbierto = signal<boolean>(false);
  modalBajaAbierto = signal<boolean>(false);
  inventarioEditando = signal<Inventario | null>(null);
  inventarioATrasladar = signal<Inventario | null>(null);
  terminoBusqueda = signal<string>('');

  inventariosFiltrados = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase();
    const lista = this.inventarios();

    // Si el buscador esta vacio, regresamos toda la lista
    if (!termino) return lista;

    // Si hay texto, filtramos buscando coincidencias en el nombre del producto
    return lista.filter(inv =>
      inv.productoNombre.toLowerCase().includes(termino)
    );
  });

  actualizarBusqueda(event: Event) {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }

  //-----------------------------------//
  //      Seccion de Formularios       //
  //-----------------------------------//      

  inventarioForm: FormGroup = this.fb.group({
    almacenId: ['', Validators.required],
    productoId: ['', Validators.required],
    cantidad: ['', [Validators.required, Validators.min(0.01)]]
  });

  trasladoForm: FormGroup = this.fb.group({
    almacenDestinoId: ['', Validators.required],
    cantidad: ['', [Validators.required, Validators.min(0.01)]]
  });

  bajaForm: FormGroup = this.fb.group({
    almacenId: ['', Validators.required],
    productoId: ['', Validators.required],
    motivoBajaId: ['', Validators.required],
    cantidad: ['', [Validators.required, Validators.min(0.01)]],
    comentarios: ['', Validators.maxLength(200)]
  });

  //---------------------------------//
  //    Seccion de carga Inicial     //
  //---------------------------------//

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);

    // Cargamos los catalogos para los Selects
    this.almacenService.getAlmacenesActivos().subscribe(res => this.almacenes.set(res));
    this.productoService.getProductosActivos().subscribe(res => this.productos.set(res));
    this.motivoService.getMotivosActivos().subscribe(res => this.motivosBaja.set(res));

    // Cargamos la tabla principal
    this.cargarInventario();
  }

  cargarInventario(): void {
    this.inventarioService.getInventarios().subscribe({
      next: (data) => {
        this.inventarios.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Error al cargar el inventario');
        this.loading.set(false);
      }
    });
  }

  //------------------------------------//
  //   Seccion de apertura de modales   //
  //------------------------------------//

  abrirModal(): void {
    this.inventarioEditando.set(null);
    this.inventarioForm.reset();
    
    // Habilitar selects por si fueron deshabilitados en la edición
    this.inventarioForm.get('almacenId')?.enable();
    this.inventarioForm.get('productoId')?.enable();
    
    this.modalAbierto.set(true);
  }

  abrirModalTraslado(inventario: Inventario): void {
    this.inventarioATrasladar.set(inventario);
    // Reseteamos el formulario y ponemos el maximo permitido
    this.trasladoForm.reset();
    this.trasladoForm.get('cantidad')?.setValidators([
      Validators.required,
      Validators.min(0.01),
      Validators.max(inventario.cantidad) // No puede trasladar mas de lo que tiene
    ]);
    this.trasladoForm.get('cantidad')?.updateValueAndValidity();

    this.modalTrasladoAbierto.set(true);
  }

  abrirModalBaja(): void {
    this.bajaForm.reset();
    this.modalBajaAbierto.set(true);
  }

  //-------------------------------//
  //   Seccion de cerrar Modales   //
  //-------------------------------//

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.inventarioForm.reset();
  }

  cerrarModalTraslado(): void {
    this.modalTrasladoAbierto.set(false);
    this.inventarioATrasladar.set(null);
    this.trasladoForm.reset();
  }

  cerrarModalBaja(): void {
    this.modalBajaAbierto.set(false);
    this.bajaForm.reset();
  }

  //----------------------//
  //   Seccion del CRUD   //
  //----------------------//

  editarInventario(inventario: Inventario): void {
    this.inventarioEditando.set(inventario);
    this.inventarioForm.patchValue({
      almacenId: inventario.almacenId,
      productoId: inventario.productoId,
      cantidad: inventario.cantidad
    });

    // Deshabilitar cambios de producto/almacen en edicion para evitar inconsistencias
    this.inventarioForm.get('almacenId')?.disable();
    this.inventarioForm.get('productoId')?.disable();

    this.modalAbierto.set(true);
  }

  
  guardar(): void {
    if (this.inventarioForm.invalid) return;

    this.guardando.set(true);
    
    const formValue = this.inventarioForm.getRawValue();
    const inventarioActual = this.inventarioEditando();

    // Extraemos la unidad de medida del producto seleccionado
    const productoSeleccionado = this.productos().find(p => p.id === Number(formValue.productoId));
    const unidadMedidaId = productoSeleccionado ? productoSeleccionado.unidadId : 0;

    if (inventarioActual) {
      // Actualizar (Solo actualizamos la cantidad y conservamos las relaciones)
      const dto: Inventario = {
        ...inventarioActual, // Mantenemos nombres y datos extra para cumplir la interface
        cantidad: Number(formValue.cantidad),
        almacenId: Number(formValue.almacenId),
        productoId: Number(formValue.productoId),
        unidadMedidaId: unidadMedidaId
      };

      this.inventarioService.actualizarInventario(inventarioActual.id, dto).subscribe({
        next: () => {
          this.toastService.showSuccess('Existencias actualizadas satisfactoriamente');
          this.cargarInventario();
          this.cerrarModal();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Ocurrió un error al actualizar el inventario');
          this.guardando.set(false);
        }
      });
    } else {
      // Crear / Sumar al inventario existente
      const dto: CrearInventarioDto = {
        cantidad: Number(formValue.cantidad),
        almacenId: Number(formValue.almacenId),
        productoId: Number(formValue.productoId),
        unidadMedidaId: unidadMedidaId
      };

      this.inventarioService.guardarInventario(dto).subscribe({
        next: () => {
          this.toastService.showSuccess('El registro se guardó satisfactoriamente');
          this.cargarInventario();
          this.cerrarModal();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          // Manejo del error que devuelve el backend cuando no coincide la unidad de medida
          const errorMsg = err.error && err.error[''] ? err.error[''][0] : 'Ocurrió un error al registrar el inventario';
          this.toastService.showError(errorMsg);
          this.guardando.set(false);
        }
      })
    }
  }

  ejecutarTraslado(): void {
    if (this.trasladoForm.invalid) return;

    const invOrigen = this.inventarioATrasladar();
    if (!invOrigen) return;

    const formValue = this.trasladoForm.value;

    // Validacion extra: no trasladar al mismo almacen.
    if (Number(formValue.almacenDestinoId) === invOrigen.almacenId) {
      this.toastService.showError('El almacen destino debe ser diferente al origen');
      return;
    }

    this.guardando.set(true);

    const dto: TrasladoInventarioDto = {
      productoId: invOrigen.productoId,
      almacenOrigenId: invOrigen.almacenId,
      almacenDestinoId: Number(formValue.almacenDestinoId),
      cantidad: Number(formValue.cantidad)
    };

    this.inventarioService.trasladarInventario(dto).subscribe({
      next: () => {
        this.toastService.showSuccess('Traslado completado con exito');
        this.cargarInventario();
        this.cerrarModalTraslado();
        this.guardando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError(err.error?.message || 'Error al realizar el traslado');
        this.guardando.set(false);
      }
    });
  }
  
  ejecutarBaja(): void {
    if (this.bajaForm.invalid) {
      this.bajaForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const formValue = this.bajaForm.value;

    const dto: CrearBajaDto = {
      almacenId: Number(formValue.almacenId),
      productoId: Number(formValue.productoId),
      motivoBajaId: Number(formValue.motivoBajaId),
      cantidad: Number(formValue.cantidad),
      comentarios: formValue.comentarios
    };

    this.bajaService.crearBaja(dto).subscribe({
      next: () => {
        this.toastService.showSuccess('Baja de inventario registrada con éxito');
        this.cargarInventario(); // Recargar tabla para ver el descuento
        this.cerrarModalBaja();
        this.guardando.set(false);
      },
      error: (err) => {
        console.error(err);
        // Mostrar el error exacto del backend (ej. "No hay suficientes existencias")
        const errorMsg = err.error && err.error[''] ? err.error[''][0] : (err.error || 'Ocurrió un error al registrar la baja');
        this.toastService.showError(typeof errorMsg === 'string' ? errorMsg : 'Error al procesar la baja');
        this.guardando.set(false);
      }
    });
  }

  borrarInventario(inventario: Inventario): void {
    if (confirm(`¿Estás seguro de eliminar el registro de ${inventario.productoNombre} en ${inventario.almacenNombre}?`)) {
      this.loading.set(true);
      this.inventarioService.eliminarInventario(inventario.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Registro eliminado correctamente');
          this.cargarInventario();
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Ocurrió un error al eliminar el registro');
          this.loading.set(false);
        }
      });
    }
  }
}