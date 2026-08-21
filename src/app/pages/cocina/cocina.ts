import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { ComandaService } from '../../services/comanda.service';
import { ToastService } from '../../services/toast.service';
import { ComandaDto } from '../../interfaces/comanda.interface';

@Component({
  selector: 'app-cocina',
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
  //Para mostrar spinner en el boton de el ticket
  procesandoId = signal<number | null>(null);

  private intervalId: any;

  ngOnInit(): void {
    this.cargarComandasActivas(true);

    // Auto-recarga silenciosa cada 10 segundos para ver nuevos pedidos
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
        // El estatus 1 se definio como "Cocinando"
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

    //El estatus 2 significa "Entregado / Listo para llevar a mesa"
    this.comandaService.cambiarEstatus(comanda.id, 2).subscribe({
      next: () => {
        this.toastService.showSuccess(`¡Orden #${comanda.id} terminada!`);
        // Actualizamos la lista inmediatamente sacando la comanda terminada
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

}