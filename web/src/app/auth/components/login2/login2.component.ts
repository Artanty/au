import { ChangeDetectorRef, Component, Inject, Injector, OnInit } from '@angular/core';
import { IUserAction, UserActionService } from '../../services/user-action.service';
import { IViewState, ViewService } from '../../services/view.service';
import { BehaviorSubject, Observable, filter, map, startWith } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IAuthAction } from '../../models/action.model';
import { AuthActionMap } from '../../strategies/auth/backend-auth.strategy';

@Component({
  selector: 'app-login2',
  templateUrl: './login2.component.html',
  styleUrl: './login2.component.scss'
})
export class Login2Component implements OnInit {
  username: string = '';
  password: string = '';

  formMessage$: Observable<IViewState>
  isLoaderVisible$: Observable<boolean>

  routerPath: string = ''


  constructor(
    @Inject(UserActionService) private UserActionServ: UserActionService,
    @Inject(ViewService) private ViewServ: ViewService,
    @Inject(HttpClient) private readonly http: HttpClient,
    private injector: Injector
  ) {
    this.formMessage$ = this.ViewServ.listenViewState()
      .pipe(
        filter(Boolean),
        filter((res: IViewState) => res.scope === 'FORM'),
      )

    this.isLoaderVisible$ = this.ViewServ.listenViewState()
      .pipe(
        filter(Boolean),
        filter(res => res.scope === 'VIEW' && res.action === 'DISPLAY_LOADER'),
        map((res: any) => res.payload.isVisible),
        startWith(false),
      )
  }

  ngOnInit(): void {
    this.mock()
  }

  private mock() {
    this.username = 'john@example.com2'
    this.password = 'password123'
  }

  register() {
    const user = { username: 'john', password: 'password123' };
    const urlBase = `${process.env['AU_BACK_URL']}/auth-cookies`
    this.http.post(`${urlBase}/register`, user).subscribe();
  }

  onLogin() {
    const data: IUserAction = {
      action: 'SEND_LOGIN_REQUEST',
      payload: {
        username: this.username,
        password: this.password,

      }
    }
    this.UserActionServ.setUserAction(data)
  }
  
  profile() {
    const token = localStorage.getItem(`faq@web-host__accessToken`);
    console.log(token)
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.http.post('http://localhost:3204/auth-token/profile', null, { headers })
      .subscribe(res => {
        console.log(res)
      })
  }

  logOut() {
    const refreshToken = localStorage.getItem(`faq@web-host__refreshToken`);
    console.log(refreshToken)
    this.http.post('http://localhost:3204/auth-token/logout', { refreshToken }).subscribe(res => {
      this.injector
        .get<IAuthAction>(AuthActionMap.get('REMOVE_TOKEN'))
        .execute();
    })
  }
}
