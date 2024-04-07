
import { IAuthDto, PRODUCT_NAME } from "typlib";
import { IAuthAction } from "../auth-action.model";
import { Inject, Injectable } from "@angular/core";
import { EVENT_BUS_PUSHER } from "../../auth.component";
import { ConfigService } from "../../services/config.service";

@Injectable()
export class GrantAccessAction implements IAuthAction {

  constructor (
    @Inject(PRODUCT_NAME) private readonly productName: string,
    @Inject(ConfigService) private ConfigServ: ConfigService,
    @Inject(EVENT_BUS_PUSHER) private eventBusPusher: (authDto: IAuthDto) => void,
  ) {}

  public execute () {

    const authDto: IAuthDto = {
      productName: this.productName,
      authStrategy: this.ConfigServ.getConfigAuthStrategy(),
      from: 'auth',
      status: 'ACCESS_GRANTED',
      payload: {}
    };

    this.eventBusPusher(authDto)
  }

}
