import { Inject, Injectable } from '@angular/core';
import { BusEvent, EVENT_BUS_PUSHER, HOST_NAME } from 'typlib';
import { IAuthAction } from '../../models/action.model';

import { ExternalUpdateBody, ExternalUpdates, TokenShareService } from '../../services/token-share.service';
import { filter, Observable, take } from 'rxjs';

@Injectable()
export class ListenValidateSharedTokenAction implements IAuthAction {
  constructor(
    @Inject(HOST_NAME) private readonly hostName: string,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void,
    private _tokenShareService: TokenShareService
  ) {}

  public execute(): Observable<any> {
    return this._tokenShareService.listenStore()
      .pipe(
        filter((res: ExternalUpdates) => {
          if (Object.values(res).length === 1 && Object.values(res)[0].projectId === 'au') { // todo remove au from share config
            return false
          } else {
            return Object.values(res).every((el: ExternalUpdateBody) => el.isValidated)  
          }
        }),
        take(1),
      )
  }
}
