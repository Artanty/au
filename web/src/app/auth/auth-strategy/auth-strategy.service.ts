import { Inject, Injectable, Injector } from '@angular/core';
import { filter } from 'rxjs';

import { IAuthDto } from '../auth.component';
import { ConfigService } from '../services/config.service';
import { IAuthStrategy } from './auth-strategy.model';
import { BackendAuthStrategy } from './strategies/backend-auth.strategy';

@Injectable()
export class AuthStrategyService {
  authStrategy!: IAuthStrategy;
  constructor(
    private injector: Injector,
    @Inject(ConfigService) private ConfigServ: ConfigService
  ) {
    this.ConfigServ.listenConfig()
      .pipe(filter(Boolean))
      .subscribe((dto: IAuthDto) => {
        try {
          this.authStrategy = this.injector.get<IAuthStrategy>(
            AuthStrategyMap.get(dto.authStrategy)
          );
          if (!this.authStrategy)
            throw new Error(
              `strategy '${dto.authStrategy}' doesn't exist in AuthStrategyMap`
            );
          this.authStrategy.runScenario(dto.status);
        } catch (err) {
          throw new Error(
            'AuthStrategyService: ' +
              (err instanceof Error ? err.message : String(err))
          );
        }
      });
  }
}

export const AuthStrategyMap = new Map<string, any>([
  ['backend', BackendAuthStrategy],
]);
