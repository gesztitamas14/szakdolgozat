import { Injectable } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import { User } from '../models/User';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private afs: AngularFirestore) { }

  collectionName = 'Users';

  //CRUD
  create(user:User){
    return this.afs.collection<User>(this.collectionName).doc(user.id).set(user);
  }

  getAll(){

  }

  update(){

  }

  delete(){

  }
  getUserById(userID: string): Observable<User | undefined> {
    return this.afs
      .collection<User>(this.collectionName, (ref) =>
        ref.where('id', '==', userID)
      )
      .valueChanges()
      .pipe(
        // Az első elemet választjuk ki, vagy undefined-t adunk vissza, ha nincs találat
        map((users:any) => (users.length > 0 ? users[0] : undefined))
      );
  }
}