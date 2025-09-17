import { Inject, Injectable } from "@angular/core";
import { IAuthAction } from "../../models/action.model";
import { AppStateService, ViewState } from "../../services/app-state.service";

@Injectable()
export class ResetFormValidatorsAction implements IAuthAction {
  constructor(
    private _appStateService: AppStateService
  ) {}

  public execute() {
    const viewState: ViewState = {
      scope: 'FORM',
      action: 'RESET_VALIDATORS'
    }
    this._appStateService.view.next(viewState)
  }

}
