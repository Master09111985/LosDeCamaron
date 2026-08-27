import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { AsistenciaService } from '../../services/asistencia.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  providers: [DatePipe],
  templateUrl: './asistencia.html',
  styleUrl: './asistencia.css',
})
export class Asistencia implements OnInit, OnDestroy {
  private asistenciaService = inject(AsistenciaService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private datePipe = inject(DatePipe);

  // Variables para el reloj digital
  horaActual = signal<string>('');
  fechaActual = signal<string>('');
  private relojInterval: any;

  // Variables de estado
  procesando = signal<boolean>(false);

  // Formulario con un solo campo que espera el código del escáner
  checadorForm: FormGroup = this.fb.group({
    codigo: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.iniciarReloj();
  }

  ngOnDestroy(): void {
    if (this.relojInterval) {
      clearInterval(this.relojInterval);
    }
  }

  // --- LÓGICA DEL RELOJ DIGITAL ---
  iniciarReloj(): void {
    this.actualizarReloj(); // Llamada inicial
    this.relojInterval = setInterval(() => {
      this.actualizarReloj();
    }, 1000); // Se actualiza cada segundo
  }

  actualizarReloj(): void {
    const ahora = new Date();
    // NOTA: Ajusta el formato según tus preferencias. 
    // hh:mm:ss a = 12 horas con AM/PM (Ej. 02:30:15 PM)
    this.horaActual.set(this.datePipe.transform(ahora, 'hh:mm:ss a') || '');
    // EEEE, dd MMMM yyyy = Día, fecha y año (Ej. Jueves, 27 Agosto 2026)
    this.fechaActual.set(this.datePipe.transform(ahora, 'EEEE, dd MMMM yyyy') || '');
  }

  // --- LÓGICA DEL ESCÁNER ---
  registrarChecada(): void {
    if (this.checadorForm.invalid) return;

    this.procesando.set(true);
    const codigoEscaneado = this.checadorForm.get('codigo')?.value;

    this.asistenciaService.registrarChecada({ codigo: codigoEscaneado }).subscribe({
      next: (respuesta) => {
        // Mostramos el Toast Verde de Éxito
        this.toastService.showSuccess(`¡Hola ${respuesta.nombreEmpleado}! ${respuesta.mensaje}`);
        
        // Limpiamos el input y le devolvemos el foco para el siguiente empleado
        this.resetearInput();
        this.procesando.set(false);
      },
      error: (err) => {
        // Mostramos el Toast Rojo de Error o Advertencia (Ej. "Ya checaste tus 4 turnos")
        this.toastService.showError(err.message);
        
        // Limpiamos igual para el siguiente intento
        this.resetearInput();
        this.procesando.set(false);
      }
    });
  }

  // Método auxiliar para limpiar y reenfocar el input del escáner
  private resetearInput(): void {
    this.checadorForm.reset();
    setTimeout(() => {
      const inputElement = document.getElementById('codigoInput');
      if (inputElement) {
        inputElement.focus();
      }
    }, 100);
  }
}