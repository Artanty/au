import { HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';
import {
  EMPTY,
  Subject,
  catchError,
  filter,
  finalize,
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

import { IAuthStrategy } from '../../models/strategy.model';
import { SignUpByDataAction } from '../../actions/auth/singUpByData.action';
import { GoToLoginAction } from '../../actions/auth/goToLogin.action';
import { RemoveProductAuthTokenAction } from '../../actions/auth/removeLsToken.action';
import { InitTokenStrategyAction } from '../../actions/auth/initTokenShareStrategy.action';
import { AskProjectIdsAction } from '../../actions/token-share/askProjectsIds.action';
import { CheckTokenAction } from '../../actions/auth/checkToken.action'
import { SetUserDataAction } from '../../actions/auth/setUserData.action';
import { AppStateService, UserAction } from '../../services/app-state.service';
import { GrantAuthAction } from '../../actions/auth/grantAuth.action';

@Injectable()
export class BackendTokenStrategy implements IAuthStrategy {
  private unsubscribe$ = new Subject<void>();

  constructor(
   
    private injector: Injector,
    private _appStateService: AppStateService
  ) {
    this._appStateService.userAction.listen
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
      .subscribe((res: UserAction) => {
        this.runScenario(res.event);
      });
  }

  runScenario(scenario: string) {
    switch (scenario) {
      case 'init':
        this.handleInitScenario();
        break;
      case 'SEND_LOGIN_REQUEST':
        this.handleSendLoginRequest();
        break;
      case 'SEND_SIGNUP_REQUEST':
        this.handleSendSignupRequest();
        break;
      default:
        throw new Error(`Unknown authentication scenario: ${scenario}`);
    }
  }

  handleInitScenario() {
    
    const token = this.injector
      .get<IAuthAction>(AuthActionMap.get('GET_TOKEN'))
      .execute();

    if (token) {   
      this.injector
        .get<IAuthAction>(AuthActionMap.get(
          'CHECK_TOKEN__GET_USER_DATA'
        ))
        .execute()
        .subscribe((res: any) => {
          this.injector
            .get<IAuthAction>(AuthActionMap.get(
              'SET_USER_DATA'
            ))
            .execute(res)
          
          this.injector
            .get<IAuthAction>(AuthActionMap.get(
              'GRANT_AUTH'
            ))
            .execute();
        })
      // + logout on 4xx error
      

      
      // проверить, нужно ли шарить токен, если нет - завершить au@
      // obtain userName
    } else {
      this.injector
        .get<IAuthAction>(AuthActionMap.get('DISPLAY_LOGIN_FORM'))
        .execute();
    }
  }

  handleSendLoginRequest() {
    this.injector
      .get<IAuthAction>(AuthActionMap.get('RESET_FORM_VALIDATORS'))
      .execute();
    this.injector
      .get<IAuthAction>(AuthActionMap.get('DISPLAY_LOADER'))
      .execute(true);
    this.injector
      .get<IAuthAction>(AuthActionMap.get('SIGN_IN_BY_DATA'))
      .execute()
      .pipe(
        takeUntil(this.unsubscribe$),
        tap((res: LoginResponse) => {
          this.injector
            .get<IAuthAction>(AuthActionMap.get('SAVE_TOKEN_IN_LS'))
            .execute(res);
          this.handleInitScenario();
        }),
        catchError((err: HttpErrorResponse) => {
          this.catchResponseError(err);
          return EMPTY;
        }),
        finalize(() => {
          this.injector
            .get<IAuthAction>(AuthActionMap.get('DISPLAY_LOADER'))
            .execute(false);
        })
      )
      .subscribe();
  }

  handleSendSignupRequest() {
    this.injector
      .get<IAuthAction>(AuthActionMap.get('RESET_FORM_VALIDATORS'))
      .execute();
    this.injector
      .get<IAuthAction>(AuthActionMap.get('DISPLAY_LOADER'))
      .execute(true);

    this.injector
      .get<IAuthAction>(AuthActionMap.get('SIGN_UP_BY_DATA'))
      .execute()
      .pipe(
        takeUntil(this.unsubscribe$),
        tap((response: { token: string }) => {
          this.injector
            .get<IAuthAction>(AuthActionMap.get('REMOVE_TOKEN'))
            .execute();
            
          this.injector
            .get<IAuthAction>(AuthActionMap.get('GO_TO_LOGIN'))
            .execute();
        }),
        catchError((err: HttpErrorResponse) => {
          this.catchResponseError(err);
          return EMPTY;
        }),
        finalize(() => {
          this.injector
            .get<IAuthAction>(AuthActionMap.get('DISPLAY_LOADER'))
            .execute(false);
        })
      )
      .subscribe();
  }

  catchResponseError(err: HttpErrorResponse) {
    if (err.status === 401) {
      this.injector
        .get<IAuthAction>(AuthActionMap.get('SHOW_AUTH_ERROR'))
        .execute(err);
    } else {
      this.injector
        .get<IAuthAction>(AuthActionMap.get('SHOW_UNKNOWN_ERROR'))
        .execute(err);
    }
  }
}

export const AuthActionMap = new Map<string, any>([
  ['GET_TOKEN', GetProductAuthTokenAction],
  ['DISPLAY_LOGIN_FORM', DisplayLoginFormAction],
  ['SIGN_IN_BY_DATA', SignInByDataAction],
  ['SIGN_UP_BY_DATA', SignUpByDataAction],
  ['SAVE_TOKEN_IN_LS', SaveTokenInLsAction],
  ['SHOW_AUTH_ERROR', DisplayInvalidDataErrorAction],
  ['SHOW_UNKNOWN_ERROR', DisplayUnknownErrorAction],
  ['DISPLAY_LOADER', DisplayLoaderAction],
  ['RESET_FORM_VALIDATORS', ResetFormValidatorsAction],
  
  ['GO_TO_LOGIN', GoToLoginAction],
  ['REMOVE_TOKEN', RemoveProductAuthTokenAction],
  ['ASK_PROJECTS_IDS', AskProjectIdsAction],
  ['GRANT_AUTH', GrantAuthAction],

  ['CHECK_TOKEN__GET_USER_DATA', CheckTokenAction],
  ['SET_USER_DATA', SetUserDataAction]
  
]);
