import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppComponent } from 'src/app/app.component';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, AfterViewInit{

  @Input() currentPage: string='';
  @Input() loggedInUser?: firebase.default.User | null;
  @Output() selectedPage: EventEmitter<string> = new EventEmitter();
  @Output() onCloseSidenav: EventEmitter<boolean> = new EventEmitter();
  @Output() onLogOut: EventEmitter<boolean> = new EventEmitter();;

  constructor(private appComponent: AppComponent){}

  ngOnInit(): void {}
  ngAfterViewInit(): void {}
  
  menuSwitch(){
    this.selectedPage.emit(this.currentPage);
  }

  close(logout?:boolean){
    this.onCloseSidenav.emit(true);
    if (logout===true){
      this.onLogOut.emit(logout)
    }
  }
}
