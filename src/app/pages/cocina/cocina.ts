import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { ComandaService } from '../../services/comanda.service';
import { ToastService } from '../../services/toast.service';
import { ComandaDto } from '../../interfaces/comanda.interface';

@Component({
  selector: 'app-cocina',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './cocina.html',
  styleUrl: './cocina.css',
})
export class Cocina implements OnInit, OnDestroy {
  
  private comandaService = inject(ComandaService);
  private toastService = inject(ToastService);

  comandasCocina = signal<ComandaDto[]>([]);
  cargando = signal<boolean>(false);
  procesandoId = signal<number | null>(null);

  private intervalId: any;

  ngOnInit(): void {
    this.cargarComandasActivas(true);

    this.intervalId = setInterval(() => {
      this.cargarComandasActivas(false);
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    } 
  }

  cargarComandasActivas(mostrarLoader: boolean): void {
    if (mostrarLoader) this.cargando.set(true);

    this.comandaService.getComandas().subscribe({
      next: (comandas) => {
        const enCocina = comandas.filter(c => c.estado === 'Cocinando');
        const ordenadas = enCocina.sort((a, b) =>
          new Date(a.fechaRegistro).getTime() - new Date(b.fechaRegistro).getTime()
        );

        this.comandasCocina.set(ordenadas);
        if (mostrarLoader) this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar el KDS', err);
        if (mostrarLoader) this.cargando.set(false);
      }
    });
  }

  marcarComoLista(comanda: ComandaDto): void {
    this.procesandoId.set(comanda.id);

    this.comandaService.cambiarEstatus(comanda.id, 2).subscribe({
      next: () => {
        this.toastService.showSuccess(`¡Orden #${comanda.id} terminada!`);
        this.comandasCocina.update(lista => lista.filter(c => c.id !== comanda.id));
        this.procesandoId.set(null);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Error al actualizar el estatus');
        this.procesandoId.set(null);
      }
    });
  }

  // ==========================================
  // NUEVAS FUNCIONES PARA AGRUPAR POR PLATOS
  // ==========================================
  
  // Obtiene una lista de los platos que existen en esta orden (ej. [1, 2])
  getPlatosUnicos(comanda: ComandaDto): number[] {
    if (!comanda.detalles) return [];
    const platos = comanda.detalles.map(d => d.numeroPlato || 1);
    return [...new Set(platos)].sort((a, b) => a - b);
  }

  // Filtra los detalles para mostrar solo los que pertenecen a un plato específico
  getDetallesPorPlato(comanda: ComandaDto, numeroPlato: number): any[] {
    if (!comanda.detalles) return [];
    return comanda.detalles.filter(d => (d.numeroPlato || 1) === numeroPlato);
  }
}