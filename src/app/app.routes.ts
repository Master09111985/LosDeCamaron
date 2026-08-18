import { Routes } from '@angular/router';
import { Layout } from './layout/layout/layout';

import { Home } from './pages/home/home';
import { Almacenes } from './pages/almacenes/almacenes';
import { Puestos } from './pages/puestos/puestos';
import { Clientes } from './pages/clientes/clientes';
import { UnidadMedidaService } from './services/unidadmedida.service';
import { Unidadmedidas } from './pages/unidadmedidas/unidadmedidas';
import { Empleados } from './pages/empleados/empleados';
import { Productos } from './pages/productos/productos';
import { Inventarios } from './pages/inventario/inventario';
import { MotivosBaja } from './pages/motivos-baja/motivos-baja';
import { Plataforma } from './pages/plataforma/plataforma';
import { MetodoPago } from './pages/metodo-pago/metodo-pago';
import { Platillos } from './pages/platillos/platillos';

export const routes: Routes = [
    { path: '', 
      component: Layout,
      children: [
        {
          path: '',
          component: Home
        },
        {
          path: 'catalogos/almacenes',
          component: Almacenes
        },
        {
          path: 'catalogos/puestos',
          component: Puestos
        },
        {
          path: 'catalogos/clientes',
          component: Clientes
        },
        {
          path: 'catalogos/unidades',
          component: Unidadmedidas
        },
        {
          path: 'catalogos/empleados',
          component: Empleados
        },
        {
          path: 'catalogos/productos',
          component: Productos
        },
        {
          path: 'catalogos/inventarios',
          component: Inventarios
        },
        {
          path: 'catalogos/motivos-salida',
          component: MotivosBaja
        },
        {
          path: 'catalogos/plataformas',
          component: Plataforma
        },
        {
          path: 'catalogos/metodo-pago',
          component: MetodoPago
        },
        {
          path: 'catalogos/platillos',
          component: Platillos
        }
      ] 
    }
];
