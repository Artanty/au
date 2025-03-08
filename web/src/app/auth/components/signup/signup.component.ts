import { Component, Inject, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, filter, map, startWith } from 'rxjs';
import { UserActionService, IUserAction } from '../../services/user-action.service';
import { IViewState, ViewService } from '../../services/view.service';

@Component({
  selector: 'app-signup',
  // standalone: true,
  // imports: [],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit{
  username: string = '';
  password: string = '';
  repeatPassword: string = '';
  passwordsMissmatch: boolean = false

  formMessage$: Observable<IViewState>
  isLoaderVisible$: Observable<boolean>

  routerPath: string = 'login'

  constructor(
    @Inject(UserActionService) private UserActionServ: UserActionService,
    @Inject(ViewService) private ViewServ: ViewService,
    @Inject('ROUTER_PATH') private _routerPath$: BehaviorSubject<string>,
  ) {
    this._routerPath$.asObservable().subscribe((res: string) => {
      this.routerPath = `/${res}/login`
    })
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

  ngOnInit (): void {
    this.username = 'one' + new Date().toUTCString().slice(-10,-3)
    this.password = 'one' + new Date().toUTCString().slice(-10,-3)
    this.repeatPassword = 'one' + new Date().toUTCString().slice(-10,-3)
  }

  onSubmit() {
    this.passwordsMissmatch = !this.passwordsMatch()
    
    if (this.passwordsMissmatch) {
      return;
    }

    const data: IUserAction = {
      action: 'SEND_SIGNUP_REQUEST',
      payload: {
        username: this.username,
        password: this.password
      }
    }
    this.UserActionServ.setUserAction(data)
  }

  passwordsMatch(): boolean {
    return !!this.password.length && this.password === this.repeatPassword;
  }
}
