import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { InventarioService } from '../../services/inventario.service';
import { AlmacenService } from '../../services/almacen.service';
import { ProductoService } from '../../services/producto.service';
import { ToastService } from '../../services/toast.service';

import { Inventario, CrearInventarioDto } from '../../interfaces/inventario.interface';
import { Almacen } from '../../interfaces/almacen.interface';
import { Producto } from '../../interfaces/producto.interface';


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
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  inventarios = signal<Inventario[]>([]);
  almacenes = signal<Almacen[]>([]);
  productos = signal<Producto[]>([]);

  loading = signal<boolean>(true);
  guardando = signal<boolean>(false);
  modalAbierto = signal<boolean>(false);
  inventarioEditando = signal<Inventario | null>(null);

  inventarioForm: FormGroup = this.fb.group({
    almacenId: ['', Validators.required],
    productoId: ['', Validators.required],
    cantidad: ['', [Validators.required, Validators.min(0.01)]]
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);

    // Cargamos los catalogos para los Selects
    this.almacenService.getAlmacenesActivos().subscribe(res => this.almacenes.set(res));
    this.productoService.getProductosActivos().subscribe(res => this.productos.set(res));

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

  abrirModal(): void {
    this.inventarioEditando.set(null);
    this.inventarioForm.reset();
    
    // Habilitar selects por si fueron deshabilitados en la edición
    this.inventarioForm.get('almacenId')?.enable();
    this.inventarioForm.get('productoId')?.enable();
    
    this.modalAbierto.set(true);
  }

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

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.inventarioForm.reset();
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