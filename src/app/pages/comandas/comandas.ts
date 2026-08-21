import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { environment } from '../../environments/environment';
import { Platillo } from '../../interfaces/platillo.interface';
import { CrearComandaDto, CrearComandaDetalleDto } from '../../interfaces/comanda.interface';
import { Cliente } from '../../interfaces/cliente.interface';

import { ClienteService } from '../../services/cliente.service';
import { PlatilloService } from '../../services/platillo.service';
import { ComandaService } from '../../services/comanda.service';
import { ToastService } from '../../services/toast.service';

import { PlatilloCard } from '../../components/platillo-card/platillo-card';

export interface ItemCarrito {
  platillo: Platillo;
  cantidad: number;
  notas: string;
  subtotal: number;
}

@Component({
  selector: 'app-comandas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    PlatilloCard
  ],
  templateUrl: './comandas.html',
  styleUrl: './comandas.css',
})
export class Comandas implements OnInit {

  private clienteService = inject(ClienteService);
  private platilloService = inject(PlatilloService);
  private comandaService = inject(ComandaService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  apiUrl = new URL(environment.apiUrl).origin;

  clienteEncontrado = signal<Cliente | null>(null);
  buscandoCliente = signal<boolean>(false);
  
  menuPlatillos = signal<Platillo[]>([]);
  cargando = signal<boolean>(false);
  guardando = signal<boolean>(false);

  tiposPedido = [
    { label: 'Local', value: 1 },
    { label: 'Para Llevar', value: 2 },
    { label: 'Domicilio', value: 3 },
    { label: 'Agendado', value: 4 },
    { label: 'Plataforma', value: 5 }
  ];

  carrito = signal<ItemCarrito[]>([]);
  totalComanda = computed(() => {
    return this.carrito().reduce((acc, item) => acc + item.subtotal, 0);
  });

  comandaForm: FormGroup = this.fb.group({
    tipoPedido: [1, Validators.required],
    numeroMesa: [''],
    nombreClienteLlevar: [''],
    fechaHoraAgendada: [''],
    telefonoBusqueda: [''],
    clienteId: [null]       // Campo oculto real que se enviará a C#
  });

  ngOnInit(): void {
    this.cargarCatalogos();
    this.escucharCambiosTipoPedido();
  }

  cargarCatalogos(): void {
    this.cargando.set(true);

    this.platilloService.getPlatillos().subscribe({
      next: (platillos) => {
        this.menuPlatillos.set(platillos.filter(p => p.estado));
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Error al cargar el menu de platillos');
        this.cargando.set(false);
      }
    });
  }

  escucharCambiosTipoPedido(): void {
    this.comandaForm.get('tipoPedido')?.valueChanges.subscribe(tipo => {
      const tipoNum = Number(tipo);
      const ctrlMesa = this.comandaForm.get('numeroMesa');
      const ctrlLlevar = this.comandaForm.get('nombreClienteLlevar');
      const ctrlFecha = this.comandaForm.get('fechaHoraAgendada');
      const ctrlCliente = this.comandaForm.get('clienteId');

      // Limpiamos todo primero
      ctrlMesa?.clearValidators();
      ctrlLlevar?.clearValidators();
      ctrlFecha?.clearValidators();
      ctrlCliente?.clearValidators();

      // Asignamos validaciones según el tipo (Tipo 3 y 4 requieren Cliente)
      if (tipoNum === 1) ctrlMesa?.setValidators(Validators.required);
      if (tipoNum === 2) ctrlLlevar?.setValidators(Validators.required);
      if (tipoNum === 4) ctrlFecha?.setValidators(Validators.required);
      if (tipoNum === 3 || tipoNum === 4) ctrlCliente?.setValidators(Validators.required);

      // Actualizamos el estado del formulario
      ctrlMesa?.updateValueAndValidity();
      ctrlLlevar?.updateValueAndValidity();
      ctrlFecha?.updateValueAndValidity();
      ctrlCliente?.updateValueAndValidity();

      // Si no es Domicilio(3) ni Agendado(4), limpiamos la pantalla de búsqueda
      if (tipoNum !== 3 && tipoNum !== 4) {
        this.clienteEncontrado.set(null);
        this.comandaForm.patchValue({ telefonoBusqueda: '', clienteId: null });
      }
    });
  }

  // --- LÓGICA DE BÚSQUEDA DE CLIENTE ---
  buscarCliente(): void {
    const telefono = this.comandaForm.get('telefonoBusqueda')?.value;
    
    if (!telefono) {
      this.toastService.showError('Ingrese un número de teléfono');
      return;
    }

    this.buscandoCliente.set(true);
    
    this.clienteService.getClientePorTelefono(telefono).subscribe({
      next: (cliente) => {
        this.clienteEncontrado.set(cliente);
        this.comandaForm.patchValue({ clienteId: cliente.id });
        this.buscandoCliente.set(false);
        this.toastService.showSuccess('Cliente encontrado');
      },
      error: (err) => {
        this.clienteEncontrado.set(null);
        this.comandaForm.patchValue({ clienteId: null });
        this.buscandoCliente.set(false);
        this.toastService.showError('Cliente no encontrado en la base de datos');
        console.error(err);
      }
    });
  }

  agregarAlCarrito(platillo: Platillo): void {
    this.carrito.update(items => {
      const existe = items.find(i => i.platillo.id === platillo.id && i.notas === '');
      if (existe) {
        existe.cantidad += 1;
        existe.subtotal = existe.cantidad * platillo.precio;
        return [...items];
      }
      return [...items, { platillo, cantidad: 1, notas: '', subtotal: platillo.precio }];
    });
  }

  actualizarCantidad(index: number, delta: number): void {
    this.carrito.update(items => {
      const item = items[index];
      item.cantidad += delta;

      if (item.cantidad <= 0) {
        items.splice(index, 1);
      } else {
        item.subtotal = item.cantidad * item.platillo.precio;
      }
      return [...items];
    });
  }

  obtenerRutaImagen(rutaRelativa?: string | null): string {
    if (!rutaRelativa) return '';
    const ruta = rutaRelativa.startsWith('/') ? rutaRelativa : `/${rutaRelativa}`;
    return `${this.apiUrl}${ruta}`;
  }

  enviarComanda(): void {
    if (this.comandaForm.invalid) {
      this.comandaForm.markAllAsTouched();
      this.toastService.showError('Complete los campos obligatorios del pedido.');
      return;
    }

    if (this.carrito().length === 0) {
      this.toastService.showError('La comanda debe contener al menos un platillo.');
      return;
    }

    this.guardando.set(true);
    const formValue = this.comandaForm.value;
    const tipoPedidoNum = Number(formValue.tipoPedido);

    const detallesDto: CrearComandaDetalleDto[] = this.carrito().map(item => ({
      platilloId: item.platillo.id,
      cantidad: item.cantidad,
      precioUnitario: item.platillo.precio,
      notas: item.notas || undefined
    }));

    const nuevaComanda: CrearComandaDto = {
      tipoPedido: tipoPedidoNum,
      numeroMesa: tipoPedidoNum === 1 ? formValue.numeroMesa : undefined,
      nombreClienteLlevar: tipoPedidoNum === 2 ? formValue.nombreClienteLlevar : undefined,
      fechaHoraAgendada: tipoPedidoNum === 4 ? formValue.fechaHoraAgendada : undefined,
      clienteId: (tipoPedidoNum === 3 || tipoPedidoNum === 4) ? formValue.clienteId : undefined,
      detalles: detallesDto
    };

    this.comandaService.crearComanda(nuevaComanda).subscribe({
      next: () => {
        this.toastService.showSuccess('Comanda enviada a cocina exitosamente');
        this.carrito.set([]);
        this.clienteEncontrado.set(null); // Limpiamos la tarjeta visual del cliente
        this.comandaForm.reset({ tipoPedido: 1 });
        this.guardando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Error al guardar la comanda');
        this.guardando.set(false);
      }
    });
  }

  actualizarNotas(index: number, event: any): void {
    const notas = event.target.value;
    this.carrito.update(items => {
      items[index].notas = notas;
      return [...items];
    });
  }
}