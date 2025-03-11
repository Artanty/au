import { CommonModule } from '@angular/common';
import { inject, Inject, Injector, NgModule, ɵConsole as Console } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthComponent } from './auth.component';
import { DynamicComponent } from './components/dynamic/dynamic.component';
import { Login2Component } from './components/login2/login2.component';
import { SignupComponent } from './components/signup/signup.component';
import { BehaviorSubject, filter, Observable } from 'rxjs'; 
import { BusEvent, EVENT_BUS, EVENT_BUS_LISTENER, EVENT_BUS_PUSHER } from 'typlib';
import { CoreService } from './services/core.service';
import { AuthActionMap as AuthActionMap1 } from './strategies/auth/backend-auth.strategy';
import { AuthActionMap as AuthActionMap2 } from './strategies/token-share/save-temp-duplicate.strategy';
import { IAuthAction } from './models/action.model';
import { GoToLoginAction } from './actions/auth/goToLogin.action';
import { TestApiComponent } from '../test-api/components/test-api/test-api.component';
import { TestApiModule } from '../test-api/test-api.module';

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
    {
      provide: 'ROUTER_PATH', useValue: new BehaviorSubject<string>('')
    },
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
 
  private eventBusListener$: Observable<BusEvent>
  // private eventBusPusher: (busEvent: BusEvent) => void

  constructor (
    // @Inject(EVENT_BUS)
    // private readonly eventBus$: BehaviorSubject<BusEvent>,
    private injector: Injector,
    
    // private goToLoginAction: GoToLoginAction
    // @Inject(EVENT_BUS_LISTENER)
    // private readonly eventBusListener$: Observable<BusEvent>,
    // @Inject(EVENT_BUS_PUSHER)
    // private readonly eventBusPusher: (busEvent: BusEvent) => void,
  ) {

    // const injector = Injector.create({
    //   providers: [
    //     { provide: Router, useClass: Router },
    //     { provide: Console, useClass: Console },
    //     { provide: 'ROUTER_PATH', useValue: new BehaviorSubject<string>('default-path') },
    //   ],
    // });
    
    const eventBus$ = this.injector.get(EVENT_BUS);

    
    this.eventBusListener$ = eventBus$
    .asObservable()
    .pipe(
      filter((res: BusEvent) => {
        return res.to === `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`
      }),
    );
    // this.eventBusPusher = (busEvent) => this.eventBus$.next(busEvent)

    this.eventBusListener$
    .pipe(
      filter(eventBusFilterByProject)
    ).subscribe((res: BusEvent) => {
      console.log(res)
      if (res.event === 'TRIGGER_ACTION') {
        console.log('action: ' + res.payload.action)
        // const map = new Map([...AuthActionMap1, ...AuthActionMap2])
        // const result = map.get(res.payload.action)
        // console.log(result)
        // result.execute()


        // this.injector
        //     .get<IAuthAction>(map.get('GO_TO_LOGIN'))
        //     .execute();
        
        // const goToLoginAction = new GoToLoginAction(injector);    
        // goToLoginAction.execute()
        
        
      }
      if (res.event === 'ROUTER_PATH') {
        // this._coreService.setRouterPath((res.payload as any).routerPath).then(() => {
        //   this.routerPath.next(res.payload.routerPath)
        //   this._sendDoneEvent(res, 'self')
        // })
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
}
