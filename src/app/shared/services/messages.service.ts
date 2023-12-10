import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ChatMessage } from '../models/Messages';
import { Observable, combineLatest, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  constructor(private afs: AngularFirestore) {}
  collectionName = 'Messages';

  sendMessage(chatMessage: ChatMessage) {
    const id = this.afs.createId();
    chatMessage.id = id;
    return this.afs.collection<ChatMessage>(this.collectionName).doc(id).set(chatMessage);
  }

  getAllMessages(userId: string): Observable<ChatMessage[]> {
    let receivedMessages = this.afs.collection<ChatMessage>(this.collectionName, ref =>
      ref.where('receiverId', '==', userId))
      .valueChanges();
  
    let sentMessages = this.afs.collection<ChatMessage>(this.collectionName, ref =>
      ref.where('senderId', '==', userId))
      .valueChanges();
  
    return combineLatest([receivedMessages, sentMessages]).pipe(
      map(([received, sent]) => [...received, ...sent].sort((a, b) => a.timestamp as any - (b.timestamp as any)))
    );
  }
  
  

  getUniqueChatPartners(messages: ChatMessage[], currentUserId: string): string[] {
    const partnerIds = new Set<string>();
    messages.forEach(message => {
      if (message.senderId !== currentUserId) {
        partnerIds.add(message.senderId);
      }
      if (message.receiverId !== currentUserId) {
        partnerIds.add(message.receiverId);
      }
    });
    return Array.from(partnerIds);
  }
  
}