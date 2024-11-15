import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';


const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'recuperar',
    loadChildren: () => import('./pages/recuperar/recuperar.module').then( m => m.RecuperarPageModule)
  },
  {
    path: 'welcome',
    loadChildren: () => import('./pages/welcome/welcome.module').then(m => m.WelcomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'welcomealum',
    loadChildren: () => import('./pages/welcomealum/welcomealum.module').then( m => m.WelcomealumPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'detalle/:id',
    loadChildren: () => import('./pages/detalle/detalle.module').then(m => m.DetallePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'detalle/:id/clase/:code',
    loadChildren: () => import('./pages/clase/clase.module').then(m => m.ClasePageModule),
    canActivate: [AuthGuard]
  }
  

    


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
