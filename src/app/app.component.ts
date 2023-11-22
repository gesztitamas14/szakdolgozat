import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from './shared/services/auth.service';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  constructor(private router: Router, private authService: AuthService, private mediaObserver: MediaObserver){
    this.isHandset$ = this.mediaObserver.asObservable().pipe(
      map(changes =>
        changes.some(change => change.mqAlias === 'xs' || change.mqAlias === 'sm')
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
}
