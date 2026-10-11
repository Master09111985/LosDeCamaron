import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { Layout } from './layout/layout/layout';
import { LoginComponent } from './pages/login/login';

import { Home } from './pages/home/home';
import { Almacenes } from './pages/almacenes/almacenes';
import { Puestos } from './pages/puestos/puestos';
import { Clientes } from './pages/clientes/clientes';
import { Unidadmedidas } from './pages/unidadmedidas/unidadmedidas';
import { Empleados } from './pages/empleados/empleados';
import { Productos } from './pages/productos/productos';
import { Inventarios } from './pages/inventario/inventario';
import { MotivosBaja } from './pages/motivos-baja/motivos-baja';
import { Plataforma } from './pages/plataforma/plataforma';
import { MetodoPago } from './pages/metodo-pago/metodo-pago';
import { Platillos } from './pages/platillos/platillos';
import { Comandas } from './pages/comandas/comandas';
import { Cocina } from './pages/cocina/cocina';
import { Usuarios } from './pages/usuarios/usuarios';
import { Roles } from './pages/roles/roles';
import { Permisos } from './pages/permisos/permisos';
import { Caja } from './pages/caja/caja';
import { Proveedores } from './pages/proveedores/proveedores';
import { Asistencia } from './pages/asistencia/asistencia';
import { Nomina } from './pages/nomina/nomina';

export const routes: Routes = [
  // 1. Ruta pública para el Login
  { 
    path: 'login', 
    component: LoginComponent 
  },
  // 2. Rutas protegidas dentro del Layout
  { 
    path: '', 
    component: Layout,
    canActivate: [authGuard], // <--- CANDADO PRINCIPAL ACTIVO
    canActivateChild: [authGuard], // <--- PROTEGE TODAS LAS RUTAS HIJAS POR PERMISO
    children: [
      { path: '', component: Home },
      { path: 'catalogos/almacenes', component: Almacenes, data: { permiso: 'Almacenes' } },
      { path: 'catalogos/asistencias', component: Asistencia, data: { permiso: 'Checador' } },
      { path: 'catalogos/clientes', component: Clientes, data: { permiso: 'Clientes' } },
      { path: 'catalogos/empleados', component: Empleados, data: { permiso: 'Empleados' } },
      { path: 'catalogos/puestos', component: Puestos, data: { permiso: 'Puestos' } },
      { path: 'catalogos/unidades', component: Unidadmedidas, data: { permiso: 'Unidades' } },
      { path: 'catalogos/productos', component: Productos, data: { permiso: 'Productos' } },
      { path: 'catalogos/proveedores', component: Proveedores, data: { permiso: 'Proveedores' } },
      { path: 'catalogos/inventarios', component: Inventarios, data: { permiso: 'Inventarios' } },
      { path: 'catalogos/motivos-salida', component: MotivosBaja, data: { permiso: 'MotivosSalida' } },
      { path: 'catalogos/plataformas', component: Plataforma, data: { permiso: 'Plataformas' } },
      { path: 'catalogos/permisos', component: Permisos, data: { permiso: 'Permisos' } },
      { path: 'catalogos/metodo-pago', component: MetodoPago, data: { permiso: 'MetodosDePago' } },
      { path: 'catalogos/platillos', component: Platillos, data: { permiso: 'Platillos' } },
      { path: 'catalogos/usuarios', component: Usuarios, data: { permiso: 'Usuarios' } },
      { path: 'catalogos/roles', component: Roles, data: { permiso: 'Roles' } },
      
      // Plataformas
      { path: 'plataformas/caja', component: Caja, data: { permiso: 'Caja' } },
      { path: 'plataformas/comandas', component: Comandas, data: { permiso: 'Menu' } },
      { path: 'plataformas/menu', component: Comandas, data: { permiso: 'Menu' } },
      { path: 'plataformas/cocina', component: Cocina, data: { permiso: 'Cocina' } },

      // Reportes
      { path: 'reportes/dashboard', component: Home, data: { permiso: 'Dashboard' } },
      { path: 'reportes/nomina', component: Nomina, data: { permiso: 'Nomina' } }
    ] 
  },
  // 3. Ruta comodín redirige a login si no hay sesión
  { path: '**', redirectTo: 'login' }
];