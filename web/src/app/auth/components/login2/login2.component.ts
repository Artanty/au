import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { IUserAction, UserActionService } from '../../services/user-action.service';
import { IViewState, ViewService } from '../../services/view.service';
import { BehaviorSubject, Observable, filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-login2',
  templateUrl: './login2.component.html',
  styleUrl: './login2.component.scss'
})
export class Login2Component {
  username: string = '';
  password: string = '';

  formMessage$: Observable<IViewState>
  isLoaderVisible$: Observable<boolean>

  routerPath: string = ''


  constructor(
    @Inject(UserActionService) private UserActionServ: UserActionService,
    @Inject(ViewService) private ViewServ: ViewService,
    @Inject('ROUTER_PATH') private _routerPath$: BehaviorSubject<string>,
    ) {
      this._routerPath$.asObservable().subscribe((res: string) => {
        this.routerPath = `/${res}/signup`
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

  onLogin() {
    const data: IUserAction = {
      action: 'SEND_LOGIN_REQUEST',
      payload: {
        username: this.username,
        password: this.password
      }
    }
    this.UserActionServ.setUserAction(data)
  }
}
