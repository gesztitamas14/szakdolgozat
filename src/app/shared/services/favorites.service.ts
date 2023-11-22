import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { FavoriteProperty } from '../models/Favorites';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private collectionName = 'Favorites';

  constructor(private afs: AngularFirestore) {}

  getFavoriteProperties(userId: string): Observable<FavoriteProperty[]> {
    return this.afs.collection<FavoriteProperty>(this.collectionName, ref => ref.where('userID', '==', userId)).valueChanges();
  }

  addFavoriteProperty(favoriteProperty: FavoriteProperty) {
    const favoriteID = this.afs.createId();
    favoriteProperty.favoriteID = favoriteID;
    return this.afs.collection<FavoriteProperty>(this.collectionName).doc(favoriteID).set(favoriteProperty);
  }

  deleteFavoriteProperty(favoriteID: string) {
    return this.afs.collection<FavoriteProperty>(this.collectionName).doc(favoriteID).delete();
  }

  getFavoritePropertyById(favoriteID: string): Observable<FavoriteProperty | undefined> {
    return this.afs
      .collection<FavoriteProperty>(this.collectionName)
      .doc(favoriteID)
      .valueChanges();
  }

  updateFavoriteProperty(favorite: FavoriteProperty) {
    return this.afs.collection<FavoriteProperty>(this.collectionName).doc(favorite.favoriteID).update(favorite);
  }
}
