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

  removeFromFavoritesHandler(event: MouseEvent, propertyId: string): void {
    event.stopPropagation();
    event.preventDefault();
    this.removeFromFavorites(propertyId);
  }

  removeFromFavorites(propertyId: string) {
    if (!this.loggedInUser?.uid) {
      console.error('No logged in user.');
      return;
    }
    if (this.router.url === '/favorites') {
      this.favoritePropertyDetails = this.favoritePropertyDetails.filter(p => p.propertyID !== propertyId);

      this.favoritesService.getFavoriteProperties(this.loggedInUser.uid).subscribe(favoriteProperties => {
        const existingFavorite = favoriteProperties.find(f => f.propertyIDs.includes(propertyId));

        if (existingFavorite) {
          const updatedPropertyIDs = existingFavorite.propertyIDs.filter(id => id !== propertyId);

          if (updatedPropertyIDs.length === 0 && this.router.url === '/favorites') {
            this.favoritesService.deleteFavoriteProperty(existingFavorite.favoriteID).catch(error => {
              console.error('Error deleting empty favorite:', error);
            });
          } else if(updatedPropertyIDs.length !== 0 && this.router.url === '/favorites') {
            existingFavorite.propertyIDs = updatedPropertyIDs;
            this.favoritesService.updateFavoriteProperty(existingFavorite).catch(error => {
              console.error('Error updating favorites:', error);
            });
          }
        }
      });
    }
  }
  browseProperties() {
    this.router.navigate(['/main']);
  }
  calculatePricePerSqm(price: number, size: number): string {
    return (price / size).toFixed(1);
  }

  calculateRentPrice(price: number) {
    return (price / 1000).toFixed(0);
  }
  formatPrice(price: number): string {
    if (price % 1000000 === 0) {
      return `${price / 1000000}M Ft`;
    } else {
      return `${price} Ft`;
    }
  }
}
