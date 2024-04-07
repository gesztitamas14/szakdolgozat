import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { FakeLoadingService } from '../../shared/services/fake-loading.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ForgotPasswordDialogComponent } from '../forgot-password-dialog/forgot-password-dialog.component';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy{
  email = new FormControl('')
  password = new FormControl('')
  loadingSubscription?: Subscription;
  loading: boolean = false;
  loginError: string | null = null;
  storage = getStorage();
  imageRef = ref(this.storage, 'signup/signup.jpg');

  constructor(private router: Router, private loadingService: FakeLoadingService, private authService : AuthService, public dialog: MatDialog) {}

  ngOnInit(): void {
    
  }
  async login() {
    this.loginError = null;
    const emailValue: string = this.email.value || '';
    const passwordValue: string = this.password.value || '';
    this.loading = true;

    this.authService.login(emailValue, passwordValue).then(cred => {
      this.router.navigateByUrl('/main');
      this.loading = false;
    }).catch(error => {
      this.loginError = 'Hiba a bejelentkezés során. Kérjük, ellenőrizze az adatait!';
      this.loading = false;
      console.error(error);
    });
  }
  ngOnDestroy(){
    this.loadingSubscription?.unsubscribe();
  }
  openForgotPasswordDialog(): void {
    const dialogRef = this.dialog.open(ForgotPasswordDialogComponent, {
      width: '60%',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {});
  }

}
