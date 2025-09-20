import { Injectable, OnDestroy } from "@angular/core";
import { IAuthStrategy } from "../../models/strategy.model";
import { ExternalUpdateBody, ExternalUpdates } from "../../services/token-share.service";
import { AppStateService, UserAction } from "../../services/app-state.service";
import { PipelineHelperService } from "../../services/pipeline-helper.service";
import { filter, from, mergeMap, of, Subscription, switchMap, take } from "rxjs";
import { dd } from "../../utilites/dd";

@Injectable()
export class SaveTempDuplicateStrategy implements IAuthStrategy, OnDestroy {
  private subscription: Subscription = new Subscription();

  constructor(
    private _pipeline: PipelineHelperService,
    private appStateService: AppStateService
  ) {
    
    const sub = this.appStateService.userAction.listen
      .pipe(filter(Boolean))
      .subscribe((res: UserAction) => this.runScenario(res.event))
    
    this.subscription.add(sub)
  }

  runScenario(scenario: string) {
    dd('scenario: ' + scenario)
    
    switch (scenario) {
      case 'INIT':
      case 'LOGIN':
        this.handleInitScenario();
        break;
      case 'LOGOUT':
        this.handleLogout();
        break;
      default:
        console.error(`Unknown scenario: ${scenario}`);
    }
  }

  private handleInitScenario(): void {
    const sub = this._pipeline.exec$<string[]>('ASK_PROJECTS_IDS')
      .pipe(
        switchMap(projectIds => {
          this._pipeline.exec('INIT_TOKEN_SHARE_STORE', projectIds);
          const requiredProjectsIds = this._pipeline.exec<string[]>('GET_REQUIRED_PROJECTS_IDS');
          this._pipeline.forEachExec('SET_PRODUCT_BTN_LOCKED', requiredProjectsIds);
        
          return of(requiredProjectsIds);
        }),
        switchMap(requiredProjectsIds => 
          this._pipeline.exec$<ExternalUpdates>('ASK_BACK_URLS', requiredProjectsIds)
        ),
        switchMap(backUrls => {
          this._pipeline.exec('STORE_BACK_URLS', backUrls);
          const externals = this._pipeline.exec<ExternalUpdateBody[]>('GET_EXTERNALS_FOR_TOKEN_SHARE')

          return this.processAllRemotes(externals)
        }),
      
      ).subscribe({
        error: (error) => console.error('Init scenario failed:', error)
      })

    this.subscription.add(sub)
  }

  private processAllRemotes(externals: ExternalUpdateBody[]) {
    return from(externals).pipe(
      mergeMap(remote => this.processRemote(remote))
    );
  }

  private processRemote(remote: ExternalUpdateBody) {
    return this._pipeline.exec$('SHARE_TOKEN', remote).pipe(
      switchMap(sharedRemote => {
        this._pipeline.exec('SET_PRODUCT_BTN_LOADING', sharedRemote);
        return of(sharedRemote);
      }),
      switchMap(sharedRemote => 
        this._pipeline.exec$('VALIDATE_SHARED_TOKEN', sharedRemote)
      ),
      switchMap(validatedRemote => {
        this._pipeline.exec('SET_PRODUCT_BTN_READY', validatedRemote);
        return of(validatedRemote);
      })
    );
  }

  private handleLogout(): void {
    this._pipeline.exec('SAVE_CURRENT_URL');
    
    this._pipeline.exec('RESET_TOKEN_SHARE');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}