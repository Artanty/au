import { Inject, Injectable } from "@angular/core";
import { ViewService } from "../../services/view.service";
import { IAuthAction } from "../auth-action.model";

@Injectable()
export class DisplayLoginFormAction implements IAuthAction {

  constructor (
    @Inject(ViewService) private readonly ViewServ: ViewService
  ) {}

  public execute () {
    this.ViewServ.setViewState({ action: 'LOGIN' })
  }

}
