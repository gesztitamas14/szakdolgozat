import { Component, OnInit } from '@angular/core';
import { PropertyService } from '../../shared/services/property.service';
import { UserService } from '../../shared/services/user.service';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/User';
import { Property } from '../../shared/models/Properties';
import { ActivatedRoute, Router } from '@angular/router';

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
  userProperties: Property[] = [];
  viewedUser?: User;
  inactiveProperties: Property[] = [];
  activeProperties: Property[] = [];

  constructor(private userService: UserService,private authService: AuthService, private propertyService: PropertyService, private route: ActivatedRoute, private router: Router){}
  ngOnInit() {
    this.authService.isUserLoggedIn().subscribe(user => {
      this.loggedInUser = user;
  
      this.route.paramMap.subscribe(params => {
        const userId = params.get('userId');
        if (userId) {
          this.userService.getUserById(userId).subscribe(userData => {
            this.currentUser = userData as User;
            this.loadUserProperties(userId);
          });
        } else if (this.loggedInUser?.uid) {
          this.userService.getUserById(this.loggedInUser.uid).subscribe(userData => {
            this.currentUser = userData as User;
          });
        }
      });
    }, error => {
      console.error(error);
      localStorage.setItem('user', JSON.stringify('null'));
    });
  }

  viewPropertyDetails(propertyID: string) {
    this.router.navigate(['/property-details', propertyID]);
  }
  
  loadUserProperties(userId: string) {
    this.propertyService.getUserProperties(userId).subscribe(properties => {
      this.inactiveProperties = properties.filter(property => property.sold === true);
      this.activeProperties = properties.filter(property => property.sold === false);
    });
  }
  formatPrice(price: number): string {
    if (price % 1000000 === 0) {
      return `${price / 1000000}M Ft`;
    } else {
      return `${price} Ft`;
    }
  }
  calculatePricePerSqm(price: number, size: number): string {
    return (price / size).toFixed(1);
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

  logout(_?:boolean){
    this.authService.logout().then(()=>{
      console.log('Logged out successfully.');
    }).catch(error=>{
      console.error(error);
    });
  }

  markAsSold(propertyID: string) {
    this.propertyService.updatePropertyAsSold(propertyID);
  }
  
  deleteProperty(propertyID: string) {
    this.propertyService.deleteProperty(propertyID);
  }

}
