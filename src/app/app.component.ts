import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from './shared/services/auth.service';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatMessage } from './shared/models/Messages';
import { UserService } from './shared/services/user.service';
import { MessagesService } from './shared/services/messages.service';
import * as firebase from 'firebase/compat';
import { User } from './shared/models/User';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  page=""
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
  


  constructor(private router: Router, private authService: AuthService, private mediaObserver: MediaObserver, private MessagesService: MessagesService, private userService: UserService){
    this.isHandset$ = this.mediaObserver.asObservable().pipe(
      map(changes =>
        changes.some(change => change.mqAlias === 'xs' || change.mqAlias === 'sm' || change.mqAlias === 'md')
      )
    );
  }

  ngOnInit(){
    this.routes = this.router.config.map(conf => conf.path) as string[];

    this.router.events.pipe(filter(event=> event instanceof NavigationEnd)).subscribe((evts: any) =>{
      const currentPage = (evts.urlAfterRedirects as string).split('/')[1] as string;
      if(this.routes.includes(currentPage)){
        this.page=currentPage
      }
    });
    this.authService.isUserLoggedIn().subscribe(user=>{
      this.loggedInUser = user;
      localStorage.setItem('user', JSON.stringify(this.loggedInUser));
      if (this.loggedInUser) {
        this.loadMessages();
      }
    }, error=>{
      console.error(error);
      localStorage.setItem('user',JSON.stringify('null'))
    })
  }
  changePage(selectedPage: string){
    this.router.navigateByUrl(selectedPage)
  }

  onToggleSidenav(sidenav: MatSidenav){
    sidenav.toggle();
  }

  onClose(event: any, sidenav: MatSidenav){
    if (event===true){
      sidenav.close();
    }
  }

  logout(_?:boolean){
    this.authService.logout().then(()=>{
      console.log('Logged out successfully.');
    }).catch(error=>{
      console.error(error);
    });
  }
  toggleChat() {
    this.showChat = !this.showChat;
  }
  
  loadMessages() {
    if (this.loggedInUser?.uid) {
      this.MessagesService.getAllMessages(this.loggedInUser.uid).subscribe(messages => {
        this.messages = messages;
        this.chatPartners = this.MessagesService.getUniqueChatPartners(messages, this.loggedInUser?.uid as any);
        messages.forEach(msg => {
          this.loadUser(msg.senderId);
          this.loadUser(msg.receiverId);
        });
        this.loadChatPartnerNames();
      });
    }
  }
  
  selectChatPartner(partnerId: string) {
    this.selectedPartner = partnerId;
    this.filteredMessages = this.messages.filter(message =>
      message.senderId === partnerId || message.receiverId === partnerId
    );
  }
  sendMessage() {
    if (this.newMessage.trim() && this.selectedPartner) {
      const chatMessage: ChatMessage = {
        senderId: this.loggedInUser?.uid as string,
        receiverId: this.selectedPartner,
        message: this.newMessage,
        timestamp: new Date()
      };
      this.MessagesService.sendMessage(chatMessage).then(() => {
        this.newMessage = '';
        this.filteredMessages.push(chatMessage);
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

  
}
