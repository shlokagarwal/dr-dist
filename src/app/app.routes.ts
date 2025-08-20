import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { OrdersComponent } from './components/orders/orders.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
    { path: 'change-password', component: ChangePasswordComponent, canActivate: [authGuard] },
    { path: '', redirectTo: '/orders', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }
];