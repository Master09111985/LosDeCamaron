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
      { path: 'catalogos/puestos', component: Puestos },
      { path: 'catalogos/clientes', component: Clientes },
      { path: 'catalogos/unidades', component: Unidadmedidas },
      { path: 'catalogos/empleados', component: Empleados },
      { path: 'catalogos/productos', component: Productos },
      { path: 'catalogos/inventarios', component: Inventarios },
      { path: 'catalogos/motivos-salida', component: MotivosBaja },
      { path: 'catalogos/plataformas', component: Plataforma },
      { path: 'catalogos/metodo-pago', component: MetodoPago },
      { path: 'catalogos/platillos', component: Platillos },
      { path: 'plataforma/comandas', component: Comandas },
      { path: 'plataforma/cocina', component: Cocina }
      ] 
    },
    // 3. Ruta comodin por si la URL esta mal
    { path: '**', redirectTo:'' }
];