import { ChangeDetectorRef, Component, Inject, Injector, OnInit } from '@angular/core';

import { BehaviorSubject, Observable, filter, map, startWith, tap, pipe, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IAuthAction } from '../../models/action.model';
import { AuthActionMap } from '../../strategies/auth/backend-auth.strategy';
import { GetProvidersRes, GetProvidersResItem } from './models';
import { LoginService } from './login.service';
import { dd } from '../../utilites/dd';
import { AppStateService, getInnerBusEventFlow, UserAction, ViewState } from '../../services/app-state.service';


@Component({
  selector: 'app-login2',
  templateUrl: './login2.component.html',
  styleUrl: './login2.component.scss',

})
export class Login2Component implements OnInit {
  // username: string = '';
  _username$: BehaviorSubject<string> = new BehaviorSubject('цвц');
  get username$() {
    return this._username$.getValue()
  }
  password: string = '';
  provider: any = null
  isExternalProviderType: boolean = false

  formMessage$: Observable<ViewState>
  isLoaderVisible$: Observable<boolean>
  providers$: Observable<GetProvidersResItem[]>

  routerPath: string = '/au/signup'

  public providerTypeOnChange(data: any) {
    this.isExternalProviderType = data
    setTimeout(() => {
      this.mock(data)
    }, 200)
  }

  public providerOnChange(data: any) {
    this.provider = data
    this.mock()
  }

  public loginOnChange(data: any) {
    console.log(data)
  }

  public passwordOnChange(data: any) {
    console.log(data)
  }

  private _valueChange(data: any) {
    console.log(data)
  }

  constructor(
    @Inject(HttpClient) private readonly http: HttpClient,
    private injector: Injector,
    private _loginService: LoginService,
    private _cdr: ChangeDetectorRef,
    private _appStateService: AppStateService
  ) {
    this.formMessage$ = this._appStateService.view.listen
      .pipe(
        filter(Boolean),
        filter((res: ViewState) => res.scope === 'FORM'),
      )

    this.isLoaderVisible$ = this._appStateService.view.listen
      .pipe(
        filter(Boolean),
        filter(res => res.scope === 'VIEW' && res.action === 'DISPLAY_LOADER'),
        map((res: any) => res.payload.isVisible),
        startWith(false),
      )
    this.providers$ = this._loginService.getProviders().pipe(
      tap(res => {
        if (res.length) {
          this.provider = res[0].id
        }
      })
    )
  }

  ngOnInit(): void {
    this.mock(true)
  }

  private mock(isExternal?: boolean) {
    console.log(isExternal)
    if (isExternal) {
      this._username$.next('test.user@company.com')
      
      // this._username$.next('michael.scott@dundermifflin.com')
      // this.username = 'michael.scott@dundermifflin.com'
      this.password = 'testpassword123' 
    } else {
      this._username$.next('john@example.com2')
      // this.username = 'john@example.com2' 
      this.password = 'password123'  
    }
    this._cdr.detectChanges()
  }

  register() {
    const user = { username: 'john', password: 'password123' };
    const urlBase = `${process.env['AU_BACK_URL']}/auth-cookies`
    this.http.post(`${urlBase}/register`, user).subscribe();
  }

  onLogin() {
    
    console.log('onLogin')
    const data: UserAction = {
      ...getInnerBusEventFlow(),
      event: 'SEND_LOGIN_REQUEST',
      payload: {
        username: this._username$.getValue(),
        password: this.password,
        provider: this.isExternalProviderType && this.provider ? this.provider : undefined
      },
        
    }
    dd(data)
    this._appStateService.userAction.next(data)
    // this.UserActionServ.setUserAction(data)
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
