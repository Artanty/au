import { Inject, Injectable, Injector } from '@angular/core';
import { filter } from 'rxjs';

import { IAuthDto } from '../auth.component';
import { ConfigService } from '../services/config.service';
import { IAuthStrategy } from '../models/strategy.model';
import { BackendAuthStrategy } from './auth/backend-auth.strategy';

@Injectable()
export class AuthStrategyService {

  authStrategy!: IAuthStrategy;

  constructor(
    private injector: Injector,
    @Inject(ConfigService) private ConfigServ: ConfigService
  ) {
    /**
     * 1 в подписку главного компонента приходит бас евент 'authStrategy'
     * с параметрами, по которым будет производиться аутентификация
     * Когда в конфиг попадает значение - начинает работать эта стратегия.
     * проблемы:
     *  - зачем подписываться на изменение конфига? это делается один раз.
     * лучше явно запустить эту стратегию при получении 'authStrategy' из
     * AuthComponent
     *  - сохранения конфига - мб это часть стратегии а не наоборот?
     * как это все протестировать изолированно?
     * сделать приложение-хост?
     * - запуск той или иной стратегии приходит из вне. это норм?
     */
    this.ConfigServ.listenConfig()
      .pipe(filter(Boolean))
      .subscribe((dto: IAuthDto) => {
        // console.log(dto)
        try {
          this.authStrategy = this.injector.get<IAuthStrategy>(
            AuthStrategyMap.get(dto.authStrategy)
          );
          if (!this.authStrategy)
            throw new Error(
              `strategy '${dto.authStrategy}' doesn't exist in AuthStrategyMap`
            );
          this.authStrategy.runScenario(dto.status); // todo check for remove
        } catch (err) {
          throw new Error(
            // 'AuthStrategyService: ' +
              (err instanceof Error ? err.message : String(err))
          );
        }
      });
  }
}

export const AuthStrategyMap = new Map<string, any>([
  ['backend', BackendAuthStrategy],
]);
