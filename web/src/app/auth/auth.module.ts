import { CommonModule } from '@angular/common';
import { inject, Inject, Injector, NgModule, ɵConsole as Console } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthComponent } from './auth.component';

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
import { TokenShareStrategyService } from './strategies/token-share-strategy.service';
import { AuthDoneStrategyService } from './strategies/auth-done-strategy.service';

import { BackendTokenStrategy } from './strategies/auth/backend-token.strategy';

import { DisplayInvalidDataErrorAction } from './actions/auth/displayInvalidDataError.action';
import { DisplayLoaderAction } from './actions/auth/displayLoader.action';
import { DisplayLoginFormAction } from './actions/auth/displayLoginForm.action';
import { DisplayUnknownErrorAction } from './actions/auth/displayUnknownError.action';
import { GetProductAuthTokenAction } from './actions/auth/getLsToken.action';

import { InitTokenStrategyAction } from './actions/auth/initTokenShareStrategy.action';
import { RemoveProductAuthTokenAction } from './actions/auth/removeLsToken.action';
import { ResetFormValidatorsAction } from './actions/auth/resetFormValidators.action';
import { SaveTokenInLsAction } from './actions/auth/saveLsToken.action';
import { SignInByDataAction } from './actions/auth/singInByData.action';
import { SignUpByDataAction } from './actions/auth/singUpByData.action';
import { AskProjectIdsAction } from './actions/token-share/askProjectsIds.action';
import { TokenShareService } from './services/token-share.service';
import { ViewService } from './services/view.service';
import { AskBackUrlsAction } from './actions/token-share/askBackUrls.action';
import { InitTokenShareStoreAction } from './actions/token-share/initTokenShareStore.action';
import { GetRequiredProjectsIdsAction } from './actions/token-share/getRequiredProjectsIds.action';
import { StoreBackUrlsAction } from './actions/token-share/storeBackUrls.action';
import { ShareTokenAction } from './actions/token-share/shareToken.action';
import { eventBusFilterByProject } from './utilites/eventBusFilterByProject';
import { ValidateSharedTokenAction } from './actions/token-share/validateSharedToken.action';
import { GrantAuthAction } from './actions/auth/grantAuth.action';
import { SetProductBtnLoadingAction } from './actions/token-share/setProductBtnLoading.action';
import { SetProductBtnReadyAction } from './actions/token-share/setProductBtnReady.action';
import { SetProductBtnLockedAction } from './actions/token-share/setProductBtnLocked.action';
import { ListenGrantAuthAction } from './actions/auth-done/listenGrantAuth.action';
import { ListenValidateSharedTokenAction } from './actions/auth-done/listenValidateSharedToken.action';
import { AuthAndShareStrategy } from './strategies/auth-done/auth-and-share.strategy';
import { SendAuthDoneEventAction } from './actions/auth-done/sendAuthDoneEvent.action';
import { SetProductBtnCollapsedAction } from './actions/auth-done/setProductBtnCollapsed.action';
import { createCustomElement } from '@angular/elements';
import { UserSelectorComponent } from './components/_remotes/user-selector/user-selector.component';
import { WrapperComponent } from './components/_remotes/wrapper';
import { WebComponentWrapperComponent } from './components/_remotes/web-component-wrapper/web-component-wrapper';
import { GuiDirective } from './components/_remotes/web-component-wrapper/gui.directive';
import { UserAvatarComponent } from './components/_remotes/user-avatar/user-avatar.component';
import { CheckTokenAction } from './actions/auth/checkToken.action';
import { UserProfileService } from './services/user-profile.service';
import { SetUserDataAction } from './actions/auth/setUserData.action';

@NgModule({
  declarations: [
    
    AuthComponent, 
    Login2Component,
    SignupComponent,
    
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
    // Overrides router. Remove in prod
    // TestApiModule
    WebComponentWrapperComponent,
    GuiDirective,
    UserAvatarComponent
  ],
  exports: [AuthComponent],
  providers: [
    CoreService,
    ConfigService,
    // UserProfileService,
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
    BackendAuthStrategy,
    ViewService,
    
    RemoveProductAuthTokenAction,
    SignInByDataAction,
    SignUpByDataAction,
    TokenShareStrategyService,
    TokenShareService,
    InitTokenStrategyAction,
    SaveTempDuplicateStrategy,
    AskProjectIdsAction,
    AskBackUrlsAction,
    InitTokenShareStoreAction,
    GetRequiredProjectsIdsAction,
    StoreBackUrlsAction,
    ShareTokenAction,
    SendAuthDoneEventAction,
    ValidateSharedTokenAction,
    GrantAuthAction,
    SetProductBtnLoadingAction,
    SetProductBtnReadyAction,
    SetProductBtnLockedAction,
    ListenGrantAuthAction,
    ListenValidateSharedTokenAction,
    AuthAndShareStrategy,
    AuthDoneStrategyService,
    SetProductBtnCollapsedAction,
    CheckTokenAction,
    SetUserDataAction,
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
 
  constructor(
    @Inject(EVENT_BUS)
    private readonly eventBus$: BehaviorSubject<BusEvent>,
    private injector: Injector,
    @Inject(EVENT_BUS_LISTENER)
    private readonly eventBusListener$: Observable<BusEvent>,
    @Inject(EVENT_BUS_PUSHER)
    private readonly eventBusPusher: (busEvent: BusEvent) => void,
    private readonly _coreService: CoreService,
    private readonly _configService: ConfigService,
    private readonly _authStrategyService: AuthStrategyService,
    private readonly _tokenShareStrategyService: TokenShareStrategyService,
    private readonly _authDoneStrategyService: AuthDoneStrategyService,

  ) {
    console.log('au module constructor')
    this.eventBusListener$
      .pipe(
        filter(eventBusFilterByProject)
      ).subscribe((res: BusEvent) => {
        if (res.event === 'TRIGGER_ACTION') {
          if (res.payload.action === 'INIT_AUTH_CONFIG') {
            this.initAuthConfig()
          }
        }
      })
    this.register('UserSelectorComponent', UserSelectorComponent, 'user-selector')
    // this.register('UserAvatarComponent', UserAvatarComponent, 'user-avatar')
  }

  /**
   * 'UserSelectorComponent', UserSelectorComponent, 'user-selector'
   * 
   * */
  private register(componentName: string, component: any, customElementName: string) {
    
    const injectorWithComponentName = Injector.create({
      providers: [
        { provide: 'componentName', useValue: componentName },
      ],
      parent: this.injector,
    });
    // Convert Angular component to web component
    const customElement = createCustomElement(component, {
      injector: injectorWithComponentName
    });

    // Register as custom element
    customElements.define(customElementName, customElement);
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
   * для этого запросить ROUTE_PATH.
   * Ремоут берет конфиг от хоста
   */
  private initAuthConfig() {
    
    this.eventBusListener$.pipe(
      filter(eventBusFilterByProject),
      filter((res: BusEvent) => res.event === 'AUTH_CONFIG'),
      take(1)
    ).subscribe(res => {
      this._configService.setConfig({ ...res.payload, from: res.from })
      this._authStrategyService.select(res.payload.authStrategy);
      this._tokenShareStrategyService.select(res.payload.tokenShareStrategy);
      
      if (res.payload.authStrategy && res.payload.tokenShareStrategy) {
        this._authDoneStrategyService.select('AUTH_AND_SHARE');
      }
    })

    /**
     * Подписываемся, ждём прихода ROUTER_PATH и отписываемся.
     * todo перенести это в INIT стратегию?
     */
    this.eventBusListener$.pipe(
      filter(eventBusFilterByProject),
      filter((res: BusEvent) => res.event === 'ROUTER_PATH'),
      take(1)
    ).subscribe(res => { 
      
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


