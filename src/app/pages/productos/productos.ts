import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ToastService } from '../../services/toast.service';
import { ProductoService } from '../../services/producto.service';
import { UnidadMedidaService } from '../../services/unidadmedida.service';

import { Producto } from '../../interfaces/producto.interface';
import { UnidadMedida } from '../../interfaces/unidadmedida.interface';

@Component({
  selector: 'app-productos',
  imports: [
    MatIconModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})

export class Productos implements OnInit {

  private productoService = inject(ProductoService);
  private unidadMedidaService = inject(UnidadMedidaService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  productos = signal<Producto[]>([]);
  unidades = signal<UnidadMedida[]>([]);

  terminoBusqueda = signal<string>('');

  productosFiltrados = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase();
    const lista = this.productos();

    if (!termino) return lista;

    return lista.filter(p => 
      p.nombre.toLowerCase().includes(termino)
    );
  });

  actualizarBusqueda(event: Event) {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }

  cargando = signal<boolean>(false);
  guardando = signal<boolean>(false);
  modalAbierto = signal<boolean>(false);
  productoEditando = signal<Producto | null>(null);

  productoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', Validators.maxLength(200)],
    unidadId: ['', [Validators.required]],
    estado: [true]
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);

    // Cargamos las unidades de medida para el modal
    this.unidadMedidaService.getUnidadesActivas().subscribe({
      next: (data) => this.unidades.set(data),
      error: (err) => console.error('Error al cargar unidades', err)
    });

    // Cargamos los productos para la tabla
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Error al caragar productos');
        this.cargando.set(false);
      }
    });
  }

  abrirModal(producto?: Producto): void {
    if (producto) {
      this.productoEditando.set(producto);
      this.productoForm.patchValue({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        unidadId: producto.unidadId,
        estado: producto.estado
      });
    } else {
      this.productoEditando.set(null);
      this.productoForm.reset({ estado: true });
    }
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.productoEditando.set(null);
    this.productoForm.reset();
  }

  guardarProducto(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const formValue = this.productoForm.value;
    const productoEditando = this.productoEditando();

    if (productoEditando) {
      const dtoActualizar: Producto = {
        ...productoEditando,
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        unidadId: Number(formValue.unidadId),
        estado: formValue.estado
      };

      this.productoService.actualizarProducto(productoEditando.id, dtoActualizar).subscribe({
        next: () => {
          this.toastService.showSuccess('Producto actualizado correctamente');
          this.cerrarModal();
          this.cargarDatos();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Error al actualizar producto');
          this.guardando.set(false);
        }
      })
    } else {
      // Crear
      this.productoService.crearProducto({
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        unidadId: Number(formValue.unidadId)
      }).subscribe ({
        next: () => {
          this.toastService.showSuccess('Producto creado correctamente');
          this.cerrarModal();
          this.cargarDatos();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Error al crear producto');
          this.guardando.set(false);
        }
      });
    }
  }

  borrarProducto(producto: Producto): void {
    if (confirm(`Estas seguro de eliminar el producto "${producto.nombre}"?`)) {
      this.cargando.set(true);
      this.productoService.borrarProducto(producto.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Producto eliminado correctamente');
          this.cargarDatos();
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Ocurrio un error al eliminar el producto');
          this.cargando.set(false);
        }
      });
    }
  }
}