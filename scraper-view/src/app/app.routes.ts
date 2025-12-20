import { Routes } from '@angular/router';
import { ChartsPageComponent } from './pages/charts-page.component/charts-page.component';

export const routes: Routes = [
    {
        path: '',
        component: ChartsPageComponent
    },
    {
        path: '**',
        redirectTo: ''
    }
];
