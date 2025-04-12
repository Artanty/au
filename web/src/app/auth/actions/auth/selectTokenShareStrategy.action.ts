import { Inject, Injectable } from "@angular/core";
import { IViewState, ViewService } from "../../services/view.service";
import { IAuthAction } from "../../models/action.model";
import { ConfigService } from "../../services/config.service";
import { TokenShareStrategyService } from "../../strategies/token-share-strategy.service";

@Injectable()
export class SelectTokenShareStrategyAction implements IAuthAction {

  constructor (
    private readonly _configService: ConfigService,
    private readonly _tokenShareStrategyService: TokenShareStrategyService,
    @Inject(ViewService) private readonly ViewServ: ViewService
  ) {}

  public execute (isVisible?: boolean) {
    // const viewState: IViewState = {
    //   scope: 'VIEW',
    //   action: 'DISPLAY_LOADER',
    //   payload: {
    //     isVisible
    //   }
    // }
    // this.ViewServ.setViewState(viewState)
    const config = this._configService.getConfig()
    this._tokenShareStrategyService.select(config!.tokenShareStrategy)
  }

}
