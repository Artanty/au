import { Inject, Injectable } from "@angular/core";
import { IAuthAction } from "../../models/action.model";
import { TokenShareStrategyService } from "../../strategies/token-share-strategy.service";
import { ConfigService } from "../../services/config.service";

@Injectable()
export class InitTokenStrategyAction implements IAuthAction {

  constructor(
    @Inject(TokenShareStrategyService) private readonly _tokenShareStrategyService: TokenShareStrategyService,
    @Inject(ConfigService) private _configServ: ConfigService
  ) {}

  public execute() {
    const tokenShareStrategy = this._configServ.getTokenShareStrategy()
    this._tokenShareStrategyService.select(tokenShareStrategy)
  }

}
