import { Injectable, Injector } from '@angular/core';
import { IAuthStrategy } from '../models/strategy.model';
import { BackendAuthStrategy } from './auth/backend-auth.strategy';
import { BackendTokenStrategy } from './auth/backend-token.strategy';
import { dd } from '../utilites/dd';
import { AuthAndShareStrategy } from './auth-done/auth-and-share.strategy';


@Injectable()
export class AuthDoneStrategyService {

  strategy!: IAuthStrategy;

  constructor(
    private injector: Injector,
  ) {}

  public select(strategy: string) {
    try {
      this.strategy = this.injector.get<IAuthStrategy>(
        AuthStrategyMap.get(strategy)
      );
      if (!this.strategy) {
        throw new Error(
          `strategy '${strategy}' doesn't exist in StrategyMap`
        );
      }
      this.strategy.runScenario('init');
    } catch (err) {
      throw new Error(
        (err instanceof Error ? err.message : String(err))
      );
    }
  }
}

export const AuthStrategyMap = new Map<string, any>([
  ['AUTH_AND_SHARE', AuthAndShareStrategy],
]);
