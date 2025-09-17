import { Component, Inject, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, filter, map, startWith } from 'rxjs';
import { AppStateService, getInnerBusEventFlow, UserAction, ViewState } from '../../services/app-state.service';

@Component({
  selector: 'app-signup',
  // standalone: true,
  // imports: [],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
  username: string = '';
  password: string = '';
  repeatPassword: string = '';
  passwordsMissmatch: boolean = false

  formMessage$: Observable<ViewState>
  isLoaderVisible$: Observable<boolean>

  routerPath: string = 'login'

  constructor(
    @Inject('ROUTER_PATH') private _routerPath$: BehaviorSubject<string>,
    private _appStateService: AppStateService
  ) {
    this._routerPath$.asObservable().subscribe((res: string) => {
      this.routerPath = `/${res}/login`
    })
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
  }

  ngOnInit(): void {
    this.username = 'one' + new Date().toUTCString().slice(-10, -3)
    this.password = 'one' + new Date().toUTCString().slice(-10, -3)
    this.repeatPassword = 'one' + new Date().toUTCString().slice(-10, -3)
  }

  onSubmit() {
    this.passwordsMissmatch = !this.passwordsMatch()
    
    if (this.passwordsMissmatch) {
      return;
    }

    const data: UserAction = {
      ...getInnerBusEventFlow(),
      event: 'SEND_SIGNUP_REQUEST',
      payload: {
        username: this.username,
        password: this.password
      }
    }
    this._appStateService.userAction.next(data)
  }

  passwordsMatch(): boolean {
    return !!this.password.length && this.password === this.repeatPassword;
  }
}
