import { Injectable, EventEmitter } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ChatService {
  openChatWithUser = new EventEmitter<string>();
  openChatWithUserWithProperty = new EventEmitter<{ userId: string, propertyId: string }>();


  constructor() {}

  startChatWithUser(userId: string) {
    this.openChatWithUser.emit(userId);
  }
  startChatWithUserWithProperty(userId: string, propertyId: string) {
    this.openChatWithUserWithProperty.emit({ userId, propertyId });
  }
}
