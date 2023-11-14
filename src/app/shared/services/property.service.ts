import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Property } from '../models/Properties';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  collectionName = 'Properties';


  constructor(private afs: AngularFirestore) { }

  getProperties() {
    return this.afs.collection<Property>(this.collectionName).valueChanges();
  }

  addProperty(property: Property) {
    property.propertyID = this.afs.createId();
    return this.afs.collection<Property>(this.collectionName).doc(property.propertyID).set(property);
  }

  deleteProperty(propertyID: string) {
    return this.afs.collection<Property>(this.collectionName).doc(propertyID).delete();
  }
  getPropertyById(propertyID: string): Observable<Property | undefined> {
    return this.afs
      .collection<Property>(this.collectionName)
      .doc(propertyID)
      .valueChanges();
  }
}
