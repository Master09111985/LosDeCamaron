import { Component, input, computed, output } from '@angular/core';
import { Platillo } from '../../interfaces/platillo.interface';

@Component({
  selector: 'app-platillo-card',
  standalone: true,
  imports: [],
  templateUrl: './platillo-card.html',
  styleUrl: './platillo-card.css',
})
export class PlatilloCard {

  platillo = input.required<Platillo>();
  seleccion = output<number>();

  // Devuelve la URL directa de Cloudinary o un placeholder de respaldo
  rutaImagen = computed(() => {
    return this.platillo().fotoUrl || 'assets/placeholder-food.png';
  });

  alSeleccionarPlatillo() {
    this.seleccion.emit(this.platillo().id);
  }

}