import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { MotivoBajaService } from '../../services/motivo-baja.service';
import { ToastService } from '../../services/toast.service';
import { MotivoBaja } from '../../interfaces/motivo-baja.interface';

@Component({
  selector: 'app-motivos-baja',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './motivos-baja.html',
  styleUrl: './motivos-baja.css',
})

export class MotivosBaja implements OnInit{

  private motivoService = inject(MotivoBajaService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  motivos = signal<MotivoBaja[]>([]);

  // Buscador en tiempo real
  terminoBusqueda = signal<string>('');
  motivosFiltrados = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase();
    const lista = this.motivos();
    if (!termino) return lista;
    return lista.filter(m => m.nombre.toLowerCase().includes(termino));
  });

  loading = signal<boolean>(true);
  guardando = signal<boolean>(false);
  modalAbierto = signal<boolean>(false);
  motivoEditando = signal<MotivoBaja | null>(null);

  motivoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', [Validators.maxLength(200)]],
    estado: [true, Validators.required]
  });

  ngOnInit(): void {
    this.cargarMotivos();
  }

  cargarMotivos(): void {
    this.loading.set(true);
    this.motivoService.getMotivos().subscribe({
      next: (data) => {
        this.motivos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Error al cargar los motivos de baja');
        this.loading.set(false);
      }
    });
  }

  actualizarBusqueda(event: Event) {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }

  abrirModal(): void {
    this.motivoEditando.set(null);
    this.motivoForm.reset({ estado: true });
    this.modalAbierto.set(true);
  }

  editarMotivo(motivo: MotivoBaja): void {
    this.motivoEditando.set(motivo);
    this.motivoForm.patchValue({
      nombre: motivo.nombre,
      descripcion: motivo.descripcion,
      estado: motivo.estado
    });
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.motivoForm.reset();
  }

  guardar(): void {
    if (this.motivoForm.invalid){
      this.motivoForm.markAllAsTouched();
      return;
    }
    
    this.guardando.set(true);
    const formValue = this.motivoForm.value;
    const motivoActual = this.motivoEditando();

    if (motivoActual) {
      // Actualizar
      const dto: MotivoBaja = {
        ...motivoActual,
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        estado: formValue.estado
      };

      this.motivoService.actualizarMotivo(motivoActual.id, dto).subscribe({
        next: () => {
          this.toastService.showSuccess('Motivo actualizado satisfactoriamente');
          this.cargarMotivos();
          this.cerrarModal();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Ocurrio un error al actualizar el motivo');
          this.guardando.set(false);
        }
      });
    } else {
      // Crear
      this.motivoService.crearMotivo(formValue).subscribe({
        next: () => {
          this.toastService.showSuccess('Motivo guardado satisfactroriamente');
          this.cargarMotivos();
          this.cerrarModal();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Ocurrio un error al crear el motivo');
          this.guardando.set(false);
        }
      });
    }
  }

  borrarMotivo(motivo: MotivoBaja): void{
    if (confirm(`Estas seguro de eliminar el motivo "${motivo.nombre}"?`)) {
      this.loading.set(true);
      this.motivoService.borrarMotivo(motivo.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Motivo eliminado correctamente');
          this.cargarMotivos();
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Ocurrio un error al eliminar el motivo');
          this.loading.set(false);
        }
      });
    }
  }

}