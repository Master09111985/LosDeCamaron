import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { PuestoService } from '../../services/puesto.service';
import { ToastService } from '../../services/toast.service';
import { Puesto } from '../../interfaces/puesto.interface';

@Component({
  selector: 'app-puestos',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './puestos.html',
  styleUrl: './puestos.css',
})

export class Puestos {
  private puestoService = inject(PuestoService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  puestos = signal<Puesto[]>([]);
  loading = signal<boolean>(true);
  guardando = signal<boolean>(false);
  
  modalAbierto = signal<boolean>(false);
  puestoEditando = signal<Puesto | null>(null);

  puestoForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    estado: [true, Validators.required]
  });

  ngOnInit() {
    this.cargarPuestos();
  }

  cargarPuestos() {
    this.loading.set(true);
    this.puestoService.getPuestos().subscribe({
      next: (data) => {
        this.puestos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Error al cargar los puestos');
        this.loading.set(false);
      }
    });
  }

  abrirModal() {
    this.puestoEditando.set(null);
    this.puestoForm.reset({ estado: true });
    this.modalAbierto.set(true);
  }

  editarPuesto(puesto: Puesto) {
    this.puestoEditando.set(puesto);
    this.puestoForm.patchValue({
      nombre: puesto.nombre,
      estado: puesto.estado
    });
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.puestoForm.reset();
  }

  guardar() {
    if (this.puestoForm.invalid) return;

    this.guardando.set(true);
    const formValue = this.puestoForm.value;
    const puestoActual = this.puestoEditando();

    if (puestoActual) {
      // Actualizar
      const dto: Puesto = {
        id: puestoActual.id,
        nombre: formValue.nombre,
        estado: formValue.estado
      };

      this.puestoService.actualizarPuesto(puestoActual.id, dto).subscribe({
        next: () => {
          this.toastService.showSuccess('El registro se guardo satisfactoriamente');
          this.cargarPuestos();
          this.cerrarModal();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Ocurrió un error al actualizar el puesto');
          this.guardando.set(false);
        }
      });
    } else {
      // Crear
      this.puestoService.crearPuesto(formValue).subscribe({
        next: () => {
          this.toastService.showSuccess('El registro se guardo satisfactoriamente');
          this.cargarPuestos();
          this.cerrarModal();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          const errorMsg = err.error && err.error[''] ? err.error[''][0] : 'Ocurrió un error al crear el puesto';
          this.toastService.showError(errorMsg);
          this.guardando.set(false);
        }
      });
    }
  }

  borrarPuesto(puesto: Puesto) {
    if (confirm(`¿Estás seguro de eliminar el puesto "${puesto.nombre}"?`)) {
      this.loading.set(true);
      this.puestoService.borrarPuesto(puesto.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Puesto eliminado correctamente');
          this.cargarPuestos();
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Ocurrió un error al eliminar el puesto');
          this.loading.set(false);
        }
      });
    }
  }
}