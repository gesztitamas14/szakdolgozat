import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from 'src/app/shared/services/user.service';
import { User } from '../../shared/models/User';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit{
  passwordStrength = { hasLength: false, hasUpperCase: false, hasNumbers: false };
  passwordsMatch = false;
  validEmail = false;

  signUpForm= new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
    rePassword: new FormControl(''),
    name: new FormGroup({
      firstname: new FormControl(''),
      lastname: new FormControl('')
    })
  });

  constructor(private userService: UserService, private location: Location, private authService: AuthService, private router: Router){}

  ngOnInit(): void {}

  onSignup() {
    const email = this.signUpForm.get('email')?.value;
    const password = this.signUpForm.get('password')?.value;
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    this.passwordStrength = this.checkPasswordStrength(password as any);
    this.passwordsMatch = this.signUpForm.get('password')?.value === this.signUpForm.get('rePassword')?.value;
    if (!(this.passwordStrength.hasLength && this.passwordStrength.hasUpperCase && this.passwordStrength.hasNumbers)) {
      alert("A jelszónak legalább 8 karakter hosszúnak kell lennie, tartalmaznia kell nagybetűt és számot.");
    }
    else if (!emailRegex.test(email as any)) {
      alert("Az e-mail cím formátuma nem helyes.");
    }
    else if (!this.passwordsMatch) {
      alert("A két jelszó nem egyezik.");
    }
  
    if (email && password) {
      this.authService.signup(email, password).then((cred) => {
        const user: User = {
          id: cred.user?.uid as string,
          username: email as string,
          email: email.split('@')[0] as string,
          name: {
            firstname: this.signUpForm.get('name.firstname')?.value as string,
            lastname: this.signUpForm.get('name.lastname')?.value as string
          },
        };
        this.userService.create(user).then(() => {
          this.router.navigateByUrl('/contact');
        }).catch(error => {
          console.error(error);
        });
      }).catch(error => {
        console.error(error);
      });
    }
  }

  goBack() {
    this.location.back();
  }
  checkPasswordStrength(password: string) {
    const hasLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    return { hasLength, hasUpperCase, hasNumbers };
  }

  onEmailInput() {
    const email = this.signUpForm.get('email')?.value;
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email as any)) {
      alert("Az e-mail cím formátuma nem helyes.");
    }
  }
}
