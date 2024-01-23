import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PropertyService } from '../../shared/services/property.service';
import { Property } from '../../shared/models/Properties';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/compat/storage';

declare var google: any;

@Component({
  selector: 'app-post-ad',
  templateUrl: './post-ad.component.html',
  styleUrls: ['./post-ad.component.css']
})
export class PostAdComponent implements OnInit{
  @ViewChild('locationInput') locationInput: ElementRef | undefined;
  propertyForm: FormGroup | any;
  photos: string[] = [];
  loggedInUser?: firebase.default.User | null;
  constructor(private fb: FormBuilder, private propertyService: PropertyService, private authService: AuthService, private userService: UserService, private router: Router,private storage: AngularFireStorage) {}

  ngAfterViewInit() {
    this.initPlaceAutocomplete();
  }
  ngOnInit() {
    const dropZone = document.querySelector('.drag-drop-box');
    dropZone?.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    dropZone?.addEventListener('drop', (e: any) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      this.updateImagePreviews(files);
      this.uploadImages(files);
    });  
    this.propertyForm = this.fb.group({
      price: ['', [Validators.required, Validators.min(1)]],
      size: ['', [Validators.required, Validators.min(1)]],
      description: [''],
      status: ['', Validators.required],
      location: ['', Validators.required],
      features: this.fb.group({
        type: ['', Validators.required],
        numberOfRooms: ['', [Validators.required, Validators.min(0)]],
        numberOfBathrooms: ['', [Validators.required, Validators.min(0)]],
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
  initPlaceAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(this.locationInput?.nativeElement);
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      console.log(place);
    });
  }
  private uploadImages(files: FileList) {
    Array.from(files).forEach((file: File) => {
      const path = `properties/${new Date().getTime()}_${file.name}`;
      const fileRef = this.storage.ref(path);
      this.storage.upload(path, file).then(() => {
        fileRef.getDownloadURL().subscribe(url => {
          this.photos.push(url);
        });
      });
    });
  }
  onFileSelected(event: any) {
    const files = event.target.files as FileList;
    this.updateImagePreviews(files);
    this.uploadImages(files);
    if (files && files.length) {
      Array.from(files).forEach((file: File) => { // Itt adjuk hozzá a File típust
        const path = `properties/${new Date().getTime()}_${file.name}`;
        const fileRef = this.storage.ref(path);
        this.storage.upload(path, file).then(() => {
          fileRef.getDownloadURL().subscribe(url => {
            this.photos.push(url);
          });
        });
      });
    }
  }
  updateImagePreviews(files: FileList) {
    const previewContainer = document.querySelector('.image-preview-container');

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.style.maxWidth = '100px';
          img.style.maxHeight = '100px';
          previewContainer?.appendChild(img);
      };
        reader.readAsDataURL(file);
    });
  }
  onSubmit() {
    if (this.propertyForm?.valid) {
      const uploaderID = this.loggedInUser?.uid ?? 'defaultUploaderID';

      // Lekérjük a felhasználó adatait az ID alapján
      this.userService.getUserById(uploaderID).subscribe((user) => {
        const newProperty: Property = {
          ...this.propertyForm.value,
          photos: this.photos,
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
