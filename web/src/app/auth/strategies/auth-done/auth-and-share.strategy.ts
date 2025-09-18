import { Inject, Injectable, Injector } from "@angular/core";
import { ListenGrantAuthAction } from "../../actions/auth-done/listenGrantAuth.action";
import { ListenValidateSharedTokenAction } from "../../actions/auth-done/listenValidateSharedToken.action";
import { SendAuthDoneEventAction } from "../../actions/auth-done/sendAuthDoneEvent.action";
import { SetProductBtnCollapsedAction } from "../../actions/auth-done/setProductBtnCollapsed.action";
import { IAuthAction } from "../../models/action.model";
import { IAuthStrategy } from "../../models/strategy.model";
import { forkJoin, Subject } from "rxjs";
import { AppStateService } from "../../services/app-state.service";

@Injectable()
export class AuthAndShareStrategy implements IAuthStrategy {
  private unsubscribe$ = new Subject<void>();

  constructor(
    
    private injector: Injector,
   
  ) {}

  runScenario(scenario: string) {
    switch (scenario) {
      case 'init':
        this.handleInitScenario();
        break;
      default:
        throw new Error(`Unknown ${this.constructor.name} scenario: ${scenario}`);
    }
  }
  //todo fix: is not called after logout
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
