import { Inject, Injectable } from '@angular/core';
import { BusEvent, HOST_NAME } from 'typlib';
import { EVENT_BUS_PUSHER } from '../../auth.component';
import { ConfigService } from '../../services/config.service';
import { IAuthAction } from '../auth-action.model';

@Injectable()
export class GrantAccessAction implements IAuthAction {
  constructor(
    @Inject(HOST_NAME) private readonly hostName: string,
    @Inject(ConfigService) private ConfigServ: ConfigService,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void
  ) {}

  public execute() {
    const busEvent: BusEvent = {
      from: process.env['APP']!,
      to: this.hostName,
      event: 'auth',
      payload: { status: 'ACCESS_GRANTED' },
    };

    this.eventBusPusher(busEvent);
  }
}
