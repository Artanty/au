import { loadRemoteModule, LoadRemoteModuleScriptOptions } from "@angular-architects/module-federation"
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  InjectionToken,
  Injector,
  NgModuleRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewContainerRef,
  ɵcreateInjector as createInjector
} from "@angular/core"
import { NavigationEnd, NavigationStart, Router, Routes } from "@angular/router"
import { ChromeMessagingService } from "./services/chrome-messaging.service"
import { BusEvent, EVENT_BUS, EVENT_BUS_LISTENER, EVENT_BUS_PUSHER } from 'typlib';
import { BehaviorSubject, filter, map, Observable, Subject } from "rxjs";
import { StatService } from "./services/stat-service";
import { ChromeMessage, ProductButton, RegisterComponentsBusEvent, RegisterComponentsBusEventPayloadItem, RemoteBody } from './app.component.types';
import { FunctionQueueService } from './services/function-queue.service';
import { GroupButtonsDirective } from './directives/group-buttons.directive';
import { BusEventStoreService } from './services/bus-event-store.service';
import { remotes } from "./app.component.data";
import { RemoteConfigService } from "./services/remote-config.service";
import { eagerLoadRemoteModule, eagerLoadRemoteModules } from "./init/eagerLoadRemotes";
import { loadRemotes } from "./init/loadRemotes";



@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss", 
  providers: [
    // {
    //   provide: EVENT_BUS_LISTENER,
    //   useFactory: (eventBus$: BehaviorSubject<BusEvent>) => {
    //     return eventBus$
    //       .asObservable()
    //       .pipe(filter((res) => res.to === `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`));
    //   },
    //   deps: [EVENT_BUS],
    // },
    // {
    //   provide: EVENT_BUS_PUSHER,
    //   useFactory: (eventBus$: BehaviorSubject<BusEvent>) => {
    //     return (busEvent: BusEvent) => {
    //       eventBus$.next(busEvent);
    //     };
    //   },
    //   deps: [EVENT_BUS],
    // },
  ],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('productNavContainer', { static: false }) productNavContainer!: ElementRef;  
  @ViewChild(GroupButtonsDirective) groupButtonsDirective!: GroupButtonsDirective;
  
  public productMainButtons: ProductButton[] = []
  
  private ngAfterViewInit$ = new BehaviorSubject<boolean>(false);

  private destroy$ = new Subject<void>(); // For unsubscribing
  
  constructor(
    private router: Router,
    private chromeMessagingService: ChromeMessagingService,
    @Inject(EVENT_BUS_LISTENER)
    private readonly eventBusListener$: Observable<BusEvent>,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void,
    private _statService: StatService,
    private renderer: Renderer2, 
    private functionQueueService: FunctionQueueService,
    private _busEventStoreService: BusEventStoreService,
    private cdr: ChangeDetectorRef,
    private _remoteConfigService: RemoteConfigService,
    private injector: Injector,
    @Inject(EVENT_BUS)
    private readonly eventBus$: BehaviorSubject<BusEvent>,
  ) {}
  
  currentRouterPath: string = '';
  
  ngOnInit(): void {

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        const urlSegment = event.url.split('/')[1]; // Extract the first segment
        console.log('Intercepted route segment:', urlSegment);
        this.currentRouterPath = urlSegment
      }
    });

    
    // setTimeout(() => {
    //   this._updateProductMainButton('au', 'buttonState', 'collapsed')
    //   this._updateProductMainButton('au', 'buttonName', 'Artyom Antoshkin')
    // },2000)
    this.chromeMessagingService.messages.subscribe((message: ChromeMessage) => {
      // console.log('HOST received WORKER event: ' + message.event);
      
      if (message.event === 'SHOW_OLDEST_TICKET') {
        this._showOldestTicket(message.payload['tickets']) // todo bypass here, catch in faq@web
      }
      if (message.event === 'RETRY_SEND_STAT') {
        this._statService.sendStatData(message.payload)
      }
    });

    this.eventBusListener$.subscribe((res: BusEvent) => {
      if (res.event === "ADD_REMOTES") {
        loadRemotes(remotes, this.router, this.productMainButtons)
        .then(() => {
          const busEvent: BusEvent = {
            from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
            to: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
            event: 'ADD_REMOTES_DONE',
            payload: null,
          };
          this.eventBusPusher(busEvent);
        })
      }
      if (res.event === 'ADD_REMOTES_DONE') {
        eagerLoadRemoteModules(remotes, this.currentRouterPath, this.injector)
        .then(() => {
          const busEvent: BusEvent = {
            from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
            to: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
            event: 'EAGER_ADD_REMOTES_DONE',
            payload: null,
          };
          this.eventBusPusher(busEvent);
        });
      }

      if (res.event === 'EAGER_ADD_REMOTES_DONE') {
        this._remoteConfigService.setRemotesConfigs(remotes)
        .then(() => {
          const busEvent: BusEvent = {
            from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
            to: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
            event: 'SET_REMOTES_CONFIGS_DONE',
            payload: null,
          };
          this.eventBusPusher(busEvent);
        });
      }
      
      
      // console.log('HOST received BUS event: ' + res.event)
      if (res.event === "CLOSE_EXT") {
        window.close();
      }
      /**
       * Зарегистрированные компоненты не нужно рендерить
       * если роут не продуктовый, сохраняем их в стор
       */
      if (res.event === 'REGISTER_COMPONENTS') {
        this._busEventStoreService.addEvent(res).then(() => {
          this._sendDoneEvent(res)
        })
      }
      /**
       * Когда продуктовый рутовый компонент инициализируется,
       * он отправляет ивент, чтобы отрендерить свои навигационные кнопки.
       * Идем в стор ивентов и достаем их.
       */
      if (res.event === 'RENDER_COMPONENTS') {
        this.cdr.detectChanges()
        const productButtonsEvents = this._busEventStoreService.getEventsByProps(
          'REGISTER_COMPONENTS',
          res.from,
          res.payload['payloadFilter']
        )
        this.functionQueueService.addToQueue(
          this._clearProductNavContainer,
          this,
          undefined,
          this.ngAfterViewInit$
        );

        if (productButtonsEvents && productButtonsEvents.length) {
          if (productButtonsEvents.length !== 1) {
            console.error('IT SHOULD ONLY ONE EVENT WITH REGISTERED COMPONENTS FROM ' + res.from)
          }
          console.log(productButtonsEvents[0])
          productButtonsEvents[0]?.payload?.items.forEach((el: any) => {
            this._renderProductNavButton(el)
          })
        }
      }
      if (res.event === 'ASK_ROUTER_PATH') {
        this._sendRoutePathToRemoteMfe(res.payload["projectId"])
      }
      if (res.event === 'auth') {
        // const projectId = res.from.split('@')[0]
        const projectId = res.from
        if (res.payload.status === 'ACCESS_GRANTED') {
          // collapse au icon, change its name
          this._updateProductMainButton(projectId, 'buttonState', 'collapsed')
          this._updateProductMainButton(projectId, 'buttonName', res.payload.username)
        }
        console.log('go to main page');
        // const busEvent: BusEvent = {
        //   from: process.env['APP']!,
        //   to: this.hostName,
        //   event: 'auth',
        //   payload: { status: 'ACCESS_GRANTED' },
        // }; 
      }
      if (res.event === 'ASK_PROJECTS_IDS') {
        this._sendProjectsIds(res)
      }
      
    })    
  } 

  private _sendProjectsIds (res: BusEvent) {
    const remotesIds: string[] = Object.keys(remotes)
    const busEvent: BusEvent = {
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: res.from,
      event: 'PROJECTS_IDS',
      payload: { projectsIds: remotesIds },
    };
    this.eventBusPusher(busEvent)
  }
  private _updateProductMainButton (projectId: string, prop: keyof ProductButton, state: string) {
    const found = this.productMainButtons.find(el => el.projectId === projectId)
    if (found) {
      if (!found[prop]) throw new Error(`no prop ${prop} in button`)
      found[prop] = state
    } else {
      console.error(`Product button of ${projectId} not found`)
    }
  }
 
  private _sendDoneEvent(busEvent: BusEvent): void {
    const doneBusEvent: BusEvent = {
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: `${busEvent.from}`,
      event: `${busEvent.event}_DONE`,
      payload: null
    }
    this.eventBusPusher(doneBusEvent)
  }
  
  private _clearProductNavContainer (): void {
    const container: HTMLElement = this.productNavContainer.nativeElement;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  private _renderProductNavButton(payloadItem: RegisterComponentsBusEventPayloadItem) {
    this.functionQueueService.addToQueue(
      this._appendRemoteButton,
      this,
      {
        customElementName: payloadItem.customElementName,
        customElementInputs: payloadItem.customElementInputs,
        customElementTransclusion: payloadItem.customElementTransclusion
      },
      this.ngAfterViewInit$
    );
  }  

  ngAfterViewInit() {
    this.ngAfterViewInit$.next(true);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public goHome(): void {
    this.router.navigateByUrl('/home')
  }

  public isHomeRoute(): boolean {
    return this.router.url === '/home';
  }

  /**
   * Чтобы програмно перейти на дочерний роут продукта, нужно
   * перейти на рутовый роут продукта, чтобы он начал слушать события
   * и после этого запушить событие с нужным действием.
   * Почему просто не пейти на дочерний роут ремоута? /faq/ticket.
   * Веб-хост не должен знать какой роут за что отвечает.
   * Он отправляет команду, за реализацию отвечает ремоут.
   * todo можно попробовать регистрировать роуты ремоута в сет:
   * remoteRouteSet = { 'SHOW_OLDEST_TICKET': '/faq/ticket' }
   * и проходиться по ним при каждом полученном вебХостом busEvent'е.
   * При этом если из веб-воркера пришли загруженные события, придется 
   * сохранить их в busEventStoreService, затем вернуть и очистить.
  */
  private _showOldestTicket (tickets: any[] = []) {
    const projectId = 'faq'
    const url = remotes[projectId].routerPath!
    
    this.router.navigateByUrl(url).then(() => {
      const busEvent: BusEvent = {
        from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
        to: `${process.env['PROJECT_ID']}@web`,
        event: 'SHOW_OLDEST_TICKET',
        payload: { 
          tickets: tickets
        },
      }
      this.eventBusPusher(busEvent);
    })
  }
  // non-routed module in angular
  

  

  // private async _loadRemoteModule(projectId: string): Promise<void> {
    
  //   const childRoutes: Routes = [
  //     {
  //       path: remotes[projectId as keyof typeof remotes].routerPath,
  //       loadChildren: () => {
  //         return loadRemoteModule(remotes[projectId as keyof typeof remotes].remoteModuleScript)
  //         .then((m) => {
  //           const remoteModule = m[remotes[projectId as keyof typeof remotes].moduleName!]
            
  //           return remoteModule
  //         })
  //       },
  //     },
  //   ];
  //   this.router.resetConfig([...this.router.config, ...childRoutes]);
    
  //   this._sendRoutePathToRemoteMfe(projectId)
  //   this._remoteConfigService.setRemoteConfig(remotes, projectId)
  //   this._renderProductMainButton(projectId)
  // }

  private _sendRoutePathToRemoteMfe(projectId: string) {
    
    const routePathBusEvent: BusEvent = {
      event: "ROUTER_PATH",
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: `${projectId}@web`,
      payload: { routerPath: remotes[projectId as keyof typeof remotes].routerPath },
    }
    // console.log(routePathBusEvent)
    this.eventBusPusher(routePathBusEvent);
  }

  private _appendRemoteButton({ customElementName, customElementInputs, customElementTransclusion }: {
    customElementName: string, 
    customElementInputs: Record<string, string>,
    customElementTransclusion: string
  }) {
    const container = this.productNavContainer.nativeElement;
    
    const remoteButton = this.renderer.createElement(customElementName);
    
    this.renderer.appendChild(container, remoteButton);

    if (customElementInputs && Object.keys(customElementInputs).length) {
      Object.entries(customElementInputs).forEach(([key, value]) => {
        this.renderer.setAttribute(remoteButton, key, String(value));
      })
    }

    if (customElementTransclusion && customElementTransclusion.length) {
      const buttonTag = remoteButton.querySelector('button');
      const projectedContent = this.renderer.createText(customElementTransclusion);
      this.renderer.appendChild(buttonTag, projectedContent);
    }
    
    this.groupButtonsDirective.triggerGrouping()

    this.renderer.listen(remoteButton, 'buttonClick', (_: CustomEvent) => {
      //
    });
  }

  check() {
    // this.router.navigateByUrl('au')
    const routePathBusEvent: BusEvent = {
      event: "MOCK",
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      // to: `au@web`,
      to: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      payload: {},
    }
    this.eventBusPusher(routePathBusEvent);
  }
  tick() {
    this.router.navigateByUrl('/faq/ticket')
  }
  send2au(){
    const routePathBusEvent: BusEvent = {
      event: "ROUTER_PATH",
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: `au@web`,
      payload: {},
    }
    this.eventBusPusher(routePathBusEvent);
  }
}
