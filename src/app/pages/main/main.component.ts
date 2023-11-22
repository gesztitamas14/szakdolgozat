import { Component, OnInit } from '@angular/core';
import { PropertyService } from '../../shared/services/property.service';
import { Property } from '../../shared/models/Properties';
import { Router } from '@angular/router';
import { FavoritesService } from '../../shared/services/favorites.service';
import { FavoriteProperty } from '../../shared/models/Favorites';
import { UserService } from '../../shared/services/user.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  properties: Property[] = [];
  loggedInUser?: firebase.default.User | null;


  constructor(private afs: AngularFirestore, private propertyService: PropertyService, private router: Router, private favoritesService: FavoritesService, private userService: UserService, private authService: AuthService) { }

  ngOnInit() {
    this.propertyService.getProperties().subscribe(properties => {
      this.properties = properties;
    });
    this.authService.isUserLoggedIn().subscribe(user=>{
      this.loggedInUser = user;
      localStorage.setItem('user', JSON.stringify(this.loggedInUser));
    }, (error: any)=>{
      console.error(error);
      localStorage.setItem('user',JSON.stringify('null'))
    })
  }

  addProperty() {
    const newProperty: Property = {
      propertyID: '',
      address: '',
      price: 0,
      size: 0,
      description: '',
      photos: [],
      features: {
        type: '',
        numberOfRooms: 0,
        numberOfBathrooms: 0,
      },
      status: '',
      uploaderID: '',
      location: '',
    };

    this.propertyService.addProperty(newProperty).then(() => {
      console.log('Property added successfully.');
    }).catch((error: any) => {
      console.error('Error adding property:', error);
    });
  }

  deleteProperty(propertyID: string) {
    this.propertyService.deleteProperty(propertyID).then(() => {
      console.log('Property deleted successfully.');
    }).catch((error: any) => {
      console.error('Error deleting property:', error);
    });
  }

  viewPropertyDetails(propertyID: string) {
    this.router.navigate(['/property-details', propertyID]);
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

  addToFavorites(propertyID: string) {
    if (!this.loggedInUser?.uid) {
      console.error('No logged in user.');
      return;
    }
  
    this.favoritesService.getFavoriteProperties(this.loggedInUser.uid).subscribe(favorites => {
      const existingFavorite = favorites[0]; // Feltételezve, hogy minden felhasználónak legfeljebb egy kedvence van
      if (existingFavorite) {
        if (!existingFavorite.propertyIDs.includes(propertyID)) {
          existingFavorite.propertyIDs.push(propertyID);
          this.favoritesService.updateFavoriteProperty(existingFavorite).then(() => {
            console.log('Property added to existing favorites successfully.');
          }).catch((error: any) => {
            console.error('Error updating favorites:', error);
          });
        }
      } else {
        const newFavorite: FavoriteProperty = {
          favoriteID: this.afs.createId(),
          userID: this.loggedInUser?.uid as any,
          propertyIDs: [propertyID]
        };
  
        this.favoritesService.addFavoriteProperty(newFavorite).then(() => {
          console.log('New favorite created successfully.');
        }).catch(error => {
          console.error('Error creating new favorite:', error);
        });
      }
    });
  }
  
  
}
