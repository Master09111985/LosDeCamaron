import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../services/toast.service';
import { Plataforma as Plataformas } from '../../interfaces/plataforma.interface';
import { PlataformaService } from '../../services/plataforma.service';

@Component({
  selector: 'app-plataforma',
  imports: [
    MatIconModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './plataforma.html',
  styleUrl: './plataforma.css',
})

export class Plataforma implements OnInit{

  private plataformaService = inject(PlataformaService);
  private toastService = inject(ToastService);

  private fb = inject(FormBuilder);

  plataformas = signal<Plataformas[]>([]);
  cargando = signal<boolean>(false);
  guardando = signal<boolean>(false);
  modalAbierto = signal<boolean>(false);
  plataformaEditando = signal<Plataformas | null>(null);

  plataformaForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    estado: [true]
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.plataformaService.getPlataformas().subscribe({
      next: (data) => {
        this.plataformas.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.toastService.showError('Error al cargar las plataformas');
        this.cargando.set(false);
      }
    });
  }

  abrirModal(plataforma?: Plataformas): void {
    if (plataforma) {
      this.plataformaEditando.set(plataforma);
      this.plataformaForm.patchValue({
        nombre: plataforma.nombre,
        estado: plataforma.estado
      });
    } else {
      this.plataformaEditando.set(null);
      this.plataformaForm.reset({ estado: true });
    }
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.plataformaEditando.set(null);
    this.plataformaForm.reset();
  }

  guardarPlataforma(): void {
    if (this.plataformaForm.invalid) {
      this.plataformaForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const formValue = this.plataformaForm.value;
    const plataformaEditando = this.plataformaEditando();

    if (plataformaEditando) {
      this.plataformaService.actualizarPlataforma(plataformaEditando.id, {
        id: plataformaEditando.id,
        nombre: formValue.nombre,
        estado: formValue.estado
      }).subscribe({
        next: () => {
          this.toastService.showSuccess('Plataforma actualizada correctamente.');
          this.cerrarModal();
          this.cargarDatos();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Error al actualizar plataforma.');
          this.guardando.set(false);
        }
      });
    } else {
      this.plataformaService.crearPlataforma({
        nombre: formValue.nombre,
        estado: formValue.estado
      }).subscribe({
        next: () => {
          this.toastService.showSuccess('Plataforma creada correctamente');
          this.cerrarModal();
          this.cargarDatos();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Error al crear la plataforma');
          this.guardando.set(false);
        }
      });
    }
  }

  borrarPlataforma(plataforma: Plataformas) {
    if (confirm(`Esta seguro de eliminar la plataforma "${plataforma.nombre}"?`)) {
      this.plataformaService.borrarPlataforma(plataforma.id).subscribe({
        next: () => {
          this.toastService.showSuccess(`Plataforma eliminada correctamente`);
          this.cargarDatos();
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Error al eliminar plataforma');
        }
      });
    }
  }


}