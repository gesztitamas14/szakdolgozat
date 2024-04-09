import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, of } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from './shared/services/auth.service';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ChatMessage } from './shared/models/Messages';
import { UserService } from './shared/services/user.service';
import { MessagesService } from './shared/services/messages.service';
import * as firebase from 'firebase/compat';
import { User } from './shared/models/User';
import { ChatService } from './shared/services/chat.service';
import { NotificationService } from './shared/services/notification.service';
import { Notification } from './shared/models/Notifications';
import { AngularFirestore } from '@angular/fire/compat/firestore';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer: ElementRef | undefined;
  page = ""
  isHandset$: Observable<boolean> | any;
  routes: Array<string> = [];
  loggedInUser?: firebase.default.User | null;
  showChat = false;
  messages: ChatMessage[] = [];
  chatPartners: string[] = [];
  selectedPartner: string | null = null;
  newMessage: string = '';
  userCache: { [key: string]: User } = {};
  chatPartnerNames: { [id: string]: string } = {};
  filteredMessages: ChatMessage[] = [];
  showCalculator = false;
  propertyPrice: number | null = null;
  downPayment: number | null = null;
  loanAmount: number | null = null;
  interestRate: number | null = null;
  loanTerm: number | null = null;
  monthlyPayment: number | null = null;
  showEmptyMessage: boolean = false;
  hasUnreadMessages = false;
  lastMessageTime: number | null = null; 
  unreadMessagesMap: Map<string, boolean> = new Map();

  constructor(private changeDetectorRef: ChangeDetectorRef,private afs: AngularFirestore, private notificationService: NotificationService, private chatService: ChatService, private router: Router, private authService: AuthService, private mediaObserver: MediaObserver, private MessagesService: MessagesService, private userService: UserService) {
    this.isHandset$ = this.mediaObserver.asObservable().pipe(
      map(changes =>
        changes.some(change => change.mqAlias === 'xs' || change.mqAlias === 'sm' || change.mqAlias === 'md')
      )
    );
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showCalculator = false;
      }
    });
  }

  ngAfterViewChecked() {
  }


  scrollToBottom(): void {
    try {
      if (this.scrollContainer!== undefined){
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }

  ngOnInit() {
    this.chatService.openChatWithUser.subscribe(userId => {
      this.selectChatPartner(userId);
      this.showChat = true;
    });
    this.chatService.openChatWithUserWithProperty.subscribe(data => {
      this.showChat = true;
      this.selectChatPartner(data.userId);
      if (!this.hasExistingConversation(data.userId)) {
        this.prepopulateMessageWithPropertyLink(data.propertyId);
      }
    });
    this.routes = this.router.config.map(conf => conf.path) as string[];

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((evts: any) => {
      const currentPage = (evts.urlAfterRedirects as string).split('/')[1] as string;
      if (this.routes.includes(currentPage)) {
        this.page = currentPage
      }
    });
    this.authService.isUserLoggedIn().subscribe(user => {
      this.loggedInUser = user;
      localStorage.setItem('user', JSON.stringify(this.loggedInUser));
      if (this.loggedInUser) {
        this.loadMessages();
        this.checkForUnreadMessages();
      }
    }, error => {
      console.error(error);
      localStorage.setItem('user', JSON.stringify('null'))
    })
    this.showEmptyMessage = false;
  }

  toggleCalculator() {
    this.showCalculator = !this.showCalculator;
  }
  isValidForm() {
    return this.propertyPrice! > 0 && this.downPayment! >= 0 &&
      this.loanAmount! >= 0 && this.interestRate! > 0 &&
      this.loanTerm! > 0;
  }
  calculateMonthlyPayment() {
    if (this.isValidForm()) {
      const monthlyInterestRate = this.interestRate! / 100 / 12;
      const numberOfPayments = this.loanTerm! * 12;
      this.monthlyPayment = this.loanAmount! *
        monthlyInterestRate /
        (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
    }
  }

  changePage(selectedPage: string) {
    this.router.navigateByUrl(selectedPage)
  }

  onToggleSidenav(sidenav: MatSidenav) {
    sidenav.toggle();
  }


  onClose(event: any, sidenav: MatSidenav) {
    if (event === true) {
      sidenav.close();
    }
  }

  toggleChat() {
    this.showChat = !this.showChat;
    if (this.loggedInUser && this.showChat) {
      this.notificationService.getNotificationsForUser(this.loggedInUser.uid).subscribe(notifications => {
        const unreadNotificationIds = notifications.filter(notification => notification.type === 'message' && !notification.read)
          .map(notification => notification.id);
        if (unreadNotificationIds.length > 0 && this.showChat) {
          this.notificationService.markNotificationsAsRead(unreadNotificationIds).then(() => {
          }).catch(error => {
          });
        }
      });
    }
  }

  prepopulateMessageWithPropertyLink(propertyId: string) {
    const propertyLink = `localhost:4200/property-details/${propertyId}`;
    this.newMessage = `Érdeklődöm a következő ingatlan iránt: ${propertyLink}.`;
  }
  hasExistingConversation(partnerId: string): boolean {
    return this.messages.some(message =>
      (message.senderId === this.loggedInUser?.uid && message.receiverId === partnerId) ||
      (message.receiverId === this.loggedInUser?.uid && message.senderId === partnerId)
    );
  }

  loadMessages() {
    if (this.loggedInUser?.uid) {
      this.authService.isUserLoggedIn().pipe(
        switchMap(user => {
          if (user) {
            return this.MessagesService.getAllMessages(user.uid);
          } else {
            return of(null);
          }
        })
      ).subscribe(messages => {
        if (messages) {
          this.messages = messages;
          if (this.messages.length === 0) {
            this.showEmptyMessage = true;
          } else {
            this.showEmptyMessage = false;
          }
          this.chatPartners = this.MessagesService.getUniqueChatPartners(messages, this.loggedInUser?.uid as any);
          messages.forEach(msg => {
            this.loadUser(msg.senderId);
            this.loadUser(msg.receiverId);
          });
          this.loadChatPartnerNames();
        }
        this.unreadMessagesMap.clear();
        messages?.forEach(msg => {
          if (msg.receiverId === this.loggedInUser?.uid && !msg.read) {
            this.unreadMessagesMap.set(msg.senderId, true);
          }
        });
      });
    }
  }

  selectChatPartner(partnerId: string) {
    this.selectedPartner = partnerId;
    this.filteredMessages = this.messages.filter(message =>
      message.senderId === partnerId || message.receiverId === partnerId
    );
  
    const unreadMessageIds = this.filteredMessages.filter(message =>
      message.senderId === partnerId &&
      message.receiverId === this.loggedInUser?.uid &&
      !message.read
    ).map(message => message.id);
  
    if (unreadMessageIds.length > 0) {
      this.MessagesService.markMessagesAsRead(unreadMessageIds as any).then(() => {
      }).catch(error => {
      });
    }
  
    this.changeDetectorRef.detectChanges();
    this.scrollToBottom();
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedPartner) {
      const chatMessage: ChatMessage = {
        senderId: this.loggedInUser?.uid as string,
        receiverId: this.selectedPartner,
        message: this.newMessage,
        timestamp: new Date(),
        read: false
      };
      this.MessagesService.sendMessage(chatMessage).then(() => {
        this.newMessage = '';
        this.filteredMessages.push(chatMessage);
        const notificationId = this.afs.createId();

        const notification: Notification = {
          id: notificationId,
          userID: this.selectedPartner as any,
          type: 'message',
          message: 'Új üzeneted érkezett',
          createdAt: new Date(),
          read: false
        };

        this.notificationService.addNotification(notification as any).catch(error => {
        });
      }).catch(error => {
      });
    }
  }

  backToChatPartners() {
    this.selectedPartner = null;
  }
  loadUser(userId: string) {
    if (!this.userCache[userId]) {
      this.userService.getUserById(userId).subscribe(user => {
        if (user) {
          this.userCache[userId] = user;
        }
      });
    }
  }
  loadChatPartnerNames() {
    this.chatPartners.forEach(partnerId => {
      if (!this.userCache[partnerId]) {
        this.userService.getUserById(partnerId).subscribe(user => {
          if (user) {
            this.userCache[partnerId] = user;
            this.chatPartnerNames[partnerId] = `${user.name.firstname} ${user.name.lastname}`;
          }
        });
      } else {
        const user = this.userCache[partnerId];
        this.chatPartnerNames[partnerId] = `${user.name.firstname} ${user.name.lastname}`;
      }
    });
  }

  checkForUnreadMessages() {
    if (this.loggedInUser) {
      this.notificationService.getNotificationsForUser(this.loggedInUser.uid).subscribe(notifications => {
        this.hasUnreadMessages = notifications.some(notification =>
          notification.type === 'message' && !notification.read);
      });
    }
  }


}
