import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { MatIconModule } from '@angular/material/icon';
import { animate, cubicBezier } from 'motion';

@Component({
  selector: 'app-toast',
  imports: [
    MatIconModule
  ],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})

export class Toast {
  toastService = inject(ToastService);
}
