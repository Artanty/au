import { Inject, Injectable, Injector } from "@angular/core";
import { ListenGrantAuthAction } from "../../actions/auth-done/listenGrantAuth.action";
import { ListenValidateSharedTokenAction } from "../../actions/auth-done/listenValidateSharedToken.action";
import { SendAuthDoneEventAction } from "../../actions/auth-done/sendAuthDoneEvent.action";
import { SetProductBtnCollapsedAction } from "../../actions/auth-done/setProductBtnCollapsed.action";
import { IAuthAction } from "../../models/action.model";
import { IAuthStrategy } from "../../models/strategy.model";
import { filter, forkJoin, Subject, takeUntil } from "rxjs";
import { AppStateService, UserAction } from "../../services/app-state.service";
import { PipelineHelperService } from "../../services/pipeline-helper.service";

@Injectable()
export class AuthAndShareStrategy implements IAuthStrategy {
  private unsubscribe$ = new Subject<void>();

  constructor(
    private pipeline: PipelineHelperService,
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
      case 'INIT':
        this.handleInitScenario();
        break;
      case 'LOGIN':
        this.handleInitScenario();
        break;
      case 'SEND_SIGNUP_REQUEST':
        this.handleInitScenario();
        break;

      default:
      // throw new Error(`Unknown ${this.constructor.name} scenario: ${scenario}`);
    }
  }
  
  handleInitScenario() {
    
    const auth$ = this.pipeline.exec$('LISTEN_GRANT_AUTH');
    const tokenValid$ = this.pipeline.exec$('LISTEN_VALIDATE_SHARE_TOKEN');

    forkJoin([auth$, tokenValid$]).subscribe(res => {
      this.pipeline.exec$('SEND_AUTH_DONE_EVENT');
      this.pipeline.exec$('SET_PRODUCT_BTN_COLLAPSED');
      this.pipeline.exec$('GO_TO_LAST_URL');
    })
  }
}

export const AuthActionMap = new Map<string, any>([
  ['LISTEN_GRANT_AUTH', ListenGrantAuthAction],
  ['LISTEN_VALIDATE_SHARE_TOKEN', ListenValidateSharedTokenAction],
  ['SEND_AUTH_DONE_EVENT', SendAuthDoneEventAction],
  ['SET_PRODUCT_BTN_COLLAPSED', SetProductBtnCollapsedAction]
]);
