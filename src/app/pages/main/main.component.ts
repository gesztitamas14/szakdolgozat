import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PropertyService } from '../../shared/services/property.service';
import { Property } from '../../shared/models/Properties';
import { Router } from '@angular/router';
import { FavoritesService } from '../../shared/services/favorites.service';
import { FavoriteProperty } from '../../shared/models/Favorites';
import { UserService } from '../../shared/services/user.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { first, map } from 'rxjs/operators';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MainComponent implements OnInit {
  properties: Property[] = [];
  loggedInUser?: firebase.default.User | null;
  favoritePropertyIDs: string[] = [];
  filteredProperties: Property[] = [];
  searchTerm: string = '';
  propertyStatus: string = '';
  leftColumnProperties: Property[] = [];
  rightColumnProperties: Property[] = [];
  filteredCities: string[] = [];
  allCities: string[] = [];
  userProperties: string[] = [];

  constructor(private afs: AngularFirestore, private propertyService: PropertyService, private router: Router, private favoritesService: FavoritesService, private userService: UserService, private authService: AuthService) { }

  ngOnInit() {
    this.authService.isUserLoggedIn().subscribe(user=>{
      this.loggedInUser = user;
      localStorage.setItem('user', JSON.stringify(this.loggedInUser));
      if (this.loggedInUser?.uid) {
        this.loadUserProperties();
        this.favoritesService.getFavoriteProperties(this.loggedInUser.uid).subscribe(favorites => {
          this.favoritePropertyIDs = favorites.length > 0 ? favorites[0].propertyIDs : [];
        });
      }
    }, (error: any)=>{
      console.error(error);
      localStorage.setItem('user',JSON.stringify('null'))
    })
    this.loadProperties();
  }

  loadUserProperties() {
    if (this.loggedInUser?.uid) {
      this.propertyService.getUserProperties(this.loggedInUser.uid)
        .subscribe(properties => {
          this.userProperties = properties.map(p => p.uploaderID);
          console.log(this.userProperties);
          this.applyFilter();
        });
    }
  }
  divideProperties() {
    this.leftColumnProperties = this.filteredProperties.filter((_, index) => index % 2 === 0);
    this.rightColumnProperties = this.filteredProperties.filter((_, index) => index % 2 === 1);
  }


  onSearchTermChange() {
    if (!this.searchTerm) {
      this.loadProperties();
      this.filteredCities = this.allCities.slice(0, 5); // Korlátozza az elemek számát 5-re
    } else {
      this.filteredCities = this.allCities.filter(city =>
        city.toLowerCase().includes(this.searchTerm.toLowerCase())
      ).slice(0, 5); // Csak az első 5 találatot mutatja
  
      // Alkalmazza a szűrést a keresési feltétel alapján
      this.applyFilter();
      this.divideProperties();
    }
  }  
  

  loadProperties() {
    this.propertyService.getProperties().subscribe(properties => {
      this.properties = properties;
      this.filteredProperties = properties;
      this.divideProperties();
  
      // Összegyűjti az összes várost
      const cities = properties.map(property => property.location);
      this.allCities = Array.from(new Set(cities)); // Eltávolítja a duplikátumokat
    });
  }

    // Keresési feltétel alapján szűri a tulajdonságokat
    searchProperties() {
      this.applyFilter();
      this.divideProperties();
    }
  
    applyFilter() {
      this.filteredProperties = this.properties.filter(property => {
        return (!this.userProperties.includes(property.uploaderID)) && // Kizárja a felhasználó saját ingatlanjait
               (!this.searchTerm || property.location.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
               (!this.propertyStatus || property.status === this.propertyStatus);
      });
      this.divideProperties();
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

  calculateRentPrice(price: number){
    return (price / 1000).toFixed(0);
  }

  addToFavorites(propertyID: string) {
    if (!this.loggedInUser?.uid) {
      console.error('No logged in user.');
      return;
    }

    if (this.favoritePropertyIDs.includes(propertyID)) {
      console.log('Property is already in favorites.');
      return;
    }
  
    this.favoritePropertyIDs.push(propertyID);
    console.log(this.favoritePropertyIDs)


    if (this.router.url === '/main') {
      this.favoritesService.getFavoriteProperties(this.loggedInUser.uid)
      .pipe(first())
      .subscribe(favorites => {
      let userFavorites = favorites.find(fav => fav.userID === this.loggedInUser!.uid);
        let existingFavorites = favorites[0];
        
        if (existingFavorites) {
          existingFavorites.propertyIDs.push(propertyID);
          this.favoritesService.updateFavoriteProperty(existingFavorites).then(() => {
            console.log('Property added to existing favorites successfully.');
          }).catch((error: any) => {
            console.error('Error updating favorites:', error);
            this.favoritePropertyIDs.pop();
          });
        } else {
          console.log("asdads")
          const newFavorite: FavoriteProperty = {
            favoriteID: this.afs.createId(),
            userID: this.loggedInUser?.uid as any,
            propertyIDs: [propertyID]
          };
    
          this.favoritesService.addFavoriteProperty(newFavorite).then(() => {
            console.log('New favorite created successfully.');
          }).catch(error => {
            console.error('Error creating new favorite:', error);
            this.favoritePropertyIDs.pop();
          });
        }
      });
  }
  }
  isFavorite(propertyID: string): boolean {
    return this.favoritePropertyIDs.includes(propertyID);
  }

  
}
