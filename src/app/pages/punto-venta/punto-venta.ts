import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { PlatilloService } from '../../services/platillo.service';
import { ComandaService } from '../../services/comanda.service';
import { ToastService } from '../../services/toast.service';

import { Platillo } from '../../interfaces/platillo.interface';
import { ItemCarrito, CrearComandaDto, CrearComandaDetalleDto } from '../../interfaces/comanda.interface';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-punto-venta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './punto-venta.html',
  styleUrl: './punto-venta.css',
})
export class PuntoVenta /*implements OnInit*/ {/*
  private platilloService = inject(PlatilloService);
  private comandaService = inject(ComandaService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  backendUrl = new URL(environment.apiUrl).origin;

  // Señales de datos
  platillos = signal<Platillo[]>([]);
  carrito = signal<ItemCarrito[]>([]);
  loading = signal<boolean>(true);
  guardando = signal<boolean>(false);

  // Lógica del buscador de platillos
  terminoBusqueda = signal<string>('');
  platillosFiltrados = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase();
    const lista = this.platillos();
    if (!termino) return lista;
    return lista.filter(p => p.nombre.toLowerCase().includes(termino) || p.codigo.toLowerCase().includes(termino));
  });

  // Gran Total Calculado Automáticamente
  totalCuenta = computed(() => {
    return this.carrito().reduce((acc, item) => acc + item.subtotal, 0);
  });

  // Formulario del Pedido (Cabecera)
  pedidoForm: FormGroup = this.fb.group({
    tipoPedido: ['Local', Validators.required], // Local, Llevar, Plataforma, Encargo
    numeroMesa: [''],
    plataformaNombre: [''],
    direccionEntrega: [''],
    horaEntrega: ['']
  });

  // Estado para el modal de notas por platillo
  modalNotasAbierto = signal<boolean>(false);
  indexItemEditando = signal<number>(-1);
  notasControl = this.fb.control('');

  ngOnInit() {
    this.cargarPlatillos();
    
    // Escuchar cambios en tipoPedido para limpiar validaciones si cambian
    this.pedidoForm.get('tipoPedido')?.valueChanges.subscribe(() => {
      this.pedidoForm.patchValue({
        numeroMesa: '', plataformaNombre: '', direccionEntrega: '', horaEntrega: ''
      });
    });
  }

  cargarPlatillos() {
    this.platilloService.getPlatillos().subscribe({
      next: (data) => {
        // Solo mostramos los platillos activos en el punto de venta
        this.platillos.set(data.filter(p => p.estado));
        this.loading.set(false);
      },
      error: () => {
        this.toastService.showError('Error al cargar el menú');
        this.loading.set(false);
      }
    });
  }

  actualizarBusqueda(event: Event) {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }

  // ==========================================
  // CARRITO DE COMPRAS
  // ==========================================
  agregarAlCarrito(platillo: Platillo) {
    this.carrito.update(items => {
      // Buscar si ya existe en el carrito
      const itemExistenteIndex = items.findIndex(i => i.platilloId === platillo.id && i.notas === '');
      
      if (itemExistenteIndex >= 0) {
        // Si ya existe (y no tiene notas especiales), le sumamos 1 a la cantidad
        const nuevosItems = [...items];
        nuevosItems[itemExistenteIndex].cantidad += 1;
        nuevosItems[itemExistenteIndex].subtotal = nuevosItems[itemExistenteIndex].cantidad * platillo.precio;
        return nuevosItems;
      } else {
        // Si no existe, lo agregamos como nuevo
        return [...items, {
          platilloId: platillo.id,
          nombre: platillo.nombre,
          fotoUrl: platillo.fotoUrl,
          cantidad: 1,
          precioUnitario: platillo.precio,
          subtotal: platillo.precio,
          notas: ''
        }];
      }
    });
  }

  quitarDelCarrito(index: number) {
    this.carrito.update(items => items.filter((_, i) => i !== index));
  }

  actualizarCantidad(index: number, incremento: number) {
    this.carrito.update(items => {
      const nuevosItems = [...items];
      const item = nuevosItems[index];
      
      const nuevaCantidad = item.cantidad + incremento;
      if (nuevaCantidad > 0) {
        item.cantidad = nuevaCantidad;
        item.subtotal = item.cantidad * item.precioUnitario;
      }
      return nuevosItems;
    });
  }

  // ==========================================
  // NOTAS ESPECIALES
  // ==========================================
  abrirModalNotas(index: number) {
    this.indexItemEditando.set(index);
    this.notasControl.setValue(this.carrito()[index].notas);
    this.modalNotasAbierto.set(true);
  }

  guardarNotas() {
    const index = this.indexItemEditando();
    if (index >= 0) {
      this.carrito.update(items => {
        const nuevosItems = [...items];
        nuevosItems[index].notas = this.notasControl.value || '';
        return nuevosItems;
      });
    }
    this.modalNotasAbierto.set(false);
  }

  // ==========================================
  // ENVIAR COMANDA AL BACKEND
  // ==========================================
  procesarComanda() {
    if (this.carrito().length === 0) {
      this.toastService.showError('Agrega al menos un platillo a la comanda');
      return;
    }

    // Validaciones customizadas dependiendo del tipo de pedido
    const formValues = this.pedidoForm.value;
    if (formValues.tipoPedido === 'Local' && !formValues.numeroMesa) {
      this.toastService.showError('Debes ingresar el número de mesa');
      return;
    }
    if (formValues.tipoPedido === 'Plataforma' && !formValues.plataformaNombre) {
      this.toastService.showError('Selecciona la plataforma (DiDi, Uber, etc)');
      return;
    }
    if (formValues.tipoPedido === 'Encargo' && (!formValues.direccionEntrega || !formValues.horaEntrega)) {
      this.toastService.showError('Faltan datos de entrega para el encargo');
      return;
    }

    this.guardando.set(true);

    // Armamos el DTO transformando el ItemCarrito a CrearComandaDetalleDto
    const detallesDto: CrearComandaDetalleDto[] = this.carrito().map(item => ({
      platilloId: item.platilloId,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      notas: item.notas || undefined
    }));

    const comandaNueva: CrearComandaDto = {
      tipoPedido: formValues.tipoPedido,
      numeroMesa: formValues.numeroMesa || undefined,
      plataformaNombre: formValues.plataformaNombre || undefined,
      direccionEntrega: formValues.direccionEntrega || undefined,
      horaEntrega: formValues.horaEntrega ? new Date(formValues.horaEntrega).toISOString() : undefined,
      detalles: detallesDto
    };

    this.comandaService.crearComanda(comandaNueva).subscribe({
      next: (res) => {
        this.toastService.showSuccess(`Comanda #${res.comandaId} registrada exitosamente`);
        // Limpiamos todo para el siguiente cliente
        this.carrito.set([]);
        this.pedidoForm.reset({ tipoPedido: 'Local' });
        this.guardando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Ocurrió un error al procesar la comanda');
        this.guardando.set(false);
      }
    });
  }*/
}