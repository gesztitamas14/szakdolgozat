import { Component, OnInit } from '@angular/core';
import { FavoritesService } from '../../shared/services/favorites.service';
import { FavoriteProperty } from '../../shared/models/Favorites';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { Property } from '../../shared/models/Properties';
import { PropertyService } from '../../shared/services/property.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  favoriteProperties: FavoriteProperty[] = [];
  loggedInUser?: firebase.default.User | null;
  favoritePropertyDetails: Property[] = [];

  constructor(private favoritesService: FavoritesService, private router: Router, private authService: AuthService, private userService: UserService, private propertyService: PropertyService) { }

  ngOnInit(): void {
    this.authService.isUserLoggedIn().subscribe(user => {
      this.loggedInUser = user;
      localStorage.setItem('user', JSON.stringify(this.loggedInUser));
      

      if (this.loggedInUser?.uid) {
        this.loadFavoriteProperties();
      }
    }, (error: any) => {
      console.error(error);
      localStorage.setItem('user', JSON.stringify('null'));
    });
  }
  

  loadFavoriteProperties() {
    this.favoritePropertyDetails = [];
    if (this.loggedInUser?.uid) {
      this.favoritesService.getFavoriteProperties(this.loggedInUser.uid).subscribe(favoriteProperties => {
        this.favoriteProperties = favoriteProperties;
        this.favoritePropertyDetails = [];
  
        favoriteProperties.forEach(favoriteProperty => {
          favoriteProperty.propertyIDs.forEach(propertyId => {
            this.propertyService.getPropertyById(propertyId).subscribe(propertyDetail => {
              if (propertyDetail && !this.favoritePropertyDetails.find(p => p.propertyID === propertyDetail.propertyID)) {
                this.favoritePropertyDetails.push(propertyDetail);
              }
            });
          });
        });
      });
    }
  }
  

  viewDetails(propertyId: string) {
      this.router.navigate(['/property-details', propertyId]);
  }

  removeFromFavorites(propertyId: string) {
    if (this.router.url === '/favorites') {
      if (!this.loggedInUser?.uid) {
        console.error('No logged in user.');
        return;
      }
    
      this.favoritesService.getFavoriteProperties(this.loggedInUser.uid).subscribe(favoriteProperties => {
        const existingFavorite = favoriteProperties[0];
    
        if (existingFavorite && existingFavorite.propertyIDs.includes(propertyId)) {
          const updatedPropertyIDs = existingFavorite.propertyIDs.filter(id => id !== propertyId);
          existingFavorite.propertyIDs = updatedPropertyIDs;
          if (this.router.url === '/favorites') {
          this.favoritesService.updateFavoriteProperty(existingFavorite).then(() => {
            //console.log('Property removed from favorites successfully.');
            this.loadFavoriteProperties();
          }).catch((error: any) => {
            console.error('Error updating favorites:', error);
          });
        }
        }
      });
    }
  }
  browseProperties(){
    this.router.navigate(['/main']);
  }
}
