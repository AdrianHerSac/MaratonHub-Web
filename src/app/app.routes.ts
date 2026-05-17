import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';
import { PeliculasComponent } from './features/movies/peliculas';
import { MediaDetailComponent } from './features/media-detail/media-detail';
import { TvShowsComponent } from './features/tv-shows/tv-shows';
import { AuthComponent } from './features/auth/auth';
import { MiListaComponent } from './features/mi-lista/mi-lista';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard';
import { UserManagementComponent } from './features/admin/users/user-management';
import { adminGuard } from './core/guards/admin.guard';
import { Profile } from './features/profile/profile';
import { authGuard } from './core/guards/auth.guard';
import { GroupsComponent } from './features/groups/groups';
import { GroupDetailComponent } from './features/groups/group-detail';
import { PersonsComponent } from './features/persons/persons';

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
        path: 'persons',
        component: PersonsComponent
    },
    {
        path: 'person/:id',
        component: MediaDetailComponent
    },
    {
        path: 'groups',
        component: GroupsComponent,
        canActivate: [authGuard]
    },
    {
        path: 'groups/:id',
        component: GroupDetailComponent,
        canActivate: [authGuard]
    },
    {
        path: 'mi-lista',
        component: MiListaComponent,
        canActivate: [authGuard]
    },
    {
        path: 'profile',
        component: Profile,
        canActivate: [authGuard]
    },
    {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [adminGuard]
    },
    {
        path: 'admin/users',
        component: UserManagementComponent,
        canActivate: [adminGuard]
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
