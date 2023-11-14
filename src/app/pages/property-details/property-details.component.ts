import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../shared/services/property.service';
import { Property } from '../../shared/models/Properties';
import { Location } from '@angular/common';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-property-details',
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.css']
})
export class PropertyDetailsComponent implements OnInit {
  selectedProperty: Property | null = null;
  uploaderFullName: string | null = null;


  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const propertyID = params.get('propertyID');
      if (propertyID) {
        this.propertyService.getPropertyById(propertyID).subscribe((property) => {
          if (property) {
            this.selectedProperty = property;
            this.userService.getUserById(property.uploaderID).subscribe((user) => {
              if (user) {
                this.uploaderFullName = `${user.name.firstname} ${user.name.lastname}`; // Teljes név létrehozása
              }
            });
          } else {
            this.selectedProperty = null;
          }
        });
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
