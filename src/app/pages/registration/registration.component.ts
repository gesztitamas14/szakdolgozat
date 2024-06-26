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
    phoneNumber: new FormControl(''),
    name: new FormGroup({
      firstname: new FormControl(''),
      lastname: new FormControl('')
    }),
    imageURL: new FormControl('')
  });

  constructor(private userService: UserService, private location: Location, private authService: AuthService, private router: Router){}

  ngOnInit(): void {}

  onSignup() {
    const email = this.signUpForm.get('email')?.value;
    const password = this.signUpForm.get('password')?.value;
    const phoneNumber = this.signUpForm.get('phoneNumber')?.value;
    
    this.passwordStrength = this.checkPasswordStrength(password as any);
    this.passwordsMatch = this.signUpForm.get('password')?.value === this.signUpForm.get('rePassword')?.value;
  
    if (!(this.passwordStrength.hasLength && this.passwordStrength.hasUpperCase && this.passwordStrength.hasNumbers)) {
      alert("A jelszónak legalább 8 karakter hosszúnak kell lennie, tartalmaznia kell nagybetűt és számot.");
      return;
    }
  
    if (!this.passwordsMatch) {
      alert("A két jelszó nem egyezik.");
      return;
    }
  
    // Check for a valid email
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email as any)) {
      alert("Az e-mail cím formátuma nem helyes.");
      return;
    }
  
    // If all checks pass, proceed with the registration
    if (email && password) {
      this.authService.signup(email, password).then((cred) => {
        const user: User = {
          id: cred.user?.uid as string,
          username: email,
          email: email.split('@')[0],
          name: {
            firstname: this.signUpForm.get('name.firstname')?.value as string,
            lastname: this.signUpForm.get('name.lastname')?.value as string
          },
          phoneNumber: phoneNumber as any,
          imageURL: "",
          isAdmin: false,
        };
        this.userService.create(user).then(() => {
          this.router.navigateByUrl('/main');
        }).catch(error => {
          console.error(error);
        });
      }).catch(error => {
        console.error(error);
        switch (error.code) {
          case 'auth/email-already-in-use':
            alert('Ez az email cím már foglalt.');
            break;
          case 'auth/invalid-email':
            alert('Érvénytelen email cím formátum.');
            break;
          case 'auth/operation-not-allowed':
            alert('A regisztráció jelenleg nem engedélyezett.');
            break;
          case 'auth/weak-password':
            alert('A jelszó túl gyenge. Kérjük, válasszon erősebb jelszót.');
            break;
          default:
            alert('Regisztrációs hiba történt. Kérjük, próbálja újra később.');
        }
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
