import { Component, Inject, InjectionToken, Injector, OnDestroy, OnInit } from '@angular/core';

import { BehaviorSubject, Observable, Subject, combineLatest, filter, of, take, takeUntil } from 'rxjs';
import { BusEvent, EVENT_BUS } from 'typlib';
import { DisplayInvalidDataErrorAction } from './actions/auth/displayInvalidDataError.action';
import { DisplayLoaderAction } from './actions/auth/displayLoader.action';
import { DisplayLoginFormAction } from './actions/auth/displayLoginForm.action';
import { DisplayUnknownErrorAction } from './actions/auth/displayUnknownError.action';
import { GetProductAuthTokenAction } from './actions/auth/getLsToken.action';
import { GrantAccessAction } from './actions/auth/grantAccess.action';
import { ResetFormValidatorsAction } from './actions/auth/resetFormValidators.action';
import { SaveTokenInLsAction } from './actions/auth/saveLsToken.action';
import { SignInByDataAction } from './actions/auth/singInByData.action';
import { AuthStrategyService } from './strategies/auth-strategy.service';
import { BackendAuthStrategy } from './strategies/auth/backend-auth.strategy';
import { DynamicComponent } from './components/dynamic/dynamic.component';
import { ConfigService } from './services/config.service';
import { UserActionService } from './services/user-action.service';
import { ViewService } from './services/view.service';
import { SignUpByDataAction } from './actions/auth/singUpByData.action';
import { GoToLoginAction } from './actions/auth/goToLogin.action';
import { RemoveProductAuthTokenAction } from './actions/auth/removeLsToken.action';
import { TokenShareStrategyService } from './strategies/token-share-strategy.service';
import { TokenShareService } from './services/token-share.service';
import { InitTokenStrategyAction } from './actions/auth/initTokenShareStrategy.action';
import { SaveTempDuplicateStrategy } from './strategies/token-share/save-temp-duplicate.strategy';
import { AskProjectIdsAction } from './actions/token-share/askProjectsIds.action';
import { CoreService } from './services/core.service';

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
    GoToLoginAction,
    ResetFormValidatorsAction,
    DynamicComponent,
    AuthStrategyService,
    BackendAuthStrategy,
    ViewService,
    UserActionService,
    RemoveProductAuthTokenAction,
    SignInByDataAction,
    SignUpByDataAction,
    GrantAccessAction,
    TokenShareStrategyService,
    TokenShareService,
    InitTokenStrategyAction,
    SaveTempDuplicateStrategy,
    AskProjectIdsAction,
    {
      provide: EVENT_BUS_LISTENER,
      useFactory: (eventBus$: BehaviorSubject<BusEvent>) => {
        return eventBus$
          .asObservable()
          .pipe(filter((res: BusEvent) => res.to === `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`));
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
export class AuthComponent implements OnInit, OnDestroy {
  destroyed = new Subject<void>()
  constructor(
    private _coreService: CoreService,
    private injector: Injector,
    @Inject(EVENT_BUS_LISTENER)
    private readonly eventBusListener$: Observable<BusEvent>,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void,
    @Inject(ConfigService) private ConfigServ: ConfigService,
    @Inject('ROUTER_PATH') private routerPath: BehaviorSubject<string>,
    @Inject(AuthStrategyService) private AuthStrategyServ: AuthStrategyService, // do not remove: used to bootstrap it's constructor
    private _tokenShareService: TokenShareService
  ) {
    this.eventBusListener$.subscribe((busEvent: BusEvent) => {
        console.log('AU:');
        console.log(busEvent);
      if (busEvent.event === 'authStrategy') {
        this.ConfigServ.setConfig(authStrategyAdapter(busEvent));
      }
      // if (busEvent.event === 'ROUTER_PATH') {
      //   this.routerPath.next(busEvent.payload.routerPath)
      // }
      // if (busEvent.event === 'BACK_URL') {
      //   this._tokenShareService.addRouteToExternalUpdates(busEvent.payload.projectId, busEvent.payload.backendUrl)
      // }
      if (busEvent.event === 'PROJECTS_IDS') {
        // this._tokenShareService.addRouteToExternalUpdates(busEvent.payload.projectId, busEvent.payload.backendUrl)
        this._tokenShareService.addProjects(busEvent.payload.projectsIds)
        const ss = this._tokenShareService.getStore()
        console.log(ss)
      }
    });
  }

  ngOnInit (): void {
    combineLatest([
      this._routerPathSet$(),
      // this._registerComponentsService.listenComponentsRegistered$().pipe(
      //   filter((res: boolean) => res === true)
      // )
    ]).pipe(
      takeUntil(this.destroyed)
    ).subscribe(() => {
      this._renderComponents()
    })
  }

  ngOnDestroy (): void {
    console.log('au destroyed')
    this.destroyed.next();
    this.destroyed.complete();
  }

  private _routerPathSet$ (): Observable<boolean> {
    if (this._coreService.isRouterPathSet() === true) {
      return of(true)
    }
    this.eventBusPusher({
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: `faq@web-host`,
      // to: `${process.env['PROJECT_ID']}@web-host`,
      event: 'ASK_ROUTER_PATH',
      payload: {
        projectId: `${process.env['PROJECT_ID']}`
      }
    })
    return this._coreService.listenRouterPathSet$.pipe(
      filter((res: boolean) => res === true),
      take(1),
      takeUntil(this.destroyed)
    )
  }

  private _renderComponents (): void {
    console.log('no navigation components to render in au@')
    /**
     * Навигационные кнопки уже сохранены в host'е при подгрузке модуля.
     * Если этот рутовый продуктовый компонент инициализировался,
     * значит мы перешли на продуктовый роут,
     * значит нужно отрисовать навигационные кнопки.
     */

    // не нашел компонеты-кнопки для навигации
    // const busEvent: BusEvent = {
    //   from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
    //   to: `faq@web-host`,
    //   event: 'RENDER_COMPONENTS',
    //   payload: {},
    // }
    // this.eventBusPusher(busEvent);
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
    tokenShareStrategy: String(busEvent.payload?.['tokenShareStrategy']),
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
  tokenShareStrategy: string;
  payload: {
    checkBackendUrl: string;
    signUpByDataUrl?: string
    signInByDataUrl: string;
    signInByTokenUrl: string;
  };
  from: string;
  status: string;
}
