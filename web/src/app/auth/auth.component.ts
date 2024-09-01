import { Component, Inject, InjectionToken } from '@angular/core';
import { BehaviorSubject, Observable, filter } from 'rxjs';
import { AuthStrategyService } from './auth-strategy/auth-strategy.service'
import { IAuthDto, EVENT_BUS } from 'typlib';
import { ViewService } from './services/view.service';
import { UserActionService } from './services/user-action.service';
import { DynamicComponent } from './components/dynamic/dynamic.component';
import { SignInByDataAction } from './auth-action/actions/singInByData.action';
import { BackendAuthStrategy } from './auth-strategy/strategies/backend-auth.strategy';
import { DisplayInvalidDataErrorAction } from './auth-action/actions/displayInvalidDataError.action';
import { DisplayLoaderAction } from './auth-action/actions/displayLoader.action';
import { DisplayLoginFormAction } from './auth-action/actions/displayLoginForm.action';
import { DisplayUnknownErrorAction } from './auth-action/actions/displayUnknownError.action';
import { GetProductAuthTokenAction } from './auth-action/actions/getLsToken.action';
import { ResetFormValidatorsAction } from './auth-action/actions/resetFormValidators.action';
import { SaveTokenInLsAction } from './auth-action/actions/saveLsToken.action';
import { ConfigService } from './services/config.service';
import { GrantAccessAction } from './auth-action/actions/grantAccess.action';

export const EVENT_BUS_LISTENER = new InjectionToken<Observable<any>>('')
export const EVENT_BUS_PUSHER = new InjectionToken<(authDto: IAuthDto) => void>('');

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  providers: [
    GetProductAuthTokenAction,
    DisplayLoginFormAction,
    SignInByDataAction,
    SaveTokenInLsAction,
    DisplayInvalidDataErrorAction,
    DisplayUnknownErrorAction,
    DisplayLoaderAction,
    ResetFormValidatorsAction,
    DynamicComponent,
    AuthStrategyService,
    BackendAuthStrategy,
    ViewService,
    UserActionService,
    SignInByDataAction,
    GrantAccessAction,
    {
      provide: EVENT_BUS_LISTENER,
      useFactory: (eventBus$: BehaviorSubject<IAuthDto>) => {
        return eventBus$.asObservable()
        .pipe(
          filter(res => res.from === 'product')
        )
      },
      deps: [EVENT_BUS]
    },
    {
      provide: EVENT_BUS_PUSHER,
      useFactory: (eventBus$: BehaviorSubject<IAuthDto>) => {
        return (authDto: IAuthDto) => {
          eventBus$.next(authDto);
        };
      },
      deps: [EVENT_BUS]
    },
  ]
})
export class AuthComponent {
  constructor(
    @Inject(EVENT_BUS_LISTENER) private readonly eventBusListener$: Observable<IAuthDto>,
    @Inject(ConfigService) private ConfigServ: ConfigService,
    @Inject(AuthStrategyService) private AuthStrategyServ: AuthStrategyService // do not remove: used to bootstrap it's constructor
  ) {
    console.log(1)
    this.eventBusListener$
    .subscribe((dto: IAuthDto) => {
      this.ConfigServ.setConfig(dto)
    })
  }
}
