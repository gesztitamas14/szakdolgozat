import { Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { PropertyService } from '../../shared/services/property.service';
import { Property } from '../../shared/models/Properties';
import { Router } from '@angular/router';
import { FavoritesService } from '../../shared/services/favorites.service';
import { FavoriteProperty } from '../../shared/models/Favorites';
import { UserService } from '../../shared/services/user.service';
import { AuthService } from '../../shared/services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { first, map } from 'rxjs/operators';
import { CeilPipe } from '../../shared/pipes/ceil.pipe';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PropertyTypesService } from '../../shared/services/property-types.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MainComponent implements OnInit {
  @ViewChild('additionalFiltersTemplate') additionalFiltersTemplate: TemplateRef<any> | undefined;
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
  pageSize: number = 2;
  paginatedProperties: any[] | undefined;
  currentPage: number = 1;
  totalPages: number = 0;
  userNameToIdMap: Map<string, string> = new Map();
  userNameSearchTerm: string = '';
  allUserFullNames: string[] = [];
  filteredUserNames: string[] = [];
  selectedUserId: string | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  locationFilter: string = '';
  filterApartment: boolean = false;
  filterHouse: boolean = false;
  minSize: number | null = null;
  maxSize: number | null = null;
  numberOfRooms: number | null = null;
  dialogRef: MatDialogRef<any> | null = null;
  propertyTypes: string[] = [];
  selectedPropertyTypes: { [key: string]: boolean } = {};

  constructor(private propertyTypesService: PropertyTypesService, private dialog: MatDialog, private afs: AngularFirestore, private propertyService: PropertyService, private router: Router, private favoritesService: FavoritesService, private userService: UserService, private authService: AuthService) { }

  ngOnInit() {
    this.currentPage = 1;
    this.authService.isUserLoggedIn().subscribe(user => {
      this.loggedInUser = user;
      localStorage.setItem('user', JSON.stringify(this.loggedInUser));
      if (this.loggedInUser?.uid) {
        this.loadUserProperties();
        this.favoritesService.getFavoriteProperties(this.loggedInUser.uid).subscribe(favorites => {
          this.favoritePropertyIDs = favorites.length > 0 ? favorites[0].propertyIDs : [];
        });
      }
    }, (error: any) => {
      console.error(error);
      localStorage.setItem('user', JSON.stringify('null'))
    })
    this.loadProperties();
    this.userService.getAll().subscribe(users => {
      users.forEach(user => {
        const fullName = `${user.name.firstname} ${user.name.lastname}`;
        this.allUserFullNames.push(fullName);
        this.userNameToIdMap.set(fullName.toLowerCase(), user.id);
      });
    });
    this.propertyTypesService.getPropertyTypes().subscribe(data => {
      if (data && data.type) {
        this.propertyTypes = data.type;
      }
    });
  }
  onUserNameSearchTermChange() {
    if (this.userNameSearchTerm.trim() === '') {
      this.selectedUserId = null;
      this.filteredUserNames = [];
    } else {

      this.filteredUserNames = this.allUserFullNames.filter(name => {
        const userId = this.userNameToIdMap.get(name.toLowerCase());
        const isNotLoggedInUser = userId !== this.loggedInUser?.uid;
        const matchesSearchTerm = name.toLowerCase().includes(this.userNameSearchTerm.toLowerCase().trim());
        return isNotLoggedInUser && matchesSearchTerm;
      });
    }

    this.applyFilter();
  }
  onUserSelected(event: any) {
    const userName = event.option.value;
    const userId = this.userNameToIdMap.get(userName.toLowerCase());
    if (userId) {
      this.selectedUserId = userId;
      this.applyFilter();
    }
  }

  loadUserProperties() {
    if (this.loggedInUser?.uid) {
      this.propertyService.getUserProperties(this.loggedInUser.uid)
        .subscribe(properties => {
          this.userProperties = properties.map(p => p.uploaderID);
          this.applyFilter();
        });
    }
  }
  divideProperties() {
    this.leftColumnProperties = this.filteredProperties.filter((_, index) => index % 2 === 0);
    this.rightColumnProperties = this.filteredProperties.filter((_, index) => index % 2 === 1);
  }
  fetchProperties(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.filteredProperties.length);
    const currentProperties = this.filteredProperties.slice(startIndex, endIndex);

    this.leftColumnProperties = currentProperties.filter((_, index) => index % 2 === 0);
    this.rightColumnProperties = currentProperties.filter((_, index) => index % 2 === 1);
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

      const cities = properties.map(property => property.location);
      this.allCities = Array.from(new Set(cities));

      this.userNameSearchTerm = '';
      this.filteredUserNames = [];
      this.applyFilter();
    });
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchProperties();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchProperties();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchProperties();
    }
  }


  searchProperties() {
    this.applyFilter();
    this.divideProperties();
  }

  applyFilter() {
    this.filteredProperties = this.properties.filter(property => {
      const matchesType = !Object.keys(this.selectedPropertyTypes).length || 
      (this.selectedPropertyTypes[property.features.type]);;

      const matchesSize =
        (this.minSize == null || property.size >= this.minSize) &&
        (this.maxSize == null || property.size <= this.maxSize);
      const matchesRooms =
        this.numberOfRooms == null || property.features.numberOfRooms >= this.numberOfRooms;
      const matchesLocation = !this.searchTerm || property.location.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.propertyStatus || property.status === this.propertyStatus;
      const matchesPrice = (this.minPrice == null || property.price >= this.minPrice) &&
        (this.maxPrice == null || property.price <= this.maxPrice);

      const matchesLocationFilter = !this.locationFilter ||
        (this.locationFilter === 'Budapest' && property.location.toLowerCase().includes('budapest')) ||
        (this.locationFilter === 'Vidék' && !property.location.toLowerCase().includes('budapest'));
      let matchesUser = true;
      if (this.selectedUserId) {
        matchesUser = property.uploaderID === this.selectedUserId;
      } else if (this.loggedInUser?.uid) {
        matchesUser = property.uploaderID !== this.loggedInUser.uid;
      }
      return matchesLocation && matchesStatus && matchesPrice && matchesUser && matchesLocationFilter && matchesType && matchesSize && matchesRooms;
    });
    this.totalPages = Math.ceil(this.filteredProperties.length / this.pageSize);
    this.currentPage = 1; // Reset to first page
    this.fetchProperties();
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

  calculateRentPrice(price: number) {
    return (price / 1000).toFixed(0);
  }

  addToFavorites(event: Event, propertyID: string) {
    event.stopPropagation();
    if (!this.loggedInUser?.uid) {
      return;
    }

    if (this.isFavorite(propertyID)) {
      return;
    }

    this.favoritePropertyIDs.push(propertyID);

    this.favoritesService.getFavoriteProperties(this.loggedInUser.uid)
      .pipe(first())
      .subscribe(favorites => {
        let existingFavorites = favorites.find(fav => fav.userID === this.loggedInUser?.uid);

        if (existingFavorites) {
          existingFavorites.propertyIDs.push(propertyID);
          this.favoritesService.updateFavoriteProperty(existingFavorites).catch((error: any) => {
            console.error('Error updating favorites:', error);
            this.favoritePropertyIDs.pop();
          });
        } else {
          const newFavorite: FavoriteProperty = {
            favoriteID: this.afs.createId(),
            userID: this.loggedInUser?.uid as any,
            propertyIDs: [propertyID]
          };

          this.favoritesService.addFavoriteProperty(newFavorite).then(() => {
            this.favoritePropertyIDs.push(propertyID);
          }).catch(error => {
            console.error('Error creating new favorite:', error);
            this.favoritePropertyIDs.pop();
          });
        }
      });
  }

  isFavorite(propertyID: string): boolean {
    return this.favoritePropertyIDs.includes(propertyID);
  }

  openAdditionalFilters(): void {
    this.dialogRef = this.dialog.open(this.additionalFiltersTemplate as any, {
      panelClass: 'custom-dialog-container'
    });
  }
  applyAndClose() {
    this.applyFilter();
    this.dialogRef?.close();
  }
}
