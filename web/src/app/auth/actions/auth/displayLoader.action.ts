import { Inject, Injectable } from "@angular/core";

import { IAuthAction } from "../../models/action.model";
import { AppStateService, ViewState } from "../../services/app-state.service";

@Injectable()
export class DisplayLoaderAction implements IAuthAction {

  constructor(
    private _appStateService: AppStateService
  ) {}

  public execute(isVisible: boolean) {
    const viewState: ViewState = {
      scope: 'VIEW',
      action: 'DISPLAY_LOADER',
      payload: {
        isVisible
      }
    }
    this._appStateService.view.next(viewState)
  }

}
