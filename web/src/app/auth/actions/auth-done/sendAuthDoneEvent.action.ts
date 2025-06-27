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
  ) {}

  public execute() {
    const busEvent: BusEvent = {
      from: process.env['PROJECT_ID']!,
      to: this.hostName,
      event: 'AUTH_DONE',
      payload: {},
    };

    this.eventBusPusher(busEvent);
  }
}
