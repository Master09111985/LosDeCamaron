import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  cargando = signal<boolean>(false);

  loginForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    password: ['', Validators.required]
  });

  iniciarSesion(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    const credenciales = this.loginForm.value;

    this.authService.login(credenciales).subscribe({
      next: (respuestaLogin) => {
        // Soportamos si el backend devuelve el usuario directo o dentro de { usuario: ... }
        const usuario = respuestaLogin?.usuario || respuestaLogin;
        const rolId = usuario?.rolId ?? usuario?.RolId;

        if (!usuario || !rolId) {
          this.toastService.showError('Respuesta de usuario inválida.');
          this.cargando.set(false);
          return;
        }

        // Pedimos los permisos basados en su rol
        this.authService.getPermisosPorRol(rolId).subscribe({
          next: (mapaPermisos) => {
            this.authService.guardarSesion(usuario, mapaPermisos);
            this.cargando.set(false);
            this.toastService.showSuccess(`¡Bienvenido, ${usuario.empleadoNombre || usuario.nombre}!`);
            this.router.navigate(['/']); // <--- Redirigir a la raíz del Layout (Home)
          },
          error: (err) => {
            console.error('Error al obtener permisos:', err);
            this.toastService.showError('Error al cargar los permisos del usuario.');
            this.cargando.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error en login:', err);
        const mensaje = err.error?.mensaje || err.error?.message || 'Usuario o contraseña incorrectos';
        this.toastService.showError(mensaje);
        this.cargando.set(false);
      }
    });
  }
}