import { HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';
import {
  EMPTY,
  Subject,
  catchError,
  filter,
  finalize,
  forkJoin,
  share,
  shareReplay,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { DisplayInvalidDataErrorAction } from '../../actions/auth/displayInvalidDataError.action';
import { DisplayLoaderAction } from '../../actions/auth/displayLoader.action';
import { DisplayLoginFormAction } from '../../actions/auth/displayLoginForm.action';
import { DisplayUnknownErrorAction } from '../../actions/auth/displayUnknownError.action';
import { GetProductAuthTokenAction } from '../../actions/auth/getLsToken.action';

import { ResetFormValidatorsAction } from '../../actions/auth/resetFormValidators.action';
import { SaveTokenInLsAction } from '../../actions/auth/saveLsToken.action';
import { LoginResponse, SignInByDataAction } from '../../actions/auth/singInByData.action';
import { IAuthAction } from '../../models/action.model';
import {
  IUserAction,
  UserActionService,
} from '../../services/user-action.service';
import { IAuthStrategy } from '../../models/strategy.model';
import { SignUpByDataAction } from '../../actions/auth/singUpByData.action';
import { GoToLoginAction } from '../../actions/auth/goToLogin.action';
import { RemoveProductAuthTokenAction } from '../../actions/auth/removeLsToken.action';
import { InitTokenStrategyAction } from '../../actions/auth/initTokenShareStrategy.action';
import { AskProjectIdsAction } from '../../actions/token-share/askProjectsIds.action';
import { SendAuthDoneEventAction } from '../../actions/auth-done/sendAuthDoneEvent.action';
import { dd } from '../../utilites/dd';
import { GrantAuthAction } from '../../actions/auth/grandAuth.action';
import { ListenGrantAuthAction } from '../../actions/auth-done/listenGrantAuth.action';
import { ListenValidateSharedTokenAction } from '../../actions/auth-done/listenValidateSharedToken.action';
import { SetProductBtnCollapsedAction } from '../../actions/auth-done/setProductBtnCollapsed.action';

@Injectable()
export class AuthAndShareStrategy implements IAuthStrategy {
  private unsubscribe$ = new Subject<void>();

  constructor(
    @Inject(UserActionService)
    private readonly UserActionServ: UserActionService,
    private injector: Injector
  ) {}

  runScenario(scenario: string, payload?: Record<string, string>) {
    switch (scenario) {
      case 'init':
        this.handleInitScenario();
        break;
      default:
        throw new Error(`Unknown ${this.constructor.name} scenario: ${scenario}`);
    }
  }

  handleInitScenario() {
    const auth$ = this.injector
      .get<IAuthAction>(AuthActionMap.get('LISTEN_GRANT_AUTH'))
      .execute()

    const tokenValid$ = this.injector
      .get<IAuthAction>(AuthActionMap.get('LISTEN_VALIDATE_SHARE_TOKEN')) // rename validate?
      .execute()

    forkJoin([auth$, tokenValid$]).subscribe(res => {
      this.injector
        .get<IAuthAction>(AuthActionMap.get('SEND_AUTH_DONE_EVENT'))
        .execute()
      this.injector
        .get<IAuthAction>(AuthActionMap.get('SET_PRODUCT_BTN_COLLAPSED'))
        .execute()
      console.log(9)
    })
  }
}

export const AuthActionMap = new Map<string, any>([
  ['LISTEN_GRANT_AUTH', ListenGrantAuthAction],
  ['LISTEN_VALIDATE_SHARE_TOKEN', ListenValidateSharedTokenAction],
  ['SEND_AUTH_DONE_EVENT', SendAuthDoneEventAction],
  ['SET_PRODUCT_BTN_COLLAPSED', SetProductBtnCollapsedAction]
]);
