import { Routes } from '@angular/router';
import { Layout } from './layout/layout/layout';

import { Home } from './pages/home/home';
import { Almacenes } from './pages/almacenes/almacenes';
import { Puestos } from './pages/puestos/puestos';
import { Clientes } from './pages/clientes/clientes';
import { UnidadMedidaService } from './services/unidadmedida.service';
import { Unidadmedidas } from './pages/unidadmedidas/unidadmedidas';
import { Empleados } from './pages/empleados/empleados';

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
        }
      ] 
    }
];
