import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Notification } from '../models/Notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private collectionName = 'Notifications';

  constructor(private afs: AngularFirestore) { }

  getNotificationsForUser(userId: string): Observable<Notification[]> {
    return this.afs.collection<Notification>(this.collectionName, ref => 
      ref.where('userID', '==', userId)).valueChanges();
  }

  addNotification(notification: Notification): Promise<void> {
    return this.afs.collection<Notification>(this.collectionName).doc(notification.id).set(notification);
  }

  markNotificationsAsRead(notificationIds: string[]): Promise<void> {
    const batch = this.afs.firestore.batch();
  
    notificationIds.forEach(notificationId => {
      const notificationRef = this.afs.collection<Notification>(this.collectionName).doc(notificationId).ref;
      batch.update(notificationRef, { read: true });
    });
  
    return batch.commit();
  }
}
