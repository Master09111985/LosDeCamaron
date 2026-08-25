import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ToastService } from '../../services/toast.service';
import { ProveedorService } from '../../services/proveedor.service';

import { Proveedor } from '../../interfaces/proveedor.interface';

@Component({
  selector: 'app-proveedores',
  imports: [
    MatIconModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.css',
})

export class Proveedores implements OnInit{

  private proveedorService = inject(ProveedorService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  proveedores = signal<Proveedor[]>([]);
  caragando = signal<boolean>(false);
  guardando = signal<boolean>(false);
  modalAbierto = signal<boolean>(false);
  proveedorEditando = signal<Proveedor | null>(null);

  proveedorForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    comentario: [''],
    estado: [true]
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.caragando.set(true);
    this.proveedorService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores.set(data);
        this.caragando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Error al cargar los proveedores');
        this.caragando.set(false);
      }
    });
  }

  abrirModal(proveedor?: Proveedor): void {
    if (proveedor) {
      this.proveedorEditando.set(proveedor);
      this.proveedorForm.patchValue({
        nombre: proveedor.nombre,
        comentario: proveedor.comentario,
        estado: proveedor.estado
      });
    } else {
      this.proveedorEditando.set(null);
      this.proveedorForm.reset({ estado: true });
    }
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.proveedorEditando.set(null);
    this.proveedorForm.reset();
  }

  guardarProveedor(): void {
    if (this.proveedorForm.invalid) {
      this.proveedorForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const formValue = this.proveedorForm.value;
    const proveedorEditando = this.proveedorEditando();

    if (proveedorEditando) {
      this.proveedorService.actualizarProveedor(proveedorEditando.id, {
        id: proveedorEditando.id,
        nombre: formValue.nombre,
        comentario: formValue.comentario,
        estado: formValue.estado
      }).subscribe({
        next: () => {
          this.toastService.showSuccess('Proveedor actualizado correctamente');
          this.cerrarModal();
          this.cargarDatos();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Error al actualizar proveedor');
        }
      });
    } else {
      this.proveedorService.crearProveedor({
        nombre: formValue.nombre,
        comentario: formValue.comentario,
        estado: formValue.estado
      }).subscribe({
        next: () => {
          this.toastService.showSuccess('Proveedor creado correctamente');
          this.cerrarModal();
          this.cargarDatos();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Error al crear proveedor');
          this.guardando.set(false);
        }
      });
    }
  }

  borrarProveedor(proveedor: Proveedor) {
    if (confirm(`¿Está seguro de eliminar el proveedor "${proveedor.nombre}?"`)) {
      this.proveedorService.borrarProveedor(proveedor.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Proveedor eliminado correctamente');
          this.cargarDatos();
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Error al eliminar proveedor');
        }
      });
    }
  }

}