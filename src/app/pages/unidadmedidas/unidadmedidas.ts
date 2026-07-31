import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../services/toast.service';
import { UnidadMedida } from '../../interfaces/unidadmedida.interface';
import { UnidadMedidaService } from '../../services/unidadmedida.service';

@Component({
  selector: 'app-unidadmedidas',
  imports: [
    MatIconModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './unidadmedidas.html',
  styleUrl: './unidadmedidas.css',
})

export class Unidadmedidas implements OnInit{

  private unidadService = inject(UnidadMedidaService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  unidades = signal<UnidadMedida[]>([]);
  loading = signal<boolean>(false);
  guardando = signal<boolean>(false);

  modalAbierto = signal<boolean>(false);
  unidadEditando = signal<UnidadMedida | null>(null);

  unidadForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    estado: [true, Validators.required]
  })


  ngOnInit(): void {
    this.cargarUnidades();
  }

  cargarUnidades(): void {
    this.loading.set(true);
    this.unidadService.getUnidadMedidas().subscribe({
      next: (data) => {
        this.unidades.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Error al cargar las unidades.');
        this.loading.set(false);
      }
    });
  }

  abrirModal(unidad?: UnidadMedida): void {
    this.unidadEditando.set(null);
    this.unidadForm.reset({ estado: true });
    this.modalAbierto.set(true);
  }

  editarUnidad(unidad: UnidadMedida) {
    this.unidadEditando.set(unidad);
    this.unidadForm.patchValue({
      nombre: unidad.nombre,
      estado: unidad.estado
    });
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.unidadForm.reset();
  }

  guardar(): void {
    this.guardando.set(true);
    const formValue = this.unidadForm.value;
    const unidadActual = this.unidadEditando();

    if (unidadActual) {
      // Actualizar
      const dto: UnidadMedida = {
        id: unidadActual.id,
        nombre: formValue.nombre,
        estado: formValue.estado
      };

      this.unidadService.actualizarUnidad(unidadActual.id, dto).subscribe({
        next: () => {
          this.toastService.showSuccess('El registro se guardo satisfactoriamente');
          this.cargarUnidades();
          this.cerrarModal();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Ocurrio un error al actualizar la unidad');
        }
      });
    } else {
      // Crear
      this.unidadService.crearUnidad(formValue).subscribe({
        next: () => {
          this.toastService.showSuccess('El registro se guardo satisfactoriamente.');
          this.cargarUnidades();
          this.cerrarModal();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          const errorMsg = err.error && err.error[''] ? err.error[''][0] : 'Ocurrio un error al crear la unidad';
          this.toastService.showError(errorMsg);
          this.guardando.set(false);
        }
      });
    }
  }

  borrarUnidad(unidad: UnidadMedida): void {
    if (confirm(`Esta seguro de eliminar la unidad "${unidad.nombre}"`)) {
      this.unidadService.borrarUnidad(unidad.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Unidad eliminada correctamente.');
          this.cargarUnidades();
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Error al eliminar unidad');
          this.loading.set(false);
        }
      })
    }
  }
}