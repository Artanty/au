import { Inject, Injectable } from '@angular/core';
import { BusEvent, EVENT_BUS_PUSHER, HOST_NAME } from 'typlib';
import { ConfigService } from '../../services/config.service';
import { IAuthAction } from '../../models/action.model';
import { AuthStateService } from '../../services/auth-state.service';
import { Token, TokenStoreService } from '../../services/token-store.service';
import { dd } from '../../utilites/dd';

import { ExternalUpdateBody, ExternalUpdates, TokenShareService } from '../../services/token-share.service';
import { filter, Observable, share, take } from 'rxjs';

@Injectable()
export class ListenValidateSharedTokenAction implements IAuthAction {
  constructor(
    @Inject(HOST_NAME) private readonly hostName: string,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void,
    private _authStateService: AuthStateService,
    private _tokenStoreService: TokenStoreService,
    private _tokenShareService: TokenShareService
  ) {}

  public execute(): Observable<any> {
    return this._tokenShareService.listenStore()
      .pipe(
        filter((res: ExternalUpdates) => {
          return Object.values(res).every((el: ExternalUpdateBody) => el.isValidated)
        }),        
        take(1),
      )
  }
}
