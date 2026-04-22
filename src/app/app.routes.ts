import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';
import { PeliculasComponent } from './features/movies/peliculas';
import { MediaDetailComponent } from './features/media-detail/media-detail';
import { TvShowsComponent } from './features/tv-shows/tv-shows';
import { AuthComponent } from './features/auth/auth';
import { authGuard } from './core/guards/auth.guard';
import { MiListaComponent } from './features/mi-lista/mi-lista';

export const routes: Routes = [
    {
      path: 'login',
      component: AuthComponent
    },
    {
      path: 'inicio',
      component: HomeComponent
    },
    {
      path: 'movies',
      component: PeliculasComponent
    },
    {
        path: 'movie/:id',
        component: MediaDetailComponent
    },
    {
      path: 'tv',
      component: TvShowsComponent
    },
    {
        path: 'tv/:id',
        component: MediaDetailComponent
    },
    {
        path: 'person/:id',
        component: MediaDetailComponent
    },
    {
        path: 'mi-lista',
        component: MiListaComponent,
        canActivate: [authGuard]
    },
    {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'inicio'
    }
];
