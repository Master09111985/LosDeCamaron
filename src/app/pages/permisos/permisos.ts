import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ToastService } from '../../services/toast.service';
import { PermisoService } from '../../services/permiso.service';

import { Permiso } from '../../interfaces/permiso.interface';

@Component({
  selector: 'app-permisos',
  imports: [
    MatIconModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './permisos.html',
  styleUrl: './permisos.css',
})

export class Permisos implements OnInit {

  private permisoService = inject(PermisoService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  permisos = signal<Permiso[]>([]);
  cargando = signal<boolean>(false);
  guardando = signal<boolean>(false);
  modalAbierto = signal<boolean>(false);
  permisoEditando = signal<Permiso | null>(null);

  permisoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', Validators.maxLength(250)]
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.permisoService.getPermisos().subscribe({
      next: (data) => {
        this.permisos.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Error al cargar los permisos');
        this.cargando.set(false);
      }
    });
  }

  abrirModal(permiso?: Permiso): void {
    if(permiso) {
      this.permisoEditando.set(permiso);
      this.permisoForm.patchValue({
        nombre: permiso.nombre,
        descripcion: permiso.descripcion
      });
    } else {
      this.permisoEditando.set(null);
      this.permisoForm.reset();
    }
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.permisoEditando.set(null);
    this.permisoForm.reset();
  }

  guardarPermiso(): void {
    if (this.permisoForm.invalid) {
      this.permisoForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const formValue = this.permisoForm.value;
    const editando = this.permisoEditando();

    if (editando) {
      this.permisoService.actualizarPermiso(editando.id, {
        id: editando.id,
        nombre: formValue.nombre,
        descripcion: formValue.descripcion
      }).subscribe({
        next: () => {
          this.toastService.showSuccess('Permiso actualizado correctamente');
          this.cerrarModal();
          this.cargarDatos();
          this.guardando.set(false);
        },
        error: (err) => {
          this.toastService.showError(err.error?.mensaje || 'Error al actualizar el permiso');
          this.guardando.set(false);
        }
      });
    } else {
      this.permisoService.crearPermiso(formValue).subscribe({
        next: () => {
          this.toastService.showSuccess('Permiso creado correctamente');
          this.cerrarModal();
          this.cargarDatos();
          this.guardando.set(false);
        },
        error: (err) => {
          this.toastService.showError(err.error?.mensaje || 'Error al crear el permiso');
          this.guardando.set(false);
        }
      });
    }
  }

  borrarPermiso(permiso: Permiso) {
    if (confirm(`¿Está seguro de eliminar el permiso "${permiso.nombre}"?`)) {
      this.permisoService.borrarPermiso(permiso.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Permiso eliminado correctamente');
          this.cargarDatos();
        },
        error: (err) => {
          this.toastService.showError('Error al eliminar el permiso');
        }
      });
    }
  }

}