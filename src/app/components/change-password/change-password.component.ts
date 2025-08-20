import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { DistributorService } from '../../services/distributor.service';

function passwordMatcher(c: AbstractControl): { [key: string]: boolean } | null {
  const newPassword = c.get('newPassword');
  const confirmPassword = c.get('confirmPassword');
  if (newPassword?.pristine || confirmPassword?.pristine) return null;
  return newPassword?.value === confirmPassword?.value ? null : { 'match': true };
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  passwordForm: FormGroup;
  message: string = '';
  isError: boolean = false;

  constructor(private fb: FormBuilder, private distributorService: DistributorService) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: passwordMatcher });
  }

  async onChangePassword() {


    if (this.passwordForm.invalid) {
      if (this.passwordForm.hasError('match')) {
        this.isError = true;
        this.message = "New passwords do not match.";
      } else {
        // You can add a generic message for other validation errors
        console.log(this.passwordForm.value);
        this.isError = true;
        this.message = "Minimum password length is 6 characters.";
      }
      return;
    }

    const { oldPassword, newPassword } = this.passwordForm.value;
    const result = await this.distributorService.changePassword(oldPassword, newPassword);

    this.message = result.message;
    this.isError = !result.success;

    if (result.success) {
      this.passwordForm.reset();
    }
  }
}