import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ToastService } from '../../services/toast.service';
import { UsuarioService } from '../../services/usuario.service';
import { RolService } from '../../services/rol.service';
import { EmpleadoService } from '../../services/empleado.service';

import { UsuarioDto } from '../../interfaces/auth.interface';
import { Empleado } from '../../interfaces/empleado.interface';
import { Rol } from '../../interfaces/rol.interface';

@Component({
  selector: 'app-usuarios',
  imports: [
    MatIconModule, 
    CommonModule, 
    ReactiveFormsModule
  ],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css'],
})

export class Usuarios implements OnInit {
  
  private usuarioService = inject(UsuarioService);
  private rolService = inject(RolService);
  private empleadoService = inject(EmpleadoService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  usuarios = signal<UsuarioDto[]>([]);
  roles = signal<Rol[]>([]);
  empleados = signal<Empleado[]>([]);
  
  cargando = signal<boolean>(false);
  guardando = signal<boolean>(false);
  modalAbierto = signal<boolean>(false);
  usuarioEditando = signal<UsuarioDto | null>(null);
  
  usuarioForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    password: [''], // Se hace requerido dinámicamente si es nuevo
    rolId: ['', Validators.required],
    empleadoId: [''],
    estado: [true]
  });

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarCatalogos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.toastService.showError('Error al cargar los usuarios');
        this.cargando.set(false);
      }
    });
  }

  cargarCatalogos(): void {
    // Aqui se cargan los roles y empleados para los <select> del formulario
    this.rolService.getRoles().subscribe(res => this.roles.set(res));
    this.empleadoService.getEmpleados().subscribe(res => this.empleados.set(res));
  }

  abrirModal(usuario?: any): void {
    if (usuario) {
      this.usuarioEditando.set(usuario);
      // Al editar, el password no se muestra ni es requerido
      this.usuarioForm.get('password')?.clearValidators();
      this.usuarioForm.patchValue({
        nombre: usuario.nombre,
        password: '', 
        rolId: usuario.rolId,
        empleadoId: usuario.empleadoId,
        estado: usuario.estado
      });
    } else {
      this.usuarioEditando.set(null);
      this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.usuarioForm.reset({ estado: true });
    }
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.usuarioEditando.set(null);
    this.usuarioForm.reset();
  }

  guardarUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const formValue = this.usuarioForm.value;
    const editando = this.usuarioEditando();

    if (editando) {
      const payload = {
        id: editando.id,
        nombre: formValue.nombre,
        estado: formValue.estado,
        rolId: formValue.rolId,
        empleadoId: formValue.empleadoId
      };

      this.usuarioService.actualizarUsuario(editando.id, payload).subscribe({
        next: () => {
          this.toastService.showSuccess('Usuario actualizado correctamente');
          this.cerrarModal();
          this.cargarDatos();
          this.guardando.set(false);
        },
        error: (err) => {
          this.toastService.showError(err.error?.mensaje || 'Error al actualizar');
          this.guardando.set(false);
        }
      });
    } else {
      this.usuarioService.crearUsuario(formValue).subscribe({
        next: () => {
          this.toastService.showSuccess('Usuario creado correctamente');
          this.cerrarModal();
          this.cargarDatos();
          this.guardando.set(false);
        },
        error: (err) => {
          this.toastService.showError(err.error?.mensaje || 'Error al crear usuario');
          this.guardando.set(false);
        }
      });
    }
  }

  borrarUsuario(usuario: any) {
    if (confirm(`¿Está seguro de eliminar al usuario "${usuario.nombre}"?`)) {
      this.usuarioService.borrarUsuario(usuario.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Usuario eliminado');
          this.cargarDatos();
        },
        error: () => this.toastService.showError('Error al eliminar usuario')
      });
    }
  }
}