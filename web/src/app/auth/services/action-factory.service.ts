import { Injectable, Injector } from '@angular/core';
import { IAuthAction } from './../models/action.model';
import { AskProjectIdsAction } from '../actions/token-share/askProjectsIds.action';
import { InitTokenShareStoreAction } from '../actions/token-share/initTokenShareStore.action';
import { GetRequiredProjectsIdsAction } from '../actions/token-share/getRequiredProjectsIds.action';
import { AskBackUrlsAction } from '../actions/token-share/askBackUrls.action';
import { StoreBackUrlsAction } from '../actions/token-share/storeBackUrls.action';
import { ShareTokenAction } from '../actions/token-share/shareToken.action';
import { ValidateSharedTokenAction } from '../actions/token-share/validateSharedToken.action';
import { SetProductBtnLoadingAction } from '../actions/token-share/setProductBtnLoading.action';
import { SetProductBtnReadyAction } from '../actions/token-share/setProductBtnReady.action';
import { SetProductBtnLockedAction } from '../actions/token-share/setProductBtnLocked.action';
import { ResetTokenShareAction } from '../actions/token-share/resetTokenShare.action';
import { ActionType } from '../models/action-types';
import { GetExternalsForTokenShare } from '../actions/token-share/getExternalsForTokenShare.action';
import { SaveCurrentUrlAction } from '../actions/auth/saveCurrentUrl.action';
import { GoToLastUrlAction } from '../actions/auth/goToLastUrl.action';
import { ListenGrantAuthAction } from '../actions/auth-done/listenGrantAuth.action';
import { ListenValidateSharedTokenAction } from '../actions/auth-done/listenValidateSharedToken.action';
import { SendAuthDoneEventAction } from '../actions/auth-done/sendAuthDoneEvent.action';
import { SetProductBtnCollapsedAction } from '../actions/auth-done/setProductBtnCollapsed.action';


type ActionConstructor = new (...args: any[]) => { execute(...args: unknown[]): unknown };

@Injectable()
export class ActionFactoryService {
  private actionMap!: Map<ActionType, ActionConstructor>;

  constructor(private injector: Injector) {
    this.actionMap = new Map<ActionType, ActionConstructor>([
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
      ['RESET_TOKEN_SHARE', ResetTokenShareAction],
      ['GET_EXTERNALS_FOR_TOKEN_SHARE', GetExternalsForTokenShare],
      ['SAVE_CURRENT_URL', SaveCurrentUrlAction],
      // auth-and-share:
      ['LISTEN_GRANT_AUTH', ListenGrantAuthAction],
      ['LISTEN_VALIDATE_SHARE_TOKEN', ListenValidateSharedTokenAction],
      ['SEND_AUTH_DONE_EVENT', SendAuthDoneEventAction],
      ['SET_PRODUCT_BTN_COLLAPSED', SetProductBtnCollapsedAction],
      ['GO_TO_LAST_URL', GoToLastUrlAction]
    ]);
  }

  getAction<T extends IAuthAction>(actionType: ActionType): T {
    const actionClass = this.actionMap.get(actionType);
    if (!actionClass) {
      throw new Error(`Action ${actionType} not found in action map`);
    }
    return this.injector.get(actionClass);
  }

  executeAction<R>(actionType: ActionType, ...args: unknown[]): R {
    const action = this.getAction(actionType);
    return action.execute(...args);
  }
}