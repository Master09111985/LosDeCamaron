import { Component, input, computed, output } from '@angular/core';

import { environment } from '../../environments/environment';
import { Platillo } from '../../interfaces/platillo.interface';

@Component({
  selector: 'app-platillo-card',
  imports: [],
  templateUrl: './platillo-card.html',
  styleUrl: './platillo-card.css',
})

export class PlatilloCard {

  platillo = input.required<Platillo>();
  seleccion = output<number>();

  rutaImagen = computed(() => {
    if (!this.platillo().fotoUrl) return '';
    const ruta = this.platillo().fotoUrl.startsWith('/') ? this.platillo().fotoUrl : `/${this.platillo().fotoUrl}`;
    return `${environment.backendUrl}` + `${ruta}`;
  });

  alSeleccionarPlatillo() {
    this.seleccion.emit(this.platillo().id);
  }

}