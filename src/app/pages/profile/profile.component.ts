import { Component, OnInit } from '@angular/core';
import { PropertyService } from '../../shared/services/property.service';
import { UserService } from '../../shared/services/user.service';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/User';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit{
  newPassword: string = '';
  confirmPassword: string = '';
  loggedInUser?: firebase.default.User | null;
  currentUser?: User;
  passwordStrength: any = {};
  showTooltip: boolean = false;
  passwordsMatch: boolean = false;
  showConfirmTooltip: boolean = false;

  constructor(private userService: UserService,private authService: AuthService){}
  ngOnInit() {
    this.authService.isUserLoggedIn().subscribe(user => {
      this.loggedInUser = user;
      if (this.loggedInUser?.uid) {
        this.userService.getUserById(this.loggedInUser.uid).subscribe(userData => {
          this.currentUser = userData as any;
        });
      }
      localStorage.setItem('user', JSON.stringify(this.loggedInUser));
    }, (error: any) => {
      console.error(error);
      localStorage.setItem('user', JSON.stringify('null'));
    });
  }
  changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      alert('A jelszavak nem egyeznek!');
      return;
    }
    this.authService.changePassword(this.newPassword).then(() => {
      alert('A jelszó sikeresen megváltozott.');
    }).catch(error => {
      console.error('Hiba történt a jelszó változtatásakor:', error);
    });
  }
  checkPasswordStrength(password: string) {
    const hasLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    return { hasLength, hasUpperCase, hasNumbers };
  }
  onPasswordInput() {
    this.passwordStrength = this.checkPasswordStrength(this.newPassword);
    this.showTooltip = !(this.passwordStrength.hasLength && this.passwordStrength.hasUpperCase && this.passwordStrength.hasNumbers);
  }

  onConfirmPasswordInput() {
    this.passwordsMatch = this.newPassword === this.confirmPassword;
    this.showConfirmTooltip = !this.passwordsMatch;
  }
}
