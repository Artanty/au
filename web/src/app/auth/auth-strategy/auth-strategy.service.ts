import { Inject, Injectable, Injector } from "@angular/core";
import { filter } from "rxjs";
import { IAuthDto } from "typlib";
import { BackendAuthStrategy } from './strategies/backend-auth.strategy'
import { IAuthStrategy } from "./auth-strategy.model";
import { ConfigService } from "../services/config.service";

@Injectable()
export class AuthStrategyService {
  authStrategy!: IAuthStrategy
  constructor(
    private injector: Injector,
    @Inject(ConfigService) private ConfigServ: ConfigService
  ) {
    this.ConfigServ.listenConfig()
    .pipe(
      filter(Boolean),
    )
    .subscribe((dto: IAuthDto) => {
      try {
        this.authStrategy = this.injector.get<IAuthStrategy>(AuthStrategyMap.get(dto.authStrategy));
        this.authStrategy.runScenario(dto.status);
      } catch (err) {
        throw new Error(`status '${dto.authStrategy}' doesn't exist in AuthStrategyMap`)
      }
    });
  }
}

export const AuthStrategyMap = new Map<string, any>([
  ['backend', BackendAuthStrategy],
])
