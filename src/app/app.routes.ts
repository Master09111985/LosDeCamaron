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
    canActivate: [authGuard], // <--- Protegemos el Layout completo
    children: [
        { path: '', component: Home },
        { path: 'catalogos/almacenes', component: Almacenes },
        { path: 'catalogos/asistencias', component: Asistencia },
        { path: 'catalogos/clientes', component: Clientes },
        { path: 'plataforma/cocina', component: Cocina },
        { path: 'plataforma/comandas', component: Comandas },
        { path: 'catalogos/empleados', component: Empleados },
        { path: 'catalogos/puestos', component: Puestos },
        { path: 'catalogos/unidades', component: Unidadmedidas },
        { path: 'catalogos/productos', component: Productos },
        { path: 'catalogos/proveedores', component: Proveedores },
        { path: 'catalogos/inventarios', component: Inventarios },
        { path: 'catalogos/motivos-salida', component: MotivosBaja },
        { path: 'catalogos/plataformas', component: Plataforma },
        { path: 'catalogos/permisos', component: Permisos },
        { path: 'catalogos/metodo-pago', component: MetodoPago },
        { path: 'catalogos/platillos', component: Platillos },
        { path: 'catalogos/usuarios', component: Usuarios },
        { path: 'catalogos/roles', component: Roles },
        { path: 'plataformas/caja', component: Caja },
        { path: 'plataformas/cocina', component: Cocina },
        { path: 'plataformas/menu', component: Comandas }
      ] 
    },
    // 3. Ruta comodin por si la URL esta mal
    { path: '**', redirectTo:'' }
];