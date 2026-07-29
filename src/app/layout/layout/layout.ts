import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})

export class Layout {

  isSidebarOpen = signal(true);
  isCatalogosOpen = signal(true);
  isPlataformasOpen = signal(true);

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  toggleCatalogos() {
    if (!this.isSidebarOpen()) {
      this.isSidebarOpen.set(true);
      this.isCatalogosOpen.set(true);
    } else {
      this.isCatalogosOpen.update(v => !v);
    }
  }

  togglePlataformas() {
    if (!this.isSidebarOpen()) {
      this.isSidebarOpen.set(true);
      this.isPlataformasOpen.set(true);
    } else {
      this.isPlataformasOpen.update(v => !v);
    }
  }

}