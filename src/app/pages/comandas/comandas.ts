import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { environment } from '../../environments/environment';
import { Platillo } from '../../interfaces/platillo.interface';
import { CrearComandaDto, CrearComandaDetalleDto } from '../../interfaces/comanda.interface';
import { Cliente } from '../../interfaces/cliente.interface';
import { Plataforma } from '../../interfaces/plataforma.interface';

import { ClienteService } from '../../services/cliente.service';
import { PlatilloService } from '../../services/platillo.service';
import { ComandaService } from '../../services/comanda.service';
import { ToastService } from '../../services/toast.service';
import { PlataformaService } from '../../services/plataforma.service';

import { PlatilloCard } from '../../components/platillo-card/platillo-card';

export interface ItemCarrito {
  platillo: Platillo;
  cantidad: number;
  notas: string;
  subtotal: number;
  numeroPlato: number;
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
  private plataformaService = inject(PlataformaService);
  private fb = inject(FormBuilder);

  apiUrl = new URL(environment.apiUrl).origin;

  clienteEncontrado = signal<Cliente | null>(null);
  buscandoCliente = signal<boolean>(false);
  
  menuPlatillos = signal<Platillo[]>([]);
  plataformas = signal<Plataforma[]>([]);
  cargando = signal<boolean>(false);
  guardando = signal<boolean>(false);

  // SELECCIÓN DE PLATOS
  platosDisponibles = signal<number[]>([1, 2, 3, 4, 5, 6]); // Soporta hasta 6 platos a la vez
  platoActivo = signal<number>(1);

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
    clienteId: [null],       
    plataformaId: [null]
  });

  ngOnInit(): void {
    this.cargarCatalogos();
    this.escucharCambiosTipoPedido();
  }

  // --- LÓGICA DE PLATOS ---
  seleccionarPlato(numero: number): void {
    this.platoActivo.set(numero);
  }

  // Obtenemos los items del carrito filtrados por el plato actual para mostrarlos ordenados
  getItemsPorPlato(platoNum: number) {
    return this.carrito().filter(item => item.numeroPlato === platoNum);
  }

  // --- LOGICA ORIGINAL DE CATÁLOGOS ---
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

    this.plataformaService.getPlataformasActivas().subscribe({
      next: (data) => this.plataformas.set(data),
      error: (err) => console.error('Error al cargar plataformas', err)
    });
  }

  escucharCambiosTipoPedido(): void {
    this.comandaForm.get('tipoPedido')?.valueChanges.subscribe(tipo => {
      const tipoNum = Number(tipo);
      const ctrlMesa = this.comandaForm.get('numeroMesa');
      const ctrlLlevar = this.comandaForm.get('nombreClienteLlevar');
      const ctrlFecha = this.comandaForm.get('fechaHoraAgendada');
      const ctrlCliente = this.comandaForm.get('clienteId');
      const ctrlPlataforma = this.comandaForm.get('plataformaId');

      ctrlMesa?.clearValidators();
      ctrlLlevar?.clearValidators();
      ctrlFecha?.clearValidators();
      ctrlCliente?.clearValidators();
      ctrlPlataforma?.clearValidators();

      if (tipoNum === 1) ctrlMesa?.setValidators(Validators.required);
      if (tipoNum === 2) ctrlLlevar?.setValidators(Validators.required);
      if (tipoNum === 4) ctrlFecha?.setValidators(Validators.required);
      if (tipoNum === 3 || tipoNum === 4) ctrlCliente?.setValidators(Validators.required);
      if (tipoNum === 5) ctrlPlataforma?.setValidators(Validators.required);

      ctrlMesa?.updateValueAndValidity();
      ctrlLlevar?.updateValueAndValidity();
      ctrlFecha?.updateValueAndValidity();
      ctrlCliente?.updateValueAndValidity();
      ctrlPlataforma?.updateValueAndValidity();

      if (tipoNum !== 3 && tipoNum !== 4) {
        this.clienteEncontrado.set(null);
        this.comandaForm.patchValue({ telefonoBusqueda: '', clienteId: null });
      }
      
      if (tipoNum !== 5) {
        this.comandaForm.patchValue({ plataformaId: null });
      }
    });
  }

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

  // --- CARRITO ACTUALIZADO PARA RECIBIR PLATOS ---
  agregarAlCarrito(platillo: Platillo): void {
    const platoActual = this.platoActivo();
    
    this.carrito.update(items => {
      // Ahora verificamos que sea el mismo platillo Y EN EL MISMO PLATO
      const existe = items.find(i => i.platillo.id === platillo.id && i.notas === '' && i.numeroPlato === platoActual);
      
      if (existe) {
        existe.cantidad += 1;
        existe.subtotal = existe.cantidad * platillo.precio;
        return [...items];
      }
      
      return [...items, { platillo, cantidad: 1, notas: '', subtotal: platillo.precio, numeroPlato: platoActual }];
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

  actualizarNotas(index: number, event: any): void {
    const notas = event.target.value;
    this.carrito.update(items => {
      items[index].notas = notas;
      return [...items];
    });
  }

  obtenerRutaImagen(rutaRelativa?: string): string {
    if (!rutaRelativa) return '';
    return `https://camaronserver:9000${rutaRelativa}`; 
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
      notas: item.notas || undefined,
      numeroPlato: item.numeroPlato
    }));

    const nuevaComanda: CrearComandaDto = {
      tipoPedido: tipoPedidoNum,
      numeroMesa: tipoPedidoNum === 1 ? formValue.numeroMesa : undefined,
      nombreClienteLlevar: tipoPedidoNum === 2 ? formValue.nombreClienteLlevar : undefined,
      fechaHoraAgendada: tipoPedidoNum === 4 ? formValue.fechaHoraAgendada : undefined,
      clienteId: (tipoPedidoNum === 3 || tipoPedidoNum === 4) ? formValue.clienteId : undefined,
      plataformaId: tipoPedidoNum === 5 ? formValue.plataformaId : undefined,
      detalles: detallesDto
    };

    this.comandaService.crearComanda(nuevaComanda).subscribe({
      next: () => {
        this.toastService.showSuccess('Comanda enviada a cocina exitosamente');
        this.carrito.set([]);
        this.platoActivo.set(1); // Reseteamos al Plato 1
        this.clienteEncontrado.set(null); 
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
}