import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms'; // Necesario para el ngModel del input de efectivo

import { ComandaService } from '../../services/comanda.service';
import { MetodoPagoService } from '../../services/metodo-pago.service';
import { ToastService } from '../../services/toast.service';

import { ComandaDto } from '../../interfaces/comanda.interface';
import { MetodoPagos } from '../../interfaces/metodo-pago.interface';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './caja.html',
  styleUrl: './caja.css',
})

export class Caja implements OnInit {
  private comandaService = inject(ComandaService);
  private metodoPagoService = inject(MetodoPagoService);
  private toastService = inject(ToastService);

  // Estados Globales
  comandasPorCobrar = signal<ComandaDto[]>([]);
  metodosPagoDb = signal<MetodoPagos[]>([]);
  cargando = signal<boolean>(false);
  procesando = signal<boolean>(false);

  // Estados de Selección
  comandaSeleccionada = signal<ComandaDto | null>(null);
  metodoPagoSeleccionado = signal<number | null>(null);
  efectivoRecibido = signal<number | null>(null);

  ngOnInit(): void {
    this.cargarComandas();
    this.cargarMetodosPago();
  }

  cargarComandas(): void {
    this.cargando.set(true);
    this.comandaService.getComandas().subscribe({
      next: (comandas) => {
        // Filtramos solo las que ya se entregaron (estatus 'Entregado' o similar)
        this.comandasPorCobrar.set(comandas.filter(c => c.estado === 'Entregado'));
        this.cargando.set(false);
      },
      error: () => {
        this.toastService.showError('Error al cargar las comandas');
        this.cargando.set(false);
      }
    });
  }

  cargarMetodosPago(): void {
    // Asumiendo que tu servicio devuelve la lista de métodos de pago
    this.metodoPagoService.getMetodosPagoActivos().subscribe(data => this.metodosPagoDb.set(data));
  }

  seleccionarComanda(comanda: ComandaDto): void {
    this.comandaSeleccionada.set(comanda);
    this.metodoPagoSeleccionado.set(null); // Reseteamos valores al cambiar de comanda
    this.efectivoRecibido.set(null);
  }

  // --- LÓGICA REACTIVA ---

  // 1. Filtrar métodos de pago según el tipo de pedido
  metodosPagoPermitidos = computed(() => {
    const comanda = this.comandaSeleccionada();
    const metodos = this.metodosPagoDb();
    if (!comanda) return [];

    const tipo = comanda.tipoPedido; // 'Local', 'Llevar', 'Domicilio', 'Plataforma', 'Agendado'
    
    return metodos.filter(m => {
      const nombre = m.nombre.toLowerCase();
      // Regla: Plataforma -> Efectivo o Tarjeta
      if (tipo === 'Plataforma') return nombre.includes('efectivo') || nombre.includes('tarjeta');
      // Regla: Domicilio -> Efectivo o Transferencia
      if (tipo === 'Domicilio') return nombre.includes('efectivo') || nombre.includes('transferencia');
      // Regla: Local/Llevar/Agendado -> Efectivo, Tarjeta, Transferencia (Todos)
      return true; 
    });
  });

  // 2. Verificar si el método seleccionado es Efectivo para mostrar el input
  esEfectivo = computed(() => {
    const metodoId = this.metodoPagoSeleccionado();
    const metodo = this.metodosPagoDb().find(m => m.id === metodoId);
    return metodo ? metodo.nombre.toLowerCase().includes('efectivo') : false;
  });

  // 3. Calcular el cambio automáticamente
  cambio = computed(() => {
    const total = this.comandaSeleccionada()?.total || 0;
    const recibido = this.efectivoRecibido() || 0;
    return recibido > total ? recibido - total : 0;
  });

  // --- ACCIÓN ---
  procesarCobro(): void {
    const comanda = this.comandaSeleccionada();
    const metodoId = this.metodoPagoSeleccionado();

    if (!comanda || !metodoId) {
      this.toastService.showError('Seleccione un método de pago');
      return;
    }

    if (this.esEfectivo() && (this.efectivoRecibido() || 0) < comanda.total) {
      this.toastService.showError('El monto recibido es menor al total de la cuenta');
      return;
    }

    this.procesando.set(true);
    
    this.comandaService.pagarComanda(comanda.id, metodoId).subscribe({
      next: () => {
        this.toastService.showSuccess(`¡Orden #${comanda.id} cobrada exitosamente!`);
        // Sacamos la comanda de la lista visual
        this.comandasPorCobrar.update(lista => lista.filter(c => c.id !== comanda.id));
        this.comandaSeleccionada.set(null);
        this.procesando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Error al procesar el cobro');
        this.procesando.set(false);
      }
    });
  }
}