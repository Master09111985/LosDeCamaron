import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import JsBarcode from "jsbarcode";
import { EmpleadoService } from '../../services/empleado.service';
import { PuestoService } from '../../services/puesto.service';
import { ToastService } from '../../services/toast.service';
import { Empleado } from '../../interfaces/empleado.interface';
import { Puesto } from '../../interfaces/puesto.interface';

@Component({
  selector: 'app-empleados',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './empleados.html',
  styleUrl: './empleados.css',
})

export class Empleados implements OnInit {

  private empleadoService = inject(EmpleadoService);
  private puestoService = inject(PuestoService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  empleados = signal<Empleado[]>([]);
  puestosActivos = signal<Puesto[]>([]);

  loading = signal(true);
  guardando = signal(false);

  modalAbierto = signal(false);
  empleadoEditando = signal<Empleado | null>(null);
  empleadoParaImprimir = signal<Empleado | null>(null);
  archivoSeleccionado: File | null = null;

  empleadoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    direccion: ['', Validators.required],
    telefono: ['', Validators.required],
    edad: ['', Validators.required],
    salarioSemanal: ['', [Validators.required, Validators.min(0)]],
    fechaContrato: ['', Validators.required],
    puestoId: ['', Validators.required],
    estado: [true],
    foto: [null]
  });

  constructor() {
    effect(() => {
      const emp = this.empleadoParaImprimir();
      if (emp) {
        setTimeout(() => {
          try {
            // Render preview barcode
            JsBarcode('#badge-barcode', emp.codigo, {
              format: 'CODE128',
              lineColor: '#000',
              width: 1.5,
              height: 40,
              displayValue: true,
              fontSize: 12,
              margin: 0
            });
            // Render print barcode
            JsBarcode('#print-badge-barcode', emp.codigo, {
              format: 'CODE128',
              lineColor: '#000',
              width: 1.5,
              height: 40,
              displayValue: true,
              fontSize: 12,
              margin: 0
            });
          } catch (e) {
            console.error('Error rendering barcode', e);
          }
        }, 50); // slight delay to ensure DOM is ready
      }
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);

    // Cargar puestos activos para el select
    this.puestoService.getPuestosActivos().subscribe({
      next: (puestos) => {
        this.puestosActivos.set(puestos);
        this.cargarEmpleados();
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Error al cargar puestos');
        this.loading.set(false);
      }
    });
  }

  cargarEmpleados(): void {
    this.loading.set(true);

    this.empleadoService.getEmpleados().subscribe({
      next: (data) => {
        this.empleados.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Error al cargar los empleados');
        this.loading.set(false);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      this.empleadoForm.patchValue({ foto: file });
    }
  }

  abrirModal() {
    this.empleadoEditando.set(null);
    this.archivoSeleccionado = null;
    
    this.empleadoForm.reset({ 
      estado: true,
      puestoId: ''
    });
    
    // Validacion de foto obligatoria en creación
    this.empleadoForm.get('foto')?.setValidators([Validators.required]);
    this.empleadoForm.get('foto')?.updateValueAndValidity();

    this.modalAbierto.set(true);
  }

  editarEmpleado(empleado: Empleado): void {
    this.empleadoEditando.set(empleado);
    this.archivoSeleccionado = null;

    // Convertir fecha al formato YYYY-MM-DD para el input[type=date]
    let fechaContratoFormat = '';
    if (empleado.fechaContrato) {
      const date = new Date(empleado.fechaContrato);
      fechaContratoFormat = date.toISOString().split('T')[0];
    }

    // Validacion de foto NO obligatoria de edicion
    this.empleadoForm.get('foto')?.clearValidators();
    this.empleadoForm.get('foto')?.updateValueAndValidity();

    this.empleadoForm.patchValue({
      nombre: empleado.nombre,
      direccion: empleado.direccion,
      telefono: empleado.telefono,
      edad: empleado.edad,
      salarioSemanal: empleado.salarioSemanal,
      fechaContrato: fechaContratoFormat,
      puestoId: empleado.puestoId,
      estado: empleado.estado,
      foto: null
    });

    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.empleadoForm.reset();
    this.archivoSeleccionado = null;
  }

  guardar(): void {
    if (this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const formValue = this.empleadoForm.value;
    const empleadoActual = this.empleadoEditando();

    if (empleadoActual) {
      // Actualizar
      const dto: any = {
        id: empleadoActual.id,
        nombre: formValue.nombre,
        direccion: formValue.direccion,
        telefono: formValue.telefono,
        edad: formValue.edad,
        salarioSemanal: formValue.salarioSemanal,
        fechaContrato: formValue.fechaContrato,
        estado: formValue.estado,
        puestoId: formValue.puestoId
      };

      if (this.archivoSeleccionado) {
        dto.foto = this.archivoSeleccionado;
      }

      this.empleadoService.actualizarEmpleado(empleadoActual.id, dto).subscribe({
        next: () => {
          this.toastService.showSuccess('El registro se guardo satisfactoriamente');
          this.cargarEmpleados();
          this.cerrarModal();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Ocurrio un error al actualizar el empleado.');
          this.guardando.set(false);
        }
      });
    } else {
      // Crear
      if (!this.archivoSeleccionado) {
        this.toastService.showError('Debe ajuntar una foto');
        this.guardando.set(false);
        return;
      }

      const dto: any = {
        nombre: formValue.nombre,
        direccion: formValue.direccion,
        telefono: formValue.telefono,
        edad: formValue.edad,
        salarioSemanal: formValue.salarioSemanal,
        fechaContrato: formValue.fechaContrato,
        puestoId: formValue.puestoId,
        foto: this.archivoSeleccionado
      };

      this.empleadoService.crearEmpleado(dto).subscribe({
        next: () => {
          this.toastService.showSuccess('El registro se guardo satisfactoriamente');
          this.cargarEmpleados();
          this.cerrarModal();
          this.guardando.set(false);
        },
        error: (err) => {
          console.error(err);
          const errorMsg = err.error && err.error[''] ? err.error[''][0] : 'Ocurrio un error al crear el empleado';
          this.toastService.showError(errorMsg);
          this.guardando.set(false);
        }
      });
    }
  }

  borrarEmpleado(empleado: Empleado) {
    if (confirm(`Estas seguro de eliminar al empleado "${empleado.nombre}"?`)) {
      this.loading.set(true);
      this.empleadoService.borrarEmpleado(empleado.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Empleado eliminado correctamente');
          this.cargarEmpleados();
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Ocurrio un error al eliminar el empleado');
          this.loading.set(false);
        }
      });
    }
  }

  imprimirGafete(empleado: Empleado) {
    this.empleadoParaImprimir.set(empleado);
  }

  cerrarModalImpresion() {
    this.empleadoParaImprimir.set(null);
  }

  ejecutarImpresion() {
    window.print();
  }

  obtenerRutaImagen(rutaRelativa?: string): string {
    if (!rutaRelativa) return '';
    return `https://camaronserver:9000${rutaRelativa}`; 
  }
}