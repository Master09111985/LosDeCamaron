import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ComandaService } from '../../services/comanda.service';
import { MetodoPagoService } from '../../services/metodo-pago.service';
import { ToastService } from '../../services/toast.service';
import { CajaService } from '../../services/caja.service';
import { ProveedorService } from '../../services/proveedor.service';
import { AuthService } from '../../services/auth.service';

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
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Estados Base
  comandaParaImprimir = signal<ComandaDto | null>(null); 
  comandasPorCobrar = signal<ComandaDto[]>([]);
  metodosPagoDb = signal<MetodoPagos[]>([]);
  proveedoresDb = signal<any[]>([]); 
  cargando = signal<boolean>(false);
  procesando = signal<boolean>(false);

  // Estados de Caja (Turnos)
  get usuarioIdActual(): number {
    const usuario = this.authService.usuarioActual();
    if (usuario && usuario.id) {
      return Number(usuario.id);
    }
    
    // Fallback de seguridad leyendo la sesión directamente
    const usuarioSession = sessionStorage.getItem('usuario');
    if (usuarioSession) {
      const userParsed = JSON.parse(usuarioSession);
      return Number(userParsed.id || 1);
    }
    
    return 1; // Último recurso de seguridad para evitar romper la BD
}
  turnoActual = signal<any | null>(null);
  ticketGenerado = signal<any | null>(null);
  
  // Modales
  modalApertura = signal<boolean>(false);
  modalProveedor = signal<boolean>(false);
  modalCorte = signal<boolean>(false);

  // Estados de Selección (Cobro Simple y Mixto)
  comandaSeleccionada = signal<ComandaDto | null>(null);
  metodoPagoSeleccionado = signal<number | null>(null);
  efectivoRecibido = signal<number | null>(null);

  esCobroMixto = signal<boolean>(false);
  combinacionMixta = signal<'tarjeta-efectivo' | 'tarjeta-transferencia' | 'transferencia-efectivo' | null>(null);
  montoMixto1 = signal<number | null>(null); // Monto del primer método (Tarjeta o Transferencia)
  montoMixto2 = signal<number | null>(null); // Monto del segundo método (Efectivo o Transferencia)

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

  // Helper para buscar el ID real en BD de Efectivo, Tarjeta o Transferencia
  private obtenerIdMetodoPorNombre(palabraClave: string): number | null {
    const metodo = this.metodosPagoDb().find(m => m.nombre.toLowerCase().includes(palabraClave.toLowerCase()));
    return metodo ? metodo.id : null;
  }

  esEfectivo = computed(() => {
    if (this.esCobroMixto()) {
      const comb = this.combinacionMixta();
      return comb === 'tarjeta-efectivo' || comb === 'transferencia-efectivo';
    }
    const metodoId = this.metodoPagoSeleccionado();
    const metodo = this.metodosPagoDb().find(m => m.id === metodoId);
    return metodo ? metodo.nombre.toLowerCase().includes('efectivo') : false;
  });

  cambio = computed(() => {
    const recibido = this.efectivoRecibido() || 0;
    if (this.esCobroMixto()) {
      const montoEfectivoACobrar = this.montoMixto2() || 0;
      return recibido > montoEfectivoACobrar ? recibido - montoEfectivoACobrar : 0;
    }
    const total = this.comandaSeleccionada()?.total || 0;
    return recibido > total ? recibido - total : 0;
  });

  cobroValido = computed(() => {
    const comanda = this.comandaSeleccionada();
    if (!comanda) return false;

    if (!this.esCobroMixto()) {
      if (!this.metodoPagoSeleccionado()) return false;
      if (this.esEfectivo() && (this.efectivoRecibido() || 0) < comanda.total) return false;
      return true;
    } else {
      if (!this.combinacionMixta()) return false;
      const m1 = Number(this.montoMixto1() || 0);
      const m2 = Number(this.montoMixto2() || 0);
      const sumaExacta = Math.abs((m1 + m2) - comanda.total) < 0.01;
      if (!sumaExacta || m1 <= 0 || m2 <= 0) return false;
      if (this.esEfectivo() && (this.efectivoRecibido() || 0) < m2) return false;
      return true;
    }
  });

  // ==========================================
  // ACCIONES DE COBRO
  // ==========================================
  seleccionarComanda(comanda: ComandaDto): void {
    this.comandaSeleccionada.set(comanda);
    this.metodoPagoSeleccionado.set(null); 
    this.efectivoRecibido.set(null);
    this.esCobroMixto.set(false);
    this.combinacionMixta.set(null);
    this.montoMixto1.set(null);
    this.montoMixto2.set(null);
  }

  activarModoCobro(mixto: boolean): void {
    this.esCobroMixto.set(mixto);
    this.metodoPagoSeleccionado.set(null);
    this.combinacionMixta.set(null);
    this.montoMixto1.set(null);
    this.montoMixto2.set(null);
    this.efectivoRecibido.set(null);
  }

  seleccionarCombinacionMixta(comb: 'tarjeta-efectivo' | 'tarjeta-transferencia' | 'transferencia-efectivo'): void {
    this.combinacionMixta.set(comb);
    const total = this.comandaSeleccionada()?.total || 0;
    const mitad = Number((total / 2).toFixed(2));
    this.montoMixto1.set(mitad);
    this.montoMixto2.set(Number((total - mitad).toFixed(2)));
    this.efectivoRecibido.set(null);
  }

  actualizarMontoMixto1(valor: number): void {
    const total = this.comandaSeleccionada()?.total || 0;
    const m1 = Math.max(0, Math.min(Number(valor || 0), total));
    this.montoMixto1.set(m1);
    this.montoMixto2.set(Number((total - m1).toFixed(2)));
  }

  actualizarMontoMixto2(valor: number): void {
    const total = this.comandaSeleccionada()?.total || 0;
    const m2 = Math.max(0, Math.min(Number(valor || 0), total));
    this.montoMixto2.set(m2);
    this.montoMixto1.set(Number((total - m2).toFixed(2)));
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
    if (!comanda || !this.turnoActual() || !this.cobroValido()) {
      this.toastService.showError('Verifique los montos y el método de pago seleccionado');
      return;
    }

    let payload: any;

    if (!this.esCobroMixto()) {
      payload = { 
        comandaId: comanda.id, 
        metodoPagoId: this.metodoPagoSeleccionado(), 
        usuarioCajeroId: this.usuarioIdActual 
      };
    } else {
      const comb = this.combinacionMixta();
      const idEfectivo = this.obtenerIdMetodoPorNombre('efectivo') || 1;
      const idTarjeta = this.obtenerIdMetodoPorNombre('tarjeta') || 2;
      const idTransferencia = this.obtenerIdMetodoPorNombre('transferencia') || 3;

      let metodo1Id = idTarjeta;
      let metodo2Id = idEfectivo;

      if (comb === 'tarjeta-efectivo') {
        metodo1Id = idTarjeta;
        metodo2Id = idEfectivo;
      } else if (comb === 'tarjeta-transferencia') {
        metodo1Id = idTarjeta;
        metodo2Id = idTransferencia;
      } else if (comb === 'transferencia-efectivo') {
        metodo1Id = idTransferencia;
        metodo2Id = idEfectivo;
      }

      payload = {
        comandaId: comanda.id,
        metodoPagoId: metodo1Id,
        usuarioCajeroId: this.usuarioIdActual,
        pagos: [
          { metodoPagoId: metodo1Id, monto: Number(this.montoMixto1()) },
          { metodoPagoId: metodo2Id, monto: Number(this.montoMixto2()) }
        ]
      };
    }

    this.procesando.set(true);

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
    // Forzamos el valor a Number para prevenir validaciones fallidas del modelo
    fondoInicial: Number(this.fondoForm.value.fondoInicial) 
  };
  
  this.cajaService.abrirTurno(payload).subscribe({
    next: (turno) => {
      this.turnoActual.set(turno);
      this.modalApertura.set(false);
      this.cargarComandas();
      this.toastService.showSuccess('Caja abierta exitosamente');
      this.procesando.set(false);
    },
    error: (err) => {
      console.error(err);
      // Intentamos leer el mensaje dinámico del backend si existe
      const msg = err.error?.mensaje || err.error || 'Error al abrir la caja';
      this.toastService.showError(msg);
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

  cancelarApertura(): void {
    this.modalApertura.set(false);
    this.fondoForm.reset();
    this.router.navigate(['/']);  //----> Este lo agregue para poder cerrar la apertura de la caja.
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
    ...this.corteForm.value,
    // Asegurar que viajen como números
    efectivoReportado: Number(this.corteForm.value.efectivoReportado)
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