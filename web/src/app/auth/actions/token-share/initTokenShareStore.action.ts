import { Inject, Injectable } from '@angular/core';
import { BusEvent, HOST_NAME } from 'typlib';
import { EVENT_BUS_PUSHER } from '../../auth.component';
import { ConfigService } from '../../services/config.service';
import { IAuthAction } from '../../models/action.model';
import { ExternalUpdates, TokenShareService } from '../../services/token-share.service';

@Injectable()
export class InitTokenShareStoreAction implements IAuthAction {
  constructor(
    // @Inject(HOST_NAME) private readonly hostName: string,
    // @Inject(ConfigService) private ConfigServ: ConfigService,
    // @Inject(EVENT_BUS_PUSHER)
    // private eventBusPusher: (busEvent: BusEvent) => void,
    private _tokenShareService: TokenShareService
  ) {}

  public execute(ids: string[]): ExternalUpdates {
    this._tokenShareService.addProjects(ids)
    this._tokenShareService.showStore()
    
    return this._tokenShareService.getStore()
  }
}

