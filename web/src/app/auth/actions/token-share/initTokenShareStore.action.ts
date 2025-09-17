import { Inject, Injectable } from '@angular/core';
import { BusEvent, HOST_NAME } from 'typlib';
import { EVENT_BUS_PUSHER } from '../../auth.component';
import { IAuthAction } from '../../models/action.model';
import { ExternalUpdates, TokenShareService } from '../../services/token-share.service';

@Injectable()
export class InitTokenShareStoreAction implements IAuthAction {
  constructor(
    private _tokenShareService: TokenShareService
  ) {}

  public execute(ids: string[]): ExternalUpdates {
    this._tokenShareService.addProjects(ids)
 
    return this._tokenShareService.getRequiredProjects()
  }
}

