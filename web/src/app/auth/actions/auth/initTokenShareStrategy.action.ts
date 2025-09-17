import { Inject, Injectable } from "@angular/core";
import { IAuthAction } from "../../models/action.model";
import { TokenShareStrategyService } from "../../strategies/token-share-strategy.service";
import { AppStateService } from "../../services/app-state.service";


@Injectable()
export class InitTokenStrategyAction implements IAuthAction {

  constructor(
    @Inject(TokenShareStrategyService) private readonly _tokenShareStrategyService: TokenShareStrategyService,
    private _appStateService: AppStateService
  ) {}

  public execute() {
    const tokenShareStrategy = this._appStateService.authConfig.req.tokenShareStrategy;
    this._tokenShareStrategyService.select(tokenShareStrategy);
  }

}
