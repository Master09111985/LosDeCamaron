import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../services/toast.service';
import { Almacen } from '../../interfaces/almacen.interface';
import { AlmacenService } from '../../services/almacen.service';

@Component({
  selector: 'app-almacenes',
  imports: [
    MatIconModule,
    CommonModule,
    ReactiveFormsModule
],
  templateUrl: './almacenes.html',
  styleUrl: './almacenes.css',
})

export class Almacenes implements OnInit {
  
  private almacenService = inject(AlmacenService);
  private toastService = inject(ToastService);

  private fb = inject(FormBuilder);

  almacenes = signal<Almacen[]>([]);
  cargando = signal<boolean>(false);
  guardando = signal<boolean>(false);
  modalAbierto = signal<boolean>(false);
  almacenEditando = signal<Almacen | null>(null);
  
  almacenForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: [''],
    estado: [true]
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.almacenService.getAlmacenes().subscribe({
      next: (data) => {
        this.almacenes.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.toastService.showError('Error al cargar los almacenes');
        this.cargando.set(false);
      }
    });
  }

  abrirModal(almacen?: Almacen): void {
    if (almacen) {
      this.almacenEditando.set(almacen);
      this.almacenForm.patchValue({
        nombre: almacen.nombre,
        descripcion: almacen.descripcion,
        estado: almacen.estado
      });
    } else {
      this.almacenEditando.set(null);
      this.almacenForm.reset({ estado: true });
    }
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.almacenEditando.set(null);
    this.almacenForm.reset();
  }

  guardarAlmacen(): void {
    if (this.almacenForm.invalid) {
      this.almacenForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const formValue = this.almacenForm.value;
    const almacenEditando = this.almacenEditando();

    if (almacenEditando) {
      this.almacenService.actualizarAlmacen(almacenEditando.id, {
        id: almacenEditando.id,
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        estado: formValue.estado
      }).subscribe({
        next: () => {
          this.toastService.showSuccess('Almacén actualizado correctamente');
          this.cerrarModal();
          this.cargarDatos();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Error al actualizar almacén');
          this.guardando.set(false);
        }
      });
    } else {
      this.almacenService.crearAlmacen({
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        estado: formValue.estado
      }).subscribe({
        next: () => {
          this.toastService.showSuccess('Almacén creado correctamente');
          this.cerrarModal();
          this.cargarDatos();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Error al crear almacén');
          this.guardando.set(false);
        }
      });
    }
  }

  borrarAlmacen(almacen: Almacen) {
    if (confirm(`¿Está seguro de eliminar el almacén "${almacen.nombre}"?`)) {
      this.almacenService.borrarAlmacen(almacen.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Almacén eliminado correctamente');
          this.cargarDatos();
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Error al eliminar almacén');
        }
      });
    }
  }

}