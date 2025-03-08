import { Inject, Injectable } from "@angular/core";
import { IViewState, ViewService } from "../../services/view.service";
import { HttpErrorResponse } from '@angular/common/http';
import { IAuthAction } from "../../models/action.model";

@Injectable()
export class DisplayInvalidDataErrorAction implements IAuthAction {

  constructor (
    @Inject(ViewService) private readonly ViewServ: ViewService
  ) {}


  public execute (err: HttpErrorResponse) {

    const errMessage = this._translateErrMessage(err.error.message)
    const viewState: IViewState = {
      scope: 'FORM',
      action: 'DISPLAY_ERROR',
      payload: {
        message: errMessage || 'Неверный логин или пароль'
      }
    }
    this.ViewServ.setViewState(viewState)
  }

  private _translateErrMessage (message: string) {
    return message === 'Invalid username or password' ? 'Неверный логин или пароль' : 'Неизвестная ошибка'
  }

}
