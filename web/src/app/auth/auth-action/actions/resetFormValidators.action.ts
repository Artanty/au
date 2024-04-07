import { Inject, Injectable } from "@angular/core";
import { IViewState, ViewService } from "../../services/view.service";
import { IAuthAction } from "../auth-action.model";

@Injectable()
export class ResetFormValidatorsAction implements IAuthAction {
  constructor (
    @Inject(ViewService) private readonly ViewServ: ViewService
  ) {}

  public execute () {
    const viewState: IViewState = {
      scope: 'FORM',
      action: 'RESET_VALIDATORS'
    }
    this.ViewServ.setViewState(viewState)
  }

}
