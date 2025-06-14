import { Inject, Injectable } from '@angular/core';
import { BusEvent, EVENT_BUS_PUSHER, HOST_NAME } from 'typlib';
import { ConfigService } from '../../services/config.service';
import { IAuthAction } from '../../models/action.model';
import { AuthStateService } from '../../services/auth-state.service';
import { Token, TokenStoreService } from '../../services/token-store.service';
import { dd } from '../../utilites/dd';

@Injectable()
export class SendAuthDoneEventAction implements IAuthAction {
  constructor(
    @Inject(HOST_NAME) private readonly hostName: string,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void,
    private _authStateService: AuthStateService,
    private _tokenStoreService: TokenStoreService,
  ) {}

  public execute() {
    
    this._storeTokenFromLocalStorage()

    const busEvent: BusEvent = {
      from: process.env['PROJECT_ID']!,
      to: this.hostName,
      event: 'AUTH_DONE',
      payload: {},
    };

    this.eventBusPusher(busEvent);

    this._authStateService.setAuthState(true)

    
  }

  private _storeTokenFromLocalStorage() {
    const storeItem: Token = {
      access: localStorage.getItem(`accessToken`) as string,
      refresh: localStorage.getItem(`refreshToken`) as string
    }
    this._tokenStoreService.setTokenStore(storeItem)
  }
}
