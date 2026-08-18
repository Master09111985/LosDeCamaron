import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../services/toast.service';
import { MetodoPagos } from '../../interfaces/metodo-pago.interface';
import { MetodoPagoService } from '../../services/metodo-pago.service';

@Component({
  selector: 'app-metodo-pago',
  imports: [
    MatIconModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './metodo-pago.html',
  styleUrl: './metodo-pago.css',
})

export class MetodoPago implements OnInit {
  
  private metodoPagoService = inject(MetodoPagoService);
  private toastService = inject(ToastService);

  private fb = inject(FormBuilder);

  metodosPago = signal<MetodoPagos[]>([]);
  cargando = signal<boolean>(false);
  guardando = signal<boolean>(false);
  modalAbierto = signal<boolean>(false);
  metodoPagoEditando = signal<MetodoPagos | null>(null);

  metodoPagoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    estado: [true]
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.metodoPagoService.getMetodoPagos().subscribe({
      next: (data) => {
        this.metodosPago.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Error al cargar los almacenes');
        this.cargando.set(false);
      }
    });
  }

  abrirModal(metodoPago?: MetodoPagos): void {
    if (metodoPago) {
      this.metodoPagoEditando.set(metodoPago);
      this.metodoPagoForm.patchValue({
        nombre: metodoPago.nombre,
        estado: metodoPago.estado
      });
    } else {
      this.metodoPagoEditando.set(null);
      this.metodoPagoForm.reset({ estado: true });
    }
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.metodoPagoEditando.set(null);
    this.metodoPagoForm.reset();
  }

  guardarMetodoPago(): void {
    if (this.metodoPagoForm.invalid) {
      this.metodoPagoForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const formValue = this.metodoPagoForm.value;
    const metodoPagoEditando = this.metodoPagoEditando();

    if (metodoPagoEditando) {
      this.metodoPagoService.actualizarMetodoPago(metodoPagoEditando.id, {
        id: metodoPagoEditando.id,
        nombre: formValue.nombre,
        estado: formValue.estado
      }).subscribe({
        next: () => {
          this.toastService.showSuccess('Metodo de Pago actualizado correctamente');
          this.cerrarModal();
          this.cargarDatos()
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err),
          this.toastService.showError('Error al actualizar el metodo De Pago');
          this.guardando.set(false);
        }
      });
    } else {
      this.metodoPagoService.crearMetodoPago({
        nombre: formValue.nombre,
        estado: formValue.estado
      }).subscribe({
        next: () => {
          this.toastService.showSuccess('Metodo de Pago creado correctamente');
          this.cerrarModal();
          this.cargarDatos();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Error al crear Metodo de Pago');
          this.guardando.set(false);
        }
      });
    }
  }

  borrarMetodoPago(metodoPago: MetodoPagos) {
    if (confirm(`Esta seguro de eliminar el metodo de pago "${metodoPago.nombre}"`))
      this.metodoPagoService.borrarMetodoPago(metodoPago.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Metodo de Pago eliminado correctamente');
          this.cargarDatos();
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Error al eliminar forma de Pago');
        }
    });
  }

}
