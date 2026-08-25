import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';

import { ToastService } from '../../services/toast.service';
import { RolService } from '../../services/rol.service';
import { RolPermisoService } from '../../services/rol-permiso.service';
import { PermisoService } from '../../services/permiso.service';

import { Rol } from '../../interfaces/rol.interface';
import { RolPermisoDto } from '../../interfaces/rol-permiso.interface';

@Component({
  selector: 'app-roles',
  imports: [
    MatIconModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './roles.html',
  styleUrls: ['./roles.css'],
})

export class Roles implements OnInit {
  
  private rolService = inject(RolService);
  private permisoService = inject(PermisoService);
  private rolPermisoService = inject(RolPermisoService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  roles = signal<Rol[]>([]);
  cargando = signal<boolean>(false);
  guardando = signal<boolean>(false);
  modalAbierto = signal<boolean>(false);
  rolEditando = signal<Rol | null>(null);

  // Signals para el modal de permisos
  modalPermisosAbierto = signal<boolean>(false);
  cargandoPermisos = signal<boolean>(false);
  guardandoPermisos = signal<boolean>(false);
  permisosDelRol = signal<RolPermisoDto[]>([]);
  rolSeleccionadoParaPermisos = signal<Rol | null>(null);
  
  rolForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    categoria: ['', Validators.maxLength(50)],
    funcion: ['', Validators.maxLength(100)]
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.rolService.getRoles().subscribe({
      next: (data) => {
        this.roles.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.toastService.showError('Error al cargar los roles');
        this.cargando.set(false);
      }
    });
  }

  abrirModal(rol?: Rol): void {
    if (rol) {
      this.rolEditando.set(rol);
      this.rolForm.patchValue({
        nombre: rol.nombre,
        categoria: rol.categoria,
        funcion: rol.funcion
      });
    } else {
      this.rolEditando.set(null);
      this.rolForm.reset();
    }
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.rolEditando.set(null);
    this.rolForm.reset();
  }

  guardarRol(): void {
    if (this.rolForm.invalid) {
      this.rolForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const formValue = this.rolForm.value;
    const editando = this.rolEditando();

    if (editando) {
      this.rolService.actualizarRol(editando.id, {
        id: editando.id,
        nombre: formValue.nombre,
        categoria: formValue.categoria,
        funcion: formValue.funcion
      }).subscribe({
        next: () => {
          this.toastService.showSuccess('Rol actualizado correctamente');
          this.cerrarModal();
          this.cargarDatos();
          this.guardando.set(false);
        },
        error: (err) => {
          this.toastService.showError(err.error?.mensaje || 'Error al actualizar el rol');
          this.guardando.set(false);
        }
      });
    } else {
      this.rolService.crearRol(formValue).subscribe({
        next: () => {
          this.toastService.showSuccess('Rol creado correctamente');
          this.cerrarModal();
          this.cargarDatos();
          this.guardando.set(false);
        },
        error: (err) => {
          this.toastService.showError(err.error?.mensaje || 'Error al crear el rol');
          this.guardando.set(false);
        }
      });
    }
  }

  borrarRol(rol: Rol) {
    if (confirm(`¿Está seguro de eliminar el rol "${rol.nombre}"?`)) {
      this.rolService.borrarRol(rol.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Rol eliminado correctamente');
          this.cargarDatos();
        },
        error: () => {
          this.toastService.showError('Error al eliminar el rol');
        }
      });
    }
  }

  //======================================================
  // Estos Metodos son exclusivos del modal para permisos
  //======================================================

  abrirModalPermisos(rol: Rol): void {
    this.rolSeleccionadoParaPermisos.set(rol);
    this.modalPermisosAbierto.set(true);
    this.cargandoPermisos.set(true);

    // Usamos forkJoin para pedir TODOS los permisos base y los que tiene el Rol actual al mismo tiempo
    forkJoin({
      todosLosPermisos: this.permisoService.getPermisos(),
      permisosDelRol: this.rolPermisoService.getPermisosDeUnRol(rol.id)
    }).subscribe({
      next: ({ todosLosPermisos, permisosDelRol }) => {
        
        // Mapeamos para que siempre aparezcan todos los permisos en la lista
        const permisosCompletos = todosLosPermisos.map(permisoBase => {
          // Buscamos si el rol ya tiene un registro de este permiso
          const permisoAsignado = permisosDelRol.find(p => p.permisoId === permisoBase.id);
          
          return {
            id: permisoAsignado ? permisoAsignado.id : 0,
            rolId: rol.id,
            permisoId: permisoBase.id,
            permisoNombre: permisoBase.nombre,
            permisoDescripcion: permisoBase.descripcion,
            // Si lo tiene, respetamos su estado. Si es un permiso nuevo, aparece apagado por defecto.
            habilitado: permisoAsignado ? permisoAsignado.habilitado : false 
          };
        });

        // Guardamos la lista completa en la signal para mostrarla en el modal
        this.permisosDelRol.set(permisosCompletos);
        this.cargandoPermisos.set(false);
      },
      error: () => {
        this.toastService.showError('Error al cargar la lista de permisos');
        this.cargandoPermisos.set(false);
      }
    });
  }

  cerrarModalPermisos(): void {
    this.modalPermisosAbierto.set(false);
    this.rolSeleccionadoParaPermisos.set(null);
    this.permisosDelRol.set([]);
  }

  togglePermiso(index: number): void {
    // Inmutabilidad con Signals: Clonamos, modificamos y seteamos
    const permisosAct = [...this.permisosDelRol()];
    permisosAct[index].habilitado = !permisosAct[index].habilitado;
    this.permisosDelRol.set(permisosAct);
  }

  guardarPermisosDelRol(): void {
    const rol = this.rolSeleccionadoParaPermisos();
    if (!rol) return;

    this.guardandoPermisos.set(true);

    // Mapeamos al DTO exacto que espera tu API
    const payload = {
      rolId: rol.id,
      permisos: this.permisosDelRol().map(p => ({
        permisoId: p.permisoId,
        habilitado: p.habilitado
      }))
    };

    this.rolPermisoService.actualizarPermisos(payload).subscribe({
      next: () => {
        this.toastService.showSuccess(`Permisos de ${rol.nombre} actualizados`);
        this.cerrarModalPermisos();
        this.guardandoPermisos.set(false);
      },
      error: () => {
        this.toastService.showError('Error al guardar los permisos');
        this.guardandoPermisos.set(false);
      }
    });
  }
}