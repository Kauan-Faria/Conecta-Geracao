import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home';
import { AdminComponent } from './pages/admin/admin';
import { ConteudosComponent } from './pages/conteudos/conteudos';
import { LoginComponent } from './pages/login/login';

export const routes: Routes = [

  {
    path: 'login',
    component: LoginComponent,
  },

  {
    path: 'home',
    component: HomeComponent,
  },

  {
    path: 'admin',
    component: AdminComponent,
  },

  {
    path: 'admin/conteudos',
    component: ConteudosComponent,
  },

  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: '/login',
  },

];