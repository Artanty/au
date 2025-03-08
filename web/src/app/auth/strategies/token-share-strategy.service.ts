import { Injectable, Injector } from "@angular/core";
import { SaveTempDuplicateStrategy } from "./token-share/save-temp-duplicate.strategy";
import { IAuthStrategy } from "../models/strategy.model";

@Injectable()

export class TokenShareStrategyService {

  private strategy!: IAuthStrategy;

  constructor(
      private injector: Injector,
  ) {}

  public select(tokenShareStrategy: string) {
    try {
      this.strategy = this.injector.get<IAuthStrategy>(
        TokenShareStrategyMap.get(tokenShareStrategy)
      )
      if (!this.strategy)
        throw new Error(
          `strategy '${tokenShareStrategy}' doesn't exist in StrategyMap`
        );
      this.strategy.runScenario('init');
    } catch (err) {
      throw new Error(
          (err instanceof Error ? err.message : String(err))
      );
    }
  }
}

export const TokenShareStrategyMap = new Map<string, any>([
  ['saveTempDuplicate', SaveTempDuplicateStrategy],
]);