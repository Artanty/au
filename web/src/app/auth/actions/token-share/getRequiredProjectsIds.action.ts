import { Inject, Injectable } from '@angular/core';
import { BusEvent, HOST_NAME } from 'typlib';
import { EVENT_BUS_PUSHER } from '../../auth.component';
import { ConfigService } from '../../services/config.service';
import { IAuthAction } from '../../models/action.model';
import { ExternalUpdates, TokenShareService } from '../../services/token-share.service';
/**
 * @deprecated use InitTokenShareStoreAction
 * */
@Injectable()
export class GetRequiredProjectsIdsAction implements IAuthAction {
  constructor(
    private _tokenShareService: TokenShareService
  ) {}

  public execute(): string[] {

    return this._tokenShareService.getRequiredProjectsIds()

  }
}

