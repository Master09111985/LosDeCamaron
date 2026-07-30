import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ClienteService } from '../../services/cliente.service';
import { ToastService } from '../../services/toast.service';
import { Cliente } from '../../interfaces/cliente.interface';

@Component({
  selector: 'app-clientes',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})

export class Clientes {
  private clienteService = inject(ClienteService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  clientes = signal<Cliente[]>([]);
  loading = signal<boolean>(true);
  guardando = signal<boolean>(false);

  modalAbierto = signal<boolean>(false);
  clienteEditando = signal<Cliente | null>(null);

  clienteForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    telefono: ['', Validators.required],
    direccion: ['', Validators.required],
    referencias: ['']
  });

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.loading.set(true);
    this.clienteService.getClientes().subscribe({
      next: (data) => {
        this.clientes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Error al cargar los clientes');
        this.loading.set(false);
      }
    });
  }

  abrirModal(): void {
    this.clienteEditando.set(null);
    this.clienteForm.reset({ estado: true });
    this.modalAbierto.set(true);
  }

  editarCliente(cliente: Cliente): void {
    this.clienteEditando.set(cliente);
    this.clienteForm.patchValue({
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      referencias: cliente.referencias
    });
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.clienteForm.reset();
  }

  guardar(): void {
    if (this.clienteForm.invalid) return;

    this.guardando.set(true);
    const formValue = this.clienteForm.value;
    const clienteActual = this.clienteEditando();

    if (clienteActual) {
      // Actualizar
      const dto: Cliente = {
        id: clienteActual.id,
        nombre: clienteActual.nombre,
        telefono: clienteActual.telefono,
        direccion: clienteActual.direccion,
        referencias: clienteActual.referencias
      };

      this.clienteService.actualizarCliente(clienteActual.id, dto).subscribe({
        next: () => {
          this.toastService.showSuccess('El registro se guardo satisfactoriamente');
          this.cargarClientes();
          this.cerrarModal();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Ocurrio un error al actualizar el cliente');
          this.guardando.set(false);
        }
      });
    } else {
      // Crear
      this.clienteService.crearCliente(formValue).subscribe({
        next: () => {
          this.toastService.showSuccess('El registro se guardo satisfactoriamente');
          this.cargarClientes();
          this.cerrarModal();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          const errorMsg = err.error && err.error[''] ? err.error[''][0] : 'Ocurrio un error al crear el cliente.';
          this.toastService.showError(errorMsg);
          this.guardando.set(false);
        }
      });
    }
  }

  borrarCliente(cliente: Cliente) {
    if (confirm(`Estas seguro de eliminar el cliente "${cliente.nombre}"?`)) {
      this.loading.set(true);
      this.clienteService.borrarCliente(cliente.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Cliente eliminado correctamente');
          this.cargarClientes();
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Ocurrio un error al eliminar el cliente');
          this.loading.set(false);
        }
      });
    }
  }
}