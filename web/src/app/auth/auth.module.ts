import { CommonModule } from '@angular/common';
import { inject, Inject, Injector, NgModule, ɵConsole as Console } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthComponent } from './auth.component';
import { DynamicComponent } from './components/dynamic/dynamic.component';
import { Login2Component } from './components/login2/login2.component';
import { SignupComponent } from './components/signup/signup.component';
import { BehaviorSubject, filter, Observable, take } from 'rxjs'; 
import { BusEvent, EVENT_BUS, EVENT_BUS_LISTENER, EVENT_BUS_PUSHER } from 'typlib';
import { CoreService } from './services/core.service';
import { AuthActionMap as AuthActionMap1, BackendAuthStrategy } from './strategies/auth/backend-auth.strategy';
import { AuthActionMap as AuthActionMap2, SaveTempDuplicateStrategy } from './strategies/token-share/save-temp-duplicate.strategy';
import { IAuthAction } from './models/action.model';
import { GoToLoginAction } from './actions/auth/goToLogin.action';
import { TestApiComponent } from '../test-api/components/test-api/test-api.component';
import { TestApiModule } from '../test-api/test-api.module';
import { ConfigService } from './services/config.service';
import { AuthStrategyService } from './strategies/auth-strategy.service';
import { BackendTokenStrategy } from './strategies/auth/backend-token.strategy';
import { DisplayInvalidDataErrorAction } from './actions/auth/displayInvalidDataError.action';
import { DisplayLoaderAction } from './actions/auth/displayLoader.action';
import { DisplayLoginFormAction } from './actions/auth/displayLoginForm.action';
import { DisplayUnknownErrorAction } from './actions/auth/displayUnknownError.action';
import { GetProductAuthTokenAction } from './actions/auth/getLsToken.action';
import { GrantAccessAction } from './actions/auth/grantAccess.action';
import { InitTokenStrategyAction } from './actions/auth/initTokenShareStrategy.action';
import { RemoveProductAuthTokenAction } from './actions/auth/removeLsToken.action';
import { ResetFormValidatorsAction } from './actions/auth/resetFormValidators.action';
import { SaveTokenInLsAction } from './actions/auth/saveLsToken.action';
import { SignInByDataAction } from './actions/auth/singInByData.action';
import { SignUpByDataAction } from './actions/auth/singUpByData.action';
import { AskProjectIdsAction } from './actions/token-share/askProjectsIds.action';
import { TokenShareService } from './services/token-share.service';
import { UserActionService } from './services/user-action.service';
import { ViewService } from './services/view.service';
import { TokenShareStrategyService } from './strategies/token-share-strategy.service';
import { SelectTokenShareStrategyAction } from './actions/auth/selectTokenShareStrategy.action';
import { AskBackUrlsAction } from './actions/token-share/askBackUrls.action';

export const eventBusFilterByProject = (res: BusEvent) => {
  return res.to === `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`
}

@NgModule({
  declarations: [
    DynamicComponent, 
    AuthComponent, 
    Login2Component,
    SignupComponent,
    // TestApiComponent 
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: AuthComponent,
        children: [
          {
            path: '', component: Login2Component
          },
          {
            path: 'login', component: Login2Component
          },
          {
            path: 'signup', component: SignupComponent
          }
        ]
      },
    ]),
    TestApiModule
  ],
  exports: [AuthComponent],
  providers: [
    CoreService,
    ConfigService,
    AuthStrategyService,
    BackendTokenStrategy,
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
    GrantAccessAction,
    BackendAuthStrategy,
    ViewService,
    UserActionService,
    RemoveProductAuthTokenAction,
    SignInByDataAction,
    SignUpByDataAction,
    TokenShareStrategyService,
    TokenShareService,
    InitTokenStrategyAction,
    SaveTempDuplicateStrategy,
    AskProjectIdsAction,
    AskBackUrlsAction,
    SelectTokenShareStrategyAction,
    // {
    //   provide: 'ROUTER_PATH', useValue: new BehaviorSubject<string>('')
    // },
    // { provide: EVENT_BUS, useValue: new BehaviorSubject('') },
    { 
      provide: EVENT_BUS_LISTENER, 
      useFactory: (eventBus$: BehaviorSubject<BusEvent>) => {
        return eventBus$
          .asObservable()
          .pipe(
            filter((res: BusEvent) => {
              return res.to === `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`
            }),
          );
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
    GoToLoginAction,
  ],
})
export class AuthModule {
  ngDoBootstrap() {}
  // private eventBusListener$: Observable<BusEvent>
  // private eventBusPusher: (busEvent: BusEvent) => void

  constructor (
    @Inject(EVENT_BUS)
    private readonly eventBus$: BehaviorSubject<BusEvent>,
    private injector: Injector,
    
    // private goToLoginAction: GoToLoginAction
    @Inject(EVENT_BUS_LISTENER)
    private readonly eventBusListener$: Observable<BusEvent>,
    @Inject(EVENT_BUS_PUSHER)
    private readonly eventBusPusher: (busEvent: BusEvent) => void,
    private readonly _coreService: CoreService,
    private readonly _configService: ConfigService,
    private readonly _authStrategyService: AuthStrategyService
  ) {
    console.log('AuthModule CONSTRUCTOR')
    
    this.eventBusListener$
    .pipe(
      filter(eventBusFilterByProject)
    ).subscribe((res: BusEvent) => {
      console.log(res)
      if (res.event === 'TRIGGER_ACTION') {
        console.log('action: ' + res.payload.action)
        if (res.payload.action === 'INIT_AUTH_CONFIG') {
          this.initAuthConfig()
        }
        // const map = new Map([...AuthActionMap1, ...AuthActionMap2])
        // const result = map.get(res.payload.action)
        // console.log(result)
        // result.execute()


        // this.injector
        //     .get<IAuthAction>(map.get('GO_TO_LOGIN'))
        //     .execute();
        
        // const goToLoginAction = new GoToLoginAction(injector);    
        // goToLoginAction.execute()
        
        // if ROUTER_PATH:
        // this._coreService.setRouterPath((res.payload as any).routerPath).then(() => {
        //     this.routerPath.next(res.payload.routerPath)
        //     this._sendDoneEvent(res, 'self')
        //   })
      }
    })
    
  }

  private _sendDoneEvent(busEvent: BusEvent, to?: string): void {
    const doneBusEvent: BusEvent = {
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: to === 'self' 
        ? `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`
        : `${busEvent.from}`,
      event: `${busEvent.event}_DONE`,
      payload: null
    }
    // this.eventBusPusher(doneBusEvent)
  }

  /**
   * Понять, откуда брать конфиг
   * для этого понять, ремоут мы или элоун.
   * для этого запросить ROUTE_PATH 
   */
  private initAuthConfig () {
    
    this.eventBusListener$.pipe(
      filter(eventBusFilterByProject),
      filter((res: BusEvent) => res.event === 'AUTH_CONFIG'),
      take(1)
    ).subscribe(res => {
      // console.log({ ...res.payload, from: res.from })
      this._configService.setConfig({ ...res.payload, from: res.from })
      this._authStrategyService.select(res.payload.authStrategy)
    })
    
    /**
     * Подписываемся, ждём прихода ROUTER_PATH и отписываемся
     */
    this.eventBusListener$.pipe(
      filter(eventBusFilterByProject),
      filter((res: BusEvent) => res.event === 'ROUTER_PATH'),
      take(1)
    ).subscribe(res => { 
      console.log(res)
      this._coreService.setRouterPath(res.payload.routerPath)
      .then(() => {
        /**
         * Если мы ремоут - запрашиваем конфиг у хоста
         */
        if (this._coreService.isInsideHost()) {
          this._sendEventToHost('ASK_AUTH_CONFIG')
        }
      })
    })

    this.eventBusPusher({
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: `faq@web-host`,
      event: 'ASK_ROUTER_PATH',
      payload: {
        projectId: `${process.env['PROJECT_ID']}`
      }
    })
  }

  private _sendEventToHost(eventName: string, payload: any = null): void {
    const busEvent: BusEvent = {
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: 'faq@web-host',
      event: `${eventName}`,
      payload: payload
    }
    this.eventBusPusher(busEvent)
  }
}
