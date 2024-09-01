import { Inject, Injectable, Injector } from '@angular/core';
import { IAuthStrategy } from '../auth-strategy.model';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Subject, catchError, filter, finalize, takeUntil, tap } from 'rxjs';
import { IUserAction, UserActionService } from '../../services/user-action.service';
import { DisplayInvalidDataErrorAction } from '../../auth-action/actions/displayInvalidDataError.action';
import { DisplayLoaderAction } from '../../auth-action/actions/displayLoader.action';
import { DisplayLoginFormAction } from '../../auth-action/actions/displayLoginForm.action';
import { DisplayUnknownErrorAction } from '../../auth-action/actions/displayUnknownError.action';
import { GetProductAuthTokenAction } from '../../auth-action/actions/getLsToken.action';
import { ResetFormValidatorsAction } from '../../auth-action/actions/resetFormValidators.action';
import { SaveTokenInLsAction } from '../../auth-action/actions/saveLsToken.action';
import { SignInByDataAction } from '../../auth-action/actions/singInByData.action';
import { IAuthAction } from '../../auth-action/auth-action.model';
import { GrantAccessAction } from '../../auth-action/actions/grantAccess.action';

@Injectable()
export class BackendAuthStrategy implements IAuthStrategy {

  private unsubscribe$ = new Subject<void>();

  constructor(
    @Inject(UserActionService) private readonly UserActionServ: UserActionService,
    private injector: Injector
  ) {
    console.log('inited strategy')
    this.UserActionServ.listenUserAction()
    .pipe(
      takeUntil(this.unsubscribe$),
      filter(Boolean)
    )
    .subscribe((res: IUserAction) => {
      console.log(99)
      this.runScenario(res?.action, res?.payload as any)
    })
  }

  runScenario(scenario: string, payload?: Record<string, string>) {
    switch (scenario) {
      case 'init':
        this.handleInitScenario()
        break;
      case 'SEND_LOGIN_REQUEST':
        this.handleSendLoginRequest()
        break;
      default:
        throw new Error(`Unknown authentication scenario: ${scenario}`);
    }
  }

  handleInitScenario () {
    const token = this.injector.get<IAuthAction>(AuthActionMap.get('getToken')).execute()
    if (token) {
      this.injector.get<IAuthAction>(AuthActionMap.get('GRANT_ACCESS')).execute();
    } else {
      this.injector.get<IAuthAction>(AuthActionMap.get('displayLoginForm')).execute()
    }
  }

  handleSendLoginRequest(){
    this.injector.get<IAuthAction>(AuthActionMap.get('RESET_FORM_VALIDATORS')).execute();
    this.injector.get<IAuthAction>(AuthActionMap.get('DISPLAY_LOADER')).execute(true)
    this.injector.get<IAuthAction>(AuthActionMap.get('SIGN_IN_BY_DATA')).execute()
    .pipe(
      takeUntil(this.unsubscribe$),
      tap((response: { token: string }) => {
        this.injector.get<IAuthAction>(AuthActionMap.get('SAVE_TOKEN_IN_LS')).execute(response.token)
        this.injector.get<IAuthAction>(AuthActionMap.get('GRANT_ACCESS')).execute();
      }),
      catchError((err: HttpErrorResponse) => {
        this.catchResponseError(err)
        return EMPTY
      }),
      finalize(() => {
        this.injector.get<IAuthAction>(AuthActionMap.get('DISPLAY_LOADER')).execute(false);
      })
    ).subscribe()
  }

  catchResponseError (err: HttpErrorResponse) {
    if (err.status === 401) {
      this.injector.get<IAuthAction>(AuthActionMap.get('SHOW_AUTH_ERROR')).execute(err)
    } else {
      this.injector.get<IAuthAction>(AuthActionMap.get('SHOW_UNKNOWN_ERROR')).execute(err)
    }
  }
}

export const AuthActionMap = new Map<string, any>([
  ['getToken', GetProductAuthTokenAction],
  ['displayLoginForm', DisplayLoginFormAction],
  ['SIGN_IN_BY_DATA', SignInByDataAction],
  ['SAVE_TOKEN_IN_LS', SaveTokenInLsAction],
  ['SHOW_AUTH_ERROR', DisplayInvalidDataErrorAction],
  ['SHOW_UNKNOWN_ERROR', DisplayUnknownErrorAction],
  ['DISPLAY_LOADER', DisplayLoaderAction],
  ['RESET_FORM_VALIDATORS', ResetFormValidatorsAction],
  ['GRANT_ACCESS', GrantAccessAction]
])
