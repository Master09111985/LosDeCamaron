import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { PlatilloService } from '../../services/platillo.service';
import { ToastService } from '../../services/toast.service';
import { Platillo } from '../../interfaces/platillo.interface';
// NUEVO: Importamos el environment
import { environment } from '../../environments/environment'; 

@Component({
  selector: 'app-platillos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './platillos.html',
  styleUrl: './platillos.css',
})
export class Platillos implements OnInit {
  private platilloService = inject(PlatilloService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  // NUEVO: Extraemos la URL base ('https://localhost:9000') dinámicamente desde tu environment
  // new URL(environment.apiUrl).origin nos devuelve solo el protocolo, dominio y puerto
  backendUrl = new URL(environment.apiUrl).origin; 

  platillos = signal<Platillo[]>([]);
  loading = signal<boolean>(true);
  guardando = signal<boolean>(false);
  modalAbierto = signal<boolean>(false);
  platilloEditando = signal<Platillo | null>(null);

  // Variables para la imagen
  fotoSeleccionada: File | null = null;
  fotoPrevia = signal<string | null>(null); // Para mostrar la imagen antes de subirla

  // Buscador
  terminoBusqueda = signal<string>('');
  platillosFiltrados = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase();
    const lista = this.platillos();
    if (!termino) return lista;
    return lista.filter(p => 
      p.nombre.toLowerCase().includes(termino) || p.codigo.toLowerCase().includes(termino)
    );
  });

  platilloForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(150), Validators.minLength(3)]],
    descripcion: [''],
    precio: ['', [Validators.required, Validators.min(0.01)]],
    estado: [true]
  });

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.platilloService.getPlatillos().subscribe({
      next: (data) => {
        this.platillos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Error al cargar los platillos');
        this.loading.set(false);
      }
    });
  }

  actualizarBusqueda(event: Event) {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }

  abrirModal(platillo?: Platillo): void {
    this.fotoSeleccionada = null;
    
    if (platillo) {
      this.platilloEditando.set(platillo);
      this.platilloForm.patchValue({
        nombre: platillo.nombre,
        descripcion: platillo.descripcion,
        precio: platillo.precio,
        estado: platillo.estado
      });
      // Mostramos la foto actual que viene del backend sumando nuestra URL base
      this.fotoPrevia.set(this.backendUrl + platillo.fotoUrl);
    } else {
      this.platilloEditando.set(null);
      this.platilloForm.reset({ estado: true });
      this.fotoPrevia.set(null);
    }
    
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.platilloEditando.set(null);
    this.platilloForm.reset();
    this.fotoSeleccionada = null;
    this.fotoPrevia.set(null);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fotoSeleccionada = file;
      
      const reader = new FileReader();
      reader.onload = e => this.fotoPrevia.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  guardarPlatillo(): void {
    if (this.platilloForm.invalid) {
      this.platilloForm.markAllAsTouched();
      return;
    }

    const platilloEditando = this.platilloEditando();

    if (!platilloEditando && !this.fotoSeleccionada) {
      this.toastService.showError('Debes seleccionar una foto para el platillo nuevo');
      return;
    }

    this.guardando.set(true);
    const formValue = this.platilloForm.value;

    const formData = new FormData();
    formData.append('Nombre', formValue.nombre);
    formData.append('Descripcion', formValue.descripcion || '');
    formData.append('Precio', formValue.precio.toString());
    
    if (this.fotoSeleccionada) {
      formData.append('Foto', this.fotoSeleccionada);
    }

    if (platilloEditando) {
      formData.append('Id', platilloEditando.id.toString());
      formData.append('Estado', formValue.estado.toString()); 

      this.platilloService.actualizarPlatillo(platilloEditando.id, formData).subscribe({
        next: () => {
          this.toastService.showSuccess('Platillo actualizado correctamente');
          this.cerrarModal();
          this.cargarDatos();
          this.guardando.set(false);
        },
        error: (err) => this.manejarErrorGuardado(err)
      });
    } else {
      this.platilloService.crearPlatillo(formData).subscribe({
        next: () => {
          this.toastService.showSuccess('Platillo creado correctamente');
          this.cerrarModal();
          this.cargarDatos();
          this.guardando.set(false);
        },
        error: (err) => this.manejarErrorGuardado(err)
      });
    }
  }

  manejarErrorGuardado(err: any) {
    console.error(err);
    const msj = err.error && err.error[''] ? err.error[''][0] : 'Ocurrió un error al guardar';
    this.toastService.showError(typeof msj === 'string' ? msj : 'Error al guardar');
    this.guardando.set(false);
  }

  borrarPlatillo(platillo: Platillo): void {
    if (confirm(`¿Estás seguro de eliminar el platillo "${platillo.nombre}"?`)) {
      this.loading.set(true);
      this.platilloService.borrarPlatillo(platillo.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Platillo eliminado correctamente');
          this.cargarDatos();
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Error al eliminar el platillo');
          this.loading.set(false);
        }
      });
    }
  }
}