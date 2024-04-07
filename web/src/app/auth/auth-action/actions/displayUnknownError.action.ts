import { Inject, Injectable } from "@angular/core";
import { IViewState, ViewService } from "../../services/view.service";
import { IAuthAction } from "../auth-action.model";
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class DisplayUnknownErrorAction implements IAuthAction {

  constructor (
    @Inject(ViewService) private readonly ViewServ: ViewService
  ) {}

  public execute (err: HttpErrorResponse) {

    const viewState: IViewState = {
      scope: 'FORM',
      action: 'DISPLAY_ERROR',
      payload: {
        message: err.error.message || 'Неизвестная ошибка'
      }
    }
    this.ViewServ.setViewState(viewState)
  }

}
