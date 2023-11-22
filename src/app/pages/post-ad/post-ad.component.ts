import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PropertyService } from '../../shared/services/property.service';
import { Property } from '../../shared/models/Properties';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-ad',
  templateUrl: './post-ad.component.html',
  styleUrls: ['./post-ad.component.css']
})
export class PostAdComponent implements OnInit{
  propertyForm: FormGroup | any;
  photos: string[] = [];
  loggedInUser?: firebase.default.User | null;
  constructor(private fb: FormBuilder, private propertyService: PropertyService, private authService: AuthService, private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.propertyForm = this.fb.group({
      address: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      size: ['', [Validators.required, Validators.min(1)]],
      description: ['', Validators.required],
      status: ['', Validators.required],
      location: ['', Validators.required],
      features: this.fb.group({
        type: ['', Validators.required],
        numberOfRooms: ['', [Validators.required, Validators.min(1)]],
        numberOfBathrooms: ['', [Validators.required, Validators.min(1)]],
      }),
      photos: this.photos.length > 0 ? this.photos : [''],
      uploaderID: this.loggedInUser?.uid
    });
    this.authService.isUserLoggedIn().subscribe(user=>{
      this.loggedInUser = user;
      localStorage.setItem('user', JSON.stringify(this.loggedInUser));
      console.log(this.loggedInUser?.uid)
    }, (error: any)=>{
      console.error(error);
      localStorage.setItem('user',JSON.stringify('null'))
    })
  }
  
  onFileSelected() {
    // Ide jöhet a képfeltöltés logikája
    // A képek elérési útvonalait tárold a this.photos tömbben
  }
  
  onSubmit() {
    if (this.propertyForm?.valid) {
      const uploaderID = this.loggedInUser?.uid ?? 'defaultUploaderID';

      // Lekérjük a felhasználó adatait az ID alapján
      this.userService.getUserById(uploaderID).subscribe((user) => {
        const newProperty: Property = {
          ...this.propertyForm.value,
          photos: this.photos.length > 0 ? this.photos : [''],
          uploaderID: uploaderID,
          uploaderFullName: user ? `${user.name.firstname} ${user.name.lastname}` : 'Ismeretlen felhasználó'
        };
        this.propertyService.addProperty(newProperty).then(() => {
          console.log('Property added successfully');
          this.router.navigateByUrl('/main');
        });
      });
    }
  }

}
