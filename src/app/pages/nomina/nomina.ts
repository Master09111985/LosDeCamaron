import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { NominaService } from '../../services/nomina.service';
import { ToastService } from '../../services/toast.service';
import { ReporteNominaDto } from '../../interfaces/nomina.interface';

@Component({
  selector: 'app-nomina',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './nomina.html',
  styleUrl: './nomina.css',
})
export class Nomina {
  private nominaService = inject(NominaService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  reportes = signal<ReporteNominaDto[]>([]);
  cargando = signal<boolean>(false);
  reporteGenerado = signal<boolean>(false);

  filtroForm: FormGroup = this.fb.group({
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required]
  });

  generarNomina(): void {
    if (this.filtroForm.invalid) {
      this.filtroForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    const fechas = this.filtroForm.value;

    this.nominaService.generarReporte(fechas).subscribe({
      next: (data) => {
        this.reportes.set(data);
        this.reporteGenerado.set(true);
        this.cargando.set(false);

        if (data.length === 0) {
          this.toastService.showError('No se encontraron asistencias en este periodo');
        } else {
          this.toastService.showSuccess('Reporte de nómina generado exitosamente');
        }
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Error al calcular la nómina');
        this.cargando.set(false);
      }
    });
  }

  imprimirReporte(): void {
    window.print();
  }
}