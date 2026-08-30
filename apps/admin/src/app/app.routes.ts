import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './guards/auth.guard';
import { HomeComponent } from './pages/home/home';
import { AdminComponent } from './pages/admin/admin';
import { ConteudosComponent } from './pages/conteudos/conteudos';
import { LoginComponent } from './pages/login/login';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin/conteudos',
    component: ConteudosComponent,
    canActivate: [authGuard],
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
