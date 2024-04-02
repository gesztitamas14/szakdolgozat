import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { arrayUnion, arrayRemove } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class PropertyTypesService {
  private collectionName = 'PropertyTypes';
  private docId = '7f6ay5C7DnQMP7CW0Zdd';

  constructor(private afs: AngularFirestore) { }

  getPropertyTypes(): Observable<any> {
    return this.afs.collection(this.collectionName).doc(this.docId).valueChanges();
  }

  addPropertyType(newType: string): Promise<void> {
    return this.afs.collection(this.collectionName).doc(this.docId).update({
      type: arrayUnion(newType)
    });
  }

  removePropertyType(type: string): Promise<void> {
    return this.afs.collection(this.collectionName).doc(this.docId).update({
      type: arrayRemove(type)
    });
  }
}
