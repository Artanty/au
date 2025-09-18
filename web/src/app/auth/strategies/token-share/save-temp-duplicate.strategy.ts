import { Injectable, Injector } from "@angular/core";
import { IAuthStrategy } from "../../models/strategy.model";
import { AskProjectIdsAction } from "../../actions/token-share/askProjectsIds.action";
import { IAuthAction } from "../../models/action.model";
import { StoreBackUrlsAction } from "../../actions/token-share/storeBackUrls.action";
import { AskBackUrlsAction } from "../../actions/token-share/askBackUrls.action";
import { filter, from, map, mergeMap, of, switchMap, take } from "rxjs";
import { InitTokenShareStoreAction } from "../../actions/token-share/initTokenShareStore.action";
import { ShareTokenAction } from "../../actions/token-share/shareToken.action";
import { ValidateSharedTokenAction } from "../../actions/token-share/validateSharedToken.action";
import { ExternalUpdateBody, ExternalUpdates } from "../../services/token-share.service";
import { SetProductBtnLoadingAction } from "../../actions/token-share/setProductBtnLoading.action";
import { SetProductBtnReadyAction } from "../../actions/token-share/setProductBtnReady.action";
import { SetProductBtnLockedAction } from "../../actions/token-share/setProductBtnLocked.action";
import { AppStateService, UserAction } from "../../services/app-state.service";
import { ResetTokenShareAction } from "../../actions/token-share/resetTokenShare.action";
import { GetRequiredProjectsIdsAction } from "../../actions/token-share/getRequiredProjectsIds.action";


@Injectable()
export class SaveTempDuplicateStrategy implements IAuthStrategy {

  constructor(
    private injector: Injector,
    private _appStateService: AppStateService
  ) {
    this._appStateService.userAction.listen
      .pipe(filter(Boolean))
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
      case 'LOGOUT':
        this.handleLogout();
        break;
      
      default:
        throw new Error(`Unknown save-temp-duplicate taken-share scenario: ${scenario}`);
    }
  }
  
  /**
   * 1 забрать конфиг ASK_PROJECTS_IDS,
   * 2 записать их в стор для заполнения INIT_TOKEN_SHARE_STORE
   * 3 спросить адреса бэков всех проектов ASK_BACK_URLS
   * 4 добавить полученные адреса в стор
   * 5 оставить только нужные 
   * 6 разослать запросы на бэки
   */
  handleInitScenario() {
    /**
     * todo: 
     * check on host that all the remotes are loaded.
     * if one is not - remove it from projectIds for @au
     * try to reconnect it for 10 sec? )
     */
    const projectIds$ = this.injector
      .get<IAuthAction>(AuthActionMap.get('ASK_PROJECTS_IDS'))
      .execute()

    projectIds$.pipe(take(1)).subscribe((projectIds: string[]) => {
      
      const externals = this.injector
        .get<IAuthAction>(AuthActionMap.get('INIT_TOKEN_SHARE_STORE'))
        .execute(projectIds)

      const requiredProjectsIds: string[] = this.injector
        .get<IAuthAction>(AuthActionMap.get('GET_REQUIRED_PROJECTS_IDS'))
        .execute()
      
      of(requiredProjectsIds as string[]).pipe(
        mergeMap(requiredProjectsIds => from(requiredProjectsIds))).subscribe(requiredProjectsId =>
          this.injector
            .get<IAuthAction>(AuthActionMap.get('SET_PRODUCT_BTN_LOCKED'))
            .execute(requiredProjectsId))
    
      
      this.injector
        .get<IAuthAction>(AuthActionMap.get('ASK_BACK_URLS'))
        .execute(requiredProjectsIds)
        
        .subscribe((res: any) => { 
          const store = this.injector
            .get<IAuthAction>(AuthActionMap.get('STORE_BACK_URLS'))
            .execute(res)
          of(store as ExternalUpdates).pipe(
            mergeMap(originalData => from(Object.values(originalData)))
          )
            
            .subscribe((remote: ExternalUpdateBody | any) => {
              const sharedToken = this.injector
                .get<IAuthAction>(AuthActionMap.get('SHARE_TOKEN'))
                .execute(remote) 
              
              sharedToken.pipe(
                switchMap(remote => 
                  this.injector
                    .get<IAuthAction>(AuthActionMap.get('SET_PRODUCT_BTN_LOADING'))
                    .execute(remote)
                )
              ).subscribe((remote: ExternalUpdateBody) => {
                this.injector
                  .get<IAuthAction>(AuthActionMap.get('VALIDATE_SHARED_TOKEN'))
                  .execute(remote).subscribe((remote: ExternalUpdateBody) => {
                    this.injector
                      .get<IAuthAction>(AuthActionMap.get('SET_PRODUCT_BTN_READY'))
                      .execute(remote)
                  })
              })
            })
        })
    })
  }

  handleLogout() {
    const externals = this.injector
      .get<IAuthAction>(AuthActionMap.get('RESET_TOKEN_SHARE'))
      .execute()
  }
}

export const AuthActionMap = new Map<string, any>([
  ['ASK_PROJECTS_IDS', AskProjectIdsAction],
  ['INIT_TOKEN_SHARE_STORE', InitTokenShareStoreAction],
  ['GET_REQUIRED_PROJECTS_IDS', GetRequiredProjectsIdsAction],
  ['ASK_BACK_URLS', AskBackUrlsAction],
  ['STORE_BACK_URLS', StoreBackUrlsAction],
  ['SHARE_TOKEN', ShareTokenAction],
  ['VALIDATE_SHARED_TOKEN', ValidateSharedTokenAction],
  ['SET_PRODUCT_BTN_LOADING', SetProductBtnLoadingAction],
  ['SET_PRODUCT_BTN_READY', SetProductBtnReadyAction],
  ['SET_PRODUCT_BTN_LOCKED', SetProductBtnLockedAction],
  ['RESET_TOKEN_SHARE', ResetTokenShareAction]
]);


