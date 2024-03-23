import { Component,Renderer2, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PropertyService } from '../../shared/services/property.service';
import { UserService } from '../../shared/services/user.service';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/User';
import { Property } from '../../shared/models/Properties';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
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
  ImageURL: string | null = null;
  selectedFile: File | null = null;
  showUpdateSection = false;
  // Az aktív/inaktív ingatlanok listájának jelenlegi oldalszáma.
  activePage: number = 1;
  inactivePage: number = 1;

  // Az egy oldalon megjelenítendő aktív/inaktív ingatlanok száma.
  activePageSize: number = 2;
  inactivePageSize: number = 2;

  // Az összes lehetséges oldal száma az aktív/inaktív ingatlanok listájában.
  totalActivePages: number = 0;
  totalInactivePages: number = 0;

  // Az összes elérhető aktív/inaktív ingatlanok teljes listája.
  // Ez a lista nem változik a lapozás során, így mindig az eredeti, teljes listából tudunk kiválasztani.
  originalActiveProperties: Property[] = [];
  originalInactiveProperties: Property[] = [];
  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  @ViewChild('dropZone') dropZoneElement: ElementRef | undefined;
  isUploading: boolean = false;
  uploadButtonDisabled: boolean = false;
  previewImageURL: string | null = null;
  

  constructor(private renderer: Renderer2, private storage: AngularFireStorage, private userService: UserService, private authService: AuthService, private propertyService: PropertyService, private route: ActivatedRoute, private router: Router) { }
  ngOnInit() {
    this.authService.isUserLoggedIn().subscribe(user => {
      this.loggedInUser = user;
  
      this.route.paramMap.subscribe(params => {
        const userId = params.get('userId');
        if (userId) {
          this.userService.getUserById(userId).subscribe(userData => {
            this.currentUser = userData as User;
            this.ImageURL = userData!.imageURL || null;
            this.loadUserProperties(userId);
          });
        } else if (this.loggedInUser?.uid) {
          this.userService.getUserById(this.loggedInUser.uid).subscribe(userData => {
            this.currentUser = userData as User;
            this.ImageURL = userData!.imageURL || null;
          });
        }
      });
    });
  }

  viewPropertyDetails(propertyID: string) {
    this.router.navigate(['/property-details', propertyID]);
  }

  toggleUpdateSection(): void {
    this.showUpdateSection = !this.showUpdateSection;
  }
  

  
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.previewImageURL = URL.createObjectURL(file); // Set preview image URL
    }
  }
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.renderer.addClass(this.dropZoneElement?.nativeElement, 'dragover');
  }
  
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.renderer.removeClass(this.dropZoneElement?.nativeElement, 'dragover');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.renderer.removeClass(this.dropZoneElement?.nativeElement, 'dragover');

    if (event.dataTransfer && event.dataTransfer.files) {
      const file = event.dataTransfer.files[0];
      this.selectedFile = file;
      this.previewImageURL = URL.createObjectURL(file); // Set preview image URL
    }
  }

  uploadImage(): void {
    if (this.selectedFile) {
      this.isUploading = true;
      this.uploadButtonDisabled = true;
  
      const filePath = `profilePictures/${new Date().getTime()}_${this.selectedFile.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, this.selectedFile);
  
      uploadTask.snapshotChanges().pipe(
        finalize(() => fileRef.getDownloadURL().subscribe(
          (url) => {
            this.updateUserProfileImageUrl(this.loggedInUser!.uid, url);
          },
          (error) => {
            console.error("Error fetching file URL: ", error);
          }
        ))
      ).subscribe(
        null,
        (error) => console.error("Error uploading file: ", error),
        () => {
          // Completion logic
          this.previewImageURL = null;
          this.isUploading = false;
          this.uploadButtonDisabled = false;
          this.ImageURL = null;
          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }
        }
      );
  
      this.selectedFile = null; // Reset selected file
    }
  }
  

  
  onClickDropZone(): void {
    this.fileInput?.nativeElement.click();
  }

  updateUserProfileImageUrl(userId: string, imageUrl: string): void {
    if (typeof imageUrl !== 'string' || !imageUrl) {
      console.error("Invalid image URL. Update aborted.");
      return;
    }
  
    this.userService.updateUser(userId, { imageURL: imageUrl })
      .then(() => console.log("Profile image updated successfully."))
      .catch(error => console.error("Error updating profile image:", error));
  }
  

  loadUserProperties(userId: string) {
    this.propertyService.getUserProperties(userId).subscribe(properties => {
      this.originalInactiveProperties = properties.filter(property => property.sold === true);
      this.originalActiveProperties = properties.filter(property => property.sold === false);

      // Oldalszámok kiszámítása
      this.totalActivePages = Math.ceil(this.originalActiveProperties.length / this.activePageSize);
      this.totalInactivePages = Math.ceil(this.originalInactiveProperties.length / this.inactivePageSize);

      // Lapozás
      this.updateActivePropertiesView();
      this.updateInactivePropertiesView();
    });
  }
  updateActivePropertiesView() {
    const start = (this.activePage - 1) * this.activePageSize;
    const end = start + this.activePageSize;
    this.activeProperties = this.originalActiveProperties.slice(start, end);
  }

  updateInactivePropertiesView() {
    const start = (this.inactivePage - 1) * this.inactivePageSize;
    const end = start + this.inactivePageSize;
    this.inactiveProperties = this.originalInactiveProperties.slice(start, end);
  }

  // Lapozás metódusok
  nextActivePage() {
    if (this.activePage < this.totalActivePages) {
      this.activePage++;
      this.updateActivePropertiesView();
    }
  }

  previousActivePage() {
    if (this.activePage > 1) {
      this.activePage--;
      this.updateActivePropertiesView();
    }
  }

  nextInactivePage() {
    if (this.inactivePage < this.totalInactivePages) {
      this.inactivePage++;
      this.updateInactivePropertiesView();
    }
  }

  previousInactivePage() {
    if (this.inactivePage > 1) {
      this.inactivePage--;
      this.updateInactivePropertiesView();
    }
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

  logout(_?: boolean) {
    this.authService.logout().then(() => {
      //console.log('Logged out successfully.');
    }).catch(error => {
      console.error(error);
    });
  }

  markAsSold(propertyID: string) {
    this.propertyService.updatePropertyAsSold(propertyID);
  }

  deleteProperty(propertyID: string) {
    this.propertyService.deleteProperty(propertyID);
  }

  calculateRentPrice(price: number) {
    return (price / 1000).toFixed(0);
  }

}
