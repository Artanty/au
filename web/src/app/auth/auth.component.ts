import { Component, Inject, InjectionToken, Injector, OnInit } from '@angular/core';

import { BehaviorSubject, Observable, filter } from 'rxjs';
import { BusEvent, EVENT_BUS } from 'typlib';
import { DisplayInvalidDataErrorAction } from './auth-action/actions/displayInvalidDataError.action';
import { DisplayLoaderAction } from './auth-action/actions/displayLoader.action';
import { DisplayLoginFormAction } from './auth-action/actions/displayLoginForm.action';
import { DisplayUnknownErrorAction } from './auth-action/actions/displayUnknownError.action';
import { GetProductAuthTokenAction } from './auth-action/actions/getLsToken.action';
import { GrantAccessAction } from './auth-action/actions/grantAccess.action';
import { ResetFormValidatorsAction } from './auth-action/actions/resetFormValidators.action';
import { SaveTokenInLsAction } from './auth-action/actions/saveLsToken.action';
import { SignInByDataAction } from './auth-action/actions/singInByData.action';
import { AuthStrategyService } from './auth-strategy/auth-strategy.service';
import { BackendAuthStrategy } from './auth-strategy/strategies/backend-auth.strategy';
import { DynamicComponent } from './components/dynamic/dynamic.component';
import { ConfigService } from './services/config.service';
import { UserActionService } from './services/user-action.service';
import { ViewService } from './services/view.service';

export const EVENT_BUS_LISTENER = new InjectionToken<Observable<BusEvent>>('');
export const EVENT_BUS_PUSHER = new InjectionToken<
  (busEvent: BusEvent) => void
>('');

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
      useFactory: (eventBus$: BehaviorSubject<BusEvent>) => {
        return eventBus$
          .asObservable()
          .pipe(filter((res: BusEvent) => res.to === process.env['APP']));
      },
      deps: [EVENT_BUS],
    },
    {
      provide: EVENT_BUS_PUSHER,
      useFactory: (eventBus$: BehaviorSubject<BusEvent>) => {
        return (busEvent: BusEvent) => {
          eventBus$.next(busEvent);
        };
      },
      deps: [EVENT_BUS],
    },
  ],
})
export class AuthComponent implements OnInit {
  constructor(
    private injector: Injector,
    @Inject(EVENT_BUS_LISTENER)
    private readonly eventBusListener$: Observable<BusEvent>,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void,
    @Inject(ConfigService) private ConfigServ: ConfigService,
    @Inject(AuthStrategyService) private AuthStrategyServ: AuthStrategyService // do not remove: used to bootstrap it's constructor
  ) {
    this.eventBusListener$.subscribe((busEvent: BusEvent) => {
      console.log('AUTH BUS:');
      console.log(busEvent);

      this.ConfigServ.setConfig(authStrategyAdapter(busEvent));
    });
  }

  ngOnInit (): void {
    const busEvent: BusEvent = {
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: `faq@web-host`,
      event: 'RENDER_COMPONENTS',
      payload: {},
    }
    this.eventBusPusher(busEvent);
  }
}

// ADAPTER FUNCTION FROM:
// export const authStrategyBusEvent: BusEvent = {
//   from: 'DORO',
//   to: 'AU',
//   event: 'authStrategy',
//   payload: {
//     authStrategy: 'backend',
//     checkBackendUrl: 'http://localhost:3600/check',
//     signInByDataUrl: 'http://localhost:3600/login',
//     signInByTokenUrl: 'http://localhost:3600/loginByToken',
//     status: 'init',
//   },
// };
// TO:
// export const authProps: IAuthDto = {
//   productName: "doro",
//   authStrategy: "backend",
//   payload: {
//     checkBackendUrl: "https://cs99850.tmweb.ru/login",
//     signInByDataUrl: "https://cs99850.tmweb.ru/login",
//     signInByTokenUrl: "https://cs99850.tmweb.ru/loginByToken",
//   },
//   from: "product",
//   status: "init",
// }
export function authStrategyAdapter(busEvent: BusEvent): IAuthDto {
  const result: IAuthDto = {
    productName: busEvent.from,
    authStrategy: String(busEvent.payload?.['authStrategy']),
    payload: {
      checkBackendUrl: String(busEvent.payload['checkBackendUrl']),
      signInByDataUrl: String(busEvent.payload['signInByDataUrl']),
      signInByTokenUrl: String(busEvent.payload['signInByTokenUrl']),
    },
    from: 'product',
    status: String(busEvent.payload?.['status']) ?? 'init',
  };

  return result;
}

export interface IAuthDto {
  productName: string;
  authStrategy: string;
  payload: {
    checkBackendUrl: string;
    signInByDataUrl: string;
    signInByTokenUrl: string;
  };
  from: string;
  status: string;
}
