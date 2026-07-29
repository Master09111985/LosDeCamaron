import { Routes } from '@angular/router';
import { Layout } from './layout/layout/layout';

import { Home } from './pages/home/home';
import { Almacenes } from './pages/almacenes/almacenes';
import { Puestos } from './pages/puestos/puestos';

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
        }
      ] 
    }
];
