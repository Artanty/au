import { Inject, Injectable } from "@angular/core";
import { ViewService } from "../../services/view.service";
import { IAuthAction } from "../../models/action.model";
import { CoreService } from "../../services/core.service";
import { Router } from "@angular/router";
import { buildUrl } from "../../services/route-builder";

@Injectable()
export class DisplayLoginFormAction implements IAuthAction {

  constructor (
    @Inject(ViewService) private readonly ViewServ: ViewService,
    @Inject(CoreService) private readonly _coreService: CoreService,
    @Inject(Router) private readonly _router: Router
  ) {}

  public execute () {
    
    this._router.navigateByUrl(buildUrl('login', this._coreService.getRouterPath()))
    // this.ViewServ.setViewState({ action: 'LOGIN' })
  }

}
