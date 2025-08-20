import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    errorMessage: string = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            distributorCode: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        if (this.authService.isLoggedIn()) {
            this.router.navigate(['/orders']);
        }
    }

    async onLogin() {
        if (this.loginForm.invalid) return;
        const { distributorCode, password } = this.loginForm.value;
        const isLoggedIn = await this.authService.login(distributorCode, password);
        if (isLoggedIn) {
            this.router.navigate(['/orders']);
        } else {
            this.errorMessage = 'Invalid distributor code or password.';
        }
    }
}