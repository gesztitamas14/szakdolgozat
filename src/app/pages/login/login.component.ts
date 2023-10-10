import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { FakeLoadingService } from '../../shared/services/fake-loading.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';

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

  constructor(private router: Router, private loadingService: FakeLoadingService, private authService : AuthService) {}

  ngOnInit(): void {
    
  }
  async login(){
    const emailValue: string = this.email.value || '';
    const passwordValue: string = this.password.value || '';
    this.loading=true;
    //Observable
    /*this.loadingSubscription = this.loadingService.loadingWithObservable(emailValue, passwordValue)
          .subscribe({
               next: (data: boolean)=>{
              this.router.navigateByUrl('/main');
            }, error: (error)=>{
              console.log(error)
              this.loading=false;
            },complete: () =>{
              this.loading=false;
            }
          });*/

      this.authService.login(emailValue, passwordValue).then(cred =>{
        console.log(cred)
        this.router.navigateByUrl('/main');
        this.loading = false;
      }).catch(error=>{
        console.error(error);
      });
  }
  ngOnDestroy(){
    this.loadingSubscription?.unsubscribe();
  }
}
