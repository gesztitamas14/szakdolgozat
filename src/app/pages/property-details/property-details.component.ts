import { Component, OnInit, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../shared/services/property.service';
import { Property } from '../../shared/models/Properties';
import { Location } from '@angular/common';
import { UserService } from '../../shared/services/user.service';
import { FavoritesService } from '../../shared/services/favorites.service';
import { AuthService } from '../../shared/services/auth.service';
import { FavoriteProperty } from '../../shared/models/Favorites';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { first } from 'rxjs/operators';
import { ChatService } from '../../shared/services/chat.service';

declare var google: any;

@Component({
  selector: 'app-property-details',
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.css']
})
export class PropertyDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer: ElementRef | undefined;
  selectedProperty: Property | null = null;
  uploaderFullName: string | null = null;
  isFavorite: boolean = false;
  loggedInUser?: firebase.default.User | null;
  currentImageIndex: number = 0;
  isImageOverlayVisible: boolean = false;
  advertiserImage: string | null = null;
  advertiserphoneNumber: number |null = null;
  showMap: boolean =false;


  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private userService: UserService,
    private favoritesService: FavoritesService,
    private authService: AuthService,
    private afs: AngularFirestore,
    private router: Router,
    private chatService: ChatService,
  ) {}

  ngAfterViewInit(): void {
  }



  ngOnInit() {
    this.authService.isUserLoggedIn().subscribe(user=>{
      this.loggedInUser = user;
      localStorage.setItem('user', JSON.stringify(this.loggedInUser));
    }, (error: any)=>{
      console.error(error);
      localStorage.setItem('user',JSON.stringify('null'))
    })
    this.route.paramMap.subscribe((params) => {
      const propertyID = params.get('propertyID');
      if (propertyID) {
        this.propertyService.getPropertyById(propertyID).subscribe((property) => {
          if (property) {
            this.selectedProperty = property;
            this.checkIfFavorite(propertyID);
            this.userService.getUserById(property.uploaderID).subscribe((user) => {
              if (user) {
                this.uploaderFullName = `${user.name.firstname} ${user.name.lastname}`;
                this.advertiserImage = user.imageURL as any;
                this.advertiserphoneNumber = user.phoneNumber;
              }
            });
          } else {
            this.selectedProperty = null;
          }
        });
      }
    });
  }

  checkIfFavorite(propertyID: string) {
    if (this.loggedInUser) {
      this.favoritesService.getFavoriteProperties(this.loggedInUser.uid).subscribe(favorites => {
        this.isFavorite = favorites.some(fav => fav.propertyIDs.includes(propertyID));
      });
    }
  }
  toggleFavorite() {
    if (!this.selectedProperty || !this.loggedInUser) return;
  
    const propertyID = this.selectedProperty.propertyID;
    this.favoritesService.getFavoriteProperties(this.loggedInUser.uid)
    .pipe(first())
    .subscribe(favorites => {
      let userFavorites = favorites.find(fav => fav.userID === this.loggedInUser!.uid);
  
      if (!userFavorites) {
        userFavorites = {
          favoriteID: this.afs.createId(),
          userID: this.loggedInUser?.uid as any,
          propertyIDs: []
        };
      }
  
      if (this.isFavorite) {
        userFavorites.propertyIDs = userFavorites.propertyIDs.filter(id => id !== propertyID);
      } else {
        if (!userFavorites.propertyIDs.includes(propertyID)) {
          userFavorites.propertyIDs.push(propertyID);
        }
      }
  
      this.isFavorite = !this.isFavorite;
  
      this.favoritesService.updateFavoriteProperty(userFavorites);
    });
  }
  

  nextImage() {
    if (this.selectedProperty && this.selectedProperty.photos.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.selectedProperty.photos.length;
    }
  }

  previousImage() {
    if (this.selectedProperty && this.selectedProperty.photos.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.selectedProperty.photos.length) % this.selectedProperty.photos.length;
    }
  }

  openMessageDialog(uploaderId: string, propertyId: string) {
    this.chatService.startChatWithUserWithProperty(uploaderId, propertyId);
  }

  viewUserProfile(userId: any) {
    this.router.navigate(['/profile', userId]);
  }  

  goBack() {
    this.location.back();
  }

  setCurrentImage(index: number): void {
    this.currentImageIndex = index;
  }
  showImageOverlay(index: number): void {
    this.currentImageIndex = index;
    this.isImageOverlayVisible = true;
  }

  hideImageOverlay(): void {
    this.isImageOverlayVisible = false;
  }

  showLocationOnMap(address: string): void {
    this.showMap = true;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results: { geometry: { location: any; }; }[], status: string) => {
      if (status == google.maps.GeocoderStatus.OK) {
        const map = new google.maps.Map(this.mapContainer?.nativeElement, {
          center: results[0].geometry.location,
          zoom: 15
        });

        new google.maps.Marker({
          position: results[0].geometry.location,
          map: map
        });
      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  hasImages() {
    return this.selectedProperty && this.selectedProperty.photos && this.selectedProperty.photos.length > 0;
  }

}
