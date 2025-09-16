import { Inject, Injectable } from '@angular/core';
import { BusEvent, EVENT_BUS_PUSHER, HOST_NAME } from 'typlib';
import { ConfigService } from '../../services/config.service';
import { IAuthAction } from '../../models/action.model';
import { AuthStateService } from '../../services/auth-state.service';
import { Token, TokenStoreService } from '../../services/token-store.service';
import { dd } from '../../utilites/dd';

@Injectable()
export class GrantAuthAction implements IAuthAction {
  constructor(
    private _authStateService: AuthStateService,
  ) {}

  public execute() {
    console.log(' GrantAuthAction')
    this._authStateService.setAuthState(true)  
  }
}
