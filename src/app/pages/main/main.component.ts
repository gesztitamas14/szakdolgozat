import { Component, OnInit } from '@angular/core';
import { PropertyService } from '../../shared/services/property.service';
import { Property } from '../../shared/models/Properties';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  properties: Property[] = [];

  constructor(private propertyService: PropertyService, private router: Router) { }

  ngOnInit() {
    this.propertyService.getProperties().subscribe(properties => {
      this.properties = properties;
    });
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
}
