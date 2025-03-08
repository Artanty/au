import { Inject, Injectable } from "@angular/core";
import { IViewState, ViewService } from "../../services/view.service";
import { IAuthAction } from "../../models/action.model";

@Injectable()
export class DisplayLoaderAction implements IAuthAction {

  constructor (
    @Inject(ViewService) private readonly ViewServ: ViewService
  ) {}

  public execute (isVisible: boolean) {
    const viewState: IViewState = {
      scope: 'VIEW',
      action: 'DISPLAY_LOADER',
      payload: {
        isVisible
      }
    }
    this.ViewServ.setViewState(viewState)
  }

}
