import { Inject, Injectable } from '@angular/core';
import { BusEvent, HOST_NAME } from 'typlib';
import { EVENT_BUS_PUSHER } from '../../auth.component';
import { ConfigService } from '../../services/config.service';
import { IAuthAction } from '../../models/action.model';
import { TokenShareService } from '../../services/token-share.service';
import { BackUrl } from './askBackUrls.action';


@Injectable()
export class StoreBackUrlsAction implements IAuthAction {
  constructor(
    // @Inject(HOST_NAME) private readonly hostName: string,
    // @Inject(ConfigService) private ConfigServ: ConfigService,
    private _tokenShareService: TokenShareService,
    // @Inject(EVENT_BUS_PUSHER)
    // private eventBusPusher: (busEvent: BusEvent) => void
  ) {}

  public execute(data: BackUrl[]) {
    data.forEach((el: BackUrl) => {
      this._tokenShareService.setBackUrl(el.project_id, el.back_url)
    })
    

    return this._tokenShareService.getStore()
  }
}