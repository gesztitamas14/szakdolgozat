import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-forgot-password-dialog',
  templateUrl: './forgot-password-dialog.component.html',
  styleUrls: ['./forgot-password-dialog.component.css']
})
export class ForgotPasswordDialogComponent {
  email: string | undefined;

  constructor(    public dialogRef: MatDialogRef<ForgotPasswordDialogComponent>,private authService: AuthService) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.email) {
      this.authService.resetPassword(this.email).then(() => {
        this.dialogRef.close();
      }).catch((error: any) => {
        console.error('Hiba a jelszó visszaállításakor:', error);
      });
    }
  }

  checkPasswordStrength(password: string) {
    const hasLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    return { hasLength, hasUpperCase, hasNumbers };
  }
}

