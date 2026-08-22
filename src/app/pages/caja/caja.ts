import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

import { ComandaService } from '../../services/comanda.service';
import { MetodoPagoService } from '../../services/metodo-pago.service';
import { ToastService } from '../../services/toast.service';

import { ComandaDto } from '../../interfaces/comanda.interface';
import { MetodoPago } from '../metodo-pago/metodo-pago';
import { MetodoPagos } from '../../interfaces/metodo-pago.interface';


@Component({
  selector: 'app-caja',
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './caja.html',
  styleUrl: './caja.css',
})

export class Caja implements OnInit{

  private comandaService = inject(ComandaService);
  private metodoPagoService = inject(MetodoPagoService);
  private toastService = inject(ToastService);

  comandasPorCobrar = signal<ComandaDto[]>([]);
  metodosPago = signal<MetodoPagos[]>([]);
  cargando = signal<boolean>(false);
  procesando = signal<boolean>(false);

  comandaSeleccionada = signal<ComandaDto | null>(null);
  metodoPagoSeleccionado = signal<number | null>(null);
  efectivoRecibido = signal<number | null>(null);

  // Calcula el cambio dinamicamente
  cambio = computed(() => {
    const total = this.comandaSeleccionada()?.total || 0;
    const recibido = this.efectivoRecibido() || 0;
    return recibido > total ? recibido - total : 0;
  });

  esEfectivo = computed(() => {
    const metodo = this.metodosPago().find(m => m.id === this.metodoPagoSeleccionado());
    return metodo?.nombre.toLowerCase().includes('efectivo');
  });

  ngOnInit(): void {
    this.cargarComandas();
    this.cargarMetodosPago();
  }

  cargarComandas(): void {
    this.cargando.set(true);
    this.comandaService.getComandas().subscribe({
      next: (comandas) => {
        this.comandasPorCobrar.set(comandas.filter(c => c.estado === 'Entregado'));
        this.cargando.set(false);
      }
    })
  }

  cargarMetodosPago(): void {
    this.metodoPagoService.getMetodosPagoActivos().subscribe(data => this.metodosPago.set(data));
  }

  seleccionarComanda(comanda: ComandaDto): void {
    this.comandaSeleccionada.set(comanda);
    this.metodoPagoSeleccionado.set(null);
    this.efectivoRecibido.set(null);
  }

  procesarPago(): void {
    const id = this.comandaSeleccionada()?.id;
    const metodoId = this.metodoPagoSeleccionado();

    if (!id || !metodoId) return;

    this.procesando.set(true);
    
  }

}