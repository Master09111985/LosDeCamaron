import { Component, input, output } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header-catalogo',
  imports: [
    MatIconModule
  ],
  templateUrl: './header-catalogo.html',
  styleUrl: './header-catalogo.css',
})

export class HeaderCatalogo {

  titulo = input.required<string>();
  subtitulo = input.required<string>();
  textoBoton = input.required<string>();

  modal = output();

  abrirModal(): void {}
}