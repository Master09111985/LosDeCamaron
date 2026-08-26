import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ComandaService } from '../../services/comanda.service';
import { MetodoPagoService } from '../../services/metodo-pago.service';
import { ToastService } from '../../services/toast.service';
import { CajaService } from '../../services/caja.service';
import { ProveedorService } from '../../services/proveedor.service';

import { ComandaDto } from '../../interfaces/comanda.interface';
import { MetodoPagos } from '../../interfaces/metodo-pago.interface';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, ReactiveFormsModule],
  templateUrl: './caja.html',
  styleUrl: './caja.css',
})
export class Caja implements OnInit {
  
  // Inyecciones
  private comandaService = inject(ComandaService);
  private metodoPagoService = inject(MetodoPagoService);
  private cajaService = inject(CajaService);
  private proveedorService = inject(ProveedorService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  // Estados Base
  comandaParaImprimir = signal<ComandaDto | null>(null); 
  comandasPorCobrar = signal<ComandaDto[]>([]);
  metodosPagoDb = signal<MetodoPagos[]>([]);
  proveedoresDb = signal<any[]>([]); 
  cargando = signal<boolean>(false);
  procesando = signal<boolean>(false);

  // Estados de Caja (Turnos)
  usuarioIdActual = 1; // TODO: Cambiar por el ID real que saques de tu LocalStorage/AuthService
  turnoActual = signal<any | null>(null);
  ticketGenerado = signal<any | null>(null);
  
  // Modales
  modalApertura = signal<boolean>(false);
  modalProveedor = signal<boolean>(false);
  modalCorte = signal<boolean>(false);

  // Estados de Selección (Cobro)
  comandaSeleccionada = signal<ComandaDto | null>(null);
  metodoPagoSeleccionado = signal<number | null>(null);
  efectivoRecibido = signal<number | null>(null);

  // ==========================================
  // FORMULARIOS REACTIVOS
  // ==========================================
  fondoForm: FormGroup = this.fb.group({
    fondoInicial: ['', [Validators.required, Validators.min(0)]]
  });

  proveedorForm: FormGroup = this.fb.group({
    proveedorId: ['', Validators.required],
    monto: ['', [Validators.required, Validators.min(1)]],
    supervisorUsuario: ['', Validators.required],
    supervisorPassword: ['', Validators.required]
  });

  corteForm: FormGroup = this.fb.group({
    efectivoReportado: ['', [Validators.required, Validators.min(0)]],
    supervisorUsuario: ['', Validators.required],
    supervisorPassword: ['', Validators.required]
  });

  // ==========================================
  // INICIALIZACIÓN Y CARGA DE DATOS
  // ==========================================
  ngOnInit(): void {
    this.verificarTurno();
    this.cargarMetodosPago();
    this.cargarProveedores();
  }

  verificarTurno(): void {
    this.cargando.set(true);
    this.cajaService.getTurnoAbierto(this.usuarioIdActual).subscribe({
      next: (turno) => {
        this.turnoActual.set(turno);
        this.cargarComandas();
        this.modalApertura.set(false);
      },
      error: (err) => {
        if (err.status === 404 || err.status === 400) {
          // No hay turno abierto para este usuario, mostramos modal obligatorio
          this.modalApertura.set(true);
          this.cargando.set(false);
        }
      }
    });
  }

  cargarComandas(): void {
    this.cargando.set(true);
    this.comandaService.getComandas().subscribe({
      next: (comandas) => {
        // Filtramos solo las que ya se entregaron (estatus 'Entregado')
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
    this.metodoPagoService.getMetodosPagoActivos().subscribe(data => this.metodosPagoDb.set(data));
  }

  cargarProveedores(): void {
    this.proveedorService.getProveedores().subscribe(data => this.proveedoresDb.set(data));
  }

  // ==========================================
  // LÓGICA REACTIVA (COMPUTEDS)
  // ==========================================
  metodosPagoPermitidos = computed(() => {
    const comanda = this.comandaSeleccionada();
    const metodos = this.metodosPagoDb();
    if (!comanda) return [];

    const tipo = comanda.tipoPedido; 
    
    return metodos.filter(m => {
      const nombre = m.nombre.toLowerCase();
      if (tipo === 'Plataforma') return nombre.includes('efectivo') || nombre.includes('tarjeta');
      if (tipo === 'Domicilio') return nombre.includes('efectivo') || nombre.includes('transferencia');
      return true; 
    });
  });

  esEfectivo = computed(() => {
    const metodoId = this.metodoPagoSeleccionado();
    const metodo = this.metodosPagoDb().find(m => m.id === metodoId);
    return metodo ? metodo.nombre.toLowerCase().includes('efectivo') : false;
  });

  cambio = computed(() => {
    const total = this.comandaSeleccionada()?.total || 0;
    const recibido = this.efectivoRecibido() || 0;
    return recibido > total ? recibido - total : 0;
  });

  // ==========================================
  // ACCIONES DE COBRO
  // ==========================================
  seleccionarComanda(comanda: ComandaDto): void {
    this.comandaSeleccionada.set(comanda);
    this.metodoPagoSeleccionado.set(null); 
    this.efectivoRecibido.set(null);
  }

  imprimirTicketComanda(comanda: ComandaDto, event: Event): void {
    // Evitamos que al dar clic en la impresora, también se seleccione la comanda para cobrar
    event.stopPropagation();
    
    // Limpiamos el ticket de corte por si había uno, y preparamos el de la comanda
    this.ticketGenerado.set(null); 
    this.comandaParaImprimir.set(comanda);
    
    // Damos medio segundo a Angular para dibujar el ticket oculto y abrimos la ventana de impresión
    setTimeout(() => {
      window.print();
    }, 500);
  }

  procesarCobro(): void {
    const comanda = this.comandaSeleccionada();
    const metodoId = this.metodoPagoSeleccionado();

    if (!comanda || !metodoId || !this.turnoActual()) {
      this.toastService.showError('Seleccione un método de pago y asegúrese de tener turno abierto');
      return;
    }

    if (this.esEfectivo() && (this.efectivoRecibido() || 0) < comanda.total) {
      this.toastService.showError('El monto recibido es menor al total de la cuenta');
      return;
    }

    this.procesando.set(true);
    
    const payload = { 
      comandaId: comanda.id, 
      metodoPagoId: metodoId, 
      usuarioCajeroId: this.usuarioIdActual 
    };

    this.cajaService.cobrarComanda(payload).subscribe({
      next: () => {
        this.toastService.showSuccess(`¡Orden #${comanda.id} cobrada exitosamente!`);
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

  // ==========================================
  // ACCIONES DE TURNOS Y AUDITORÍA
  // ==========================================
  abrirTurno(): void {
    if (this.fondoForm.invalid) {
      this.fondoForm.markAllAsTouched();
      return;
    }
    
    this.procesando.set(true);
    const payload = {
      usuarioCajeroId: this.usuarioIdActual,
      fondoInicial: this.fondoForm.value.fondoInicial
    };

    this.cajaService.abrirTurno(payload).subscribe({
      next: (turno) => {
        this.turnoActual.set(turno);
        this.modalApertura.set(false);
        this.cargarComandas();
        this.toastService.showSuccess('Caja abierta exitosamente');
        this.procesando.set(false);
      },
      error: () => {
        this.toastService.showError('Error al abrir la caja');
        this.procesando.set(false);
      }
    });
  }

  abrirModalProveedor() { 
    this.proveedorForm.reset(); 
    this.modalProveedor.set(true); 
  }
  
  pagarProveedor(): void {
    if (this.proveedorForm.invalid) {
      this.proveedorForm.markAllAsTouched();
      return;
    }

    this.procesando.set(true);
    const payload = { 
      turnoId: this.turnoActual().id, 
      ...this.proveedorForm.value 
    };

    this.cajaService.pagarProveedor(payload).subscribe({
      next: () => {
        this.toastService.showSuccess('Pago a proveedor registrado y autorizado');
        this.modalProveedor.set(false);
        this.procesando.set(false);
      },
      error: (err) => {
        this.toastService.showError(err.error || 'Credenciales inválidas o error de servidor');
        this.procesando.set(false);
      }
    });
  }

  abrirModalCorte() { 
    this.corteForm.reset(); 
    this.modalCorte.set(true); 
  }

  cerrarCaja(): void {
    if (this.corteForm.invalid) {
      this.corteForm.markAllAsTouched();
      return;
    }

    this.procesando.set(true);
    const payload = { 
      turnoId: this.turnoActual().id, 
      ...this.corteForm.value 
    };

    this.cajaService.cerrarTurno(payload).subscribe({
      next: (ticket) => {
        this.toastService.showSuccess('Caja cuadrada y cerrada exitosamente');
        this.ticketGenerado.set(ticket); 
        this.modalCorte.set(false);
        this.turnoActual.set(null); // Oculta la vista de cobros al cerrar el turno
        
        // Damos tiempo a Angular de renderizar el div del ticket antes de lanzar la impresión
        setTimeout(() => window.print(), 500); 
        
        this.procesando.set(false);
      },
      error: (err) => {
        this.toastService.showError(err.error || 'Credenciales inválidas');
        this.procesando.set(false);
      }
    });
  }
}