import { Inject, Injectable } from "@angular/core";

import { HttpErrorResponse } from '@angular/common/http';
import { IAuthAction } from "../../models/action.model";
import { AppStateService, ViewState } from "../../services/app-state.service";

@Injectable()
export class DisplayInvalidDataErrorAction implements IAuthAction {

  constructor(
    private _appStateService: AppStateService
  ) {}


  public execute(err: HttpErrorResponse) {

    const errMessage = this._translateErrMessage(err.error.message)
    const viewState: ViewState = {
      scope: 'FORM',
      action: 'DISPLAY_ERROR',
      payload: {
        message: errMessage || 'Неверный логин или пароль'
      }
    }
    this._appStateService.view.next(viewState)
  }

  private _translateErrMessage(message: string) {
    return message === 'Invalid username or password' ? 'Неверный логин или пароль' : 'Неизвестная ошибка'
  }

}
