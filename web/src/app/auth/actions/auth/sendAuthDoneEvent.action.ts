import { Inject, Injectable } from '@angular/core';
import { BusEvent, HOST_NAME } from 'typlib';
import { EVENT_BUS_PUSHER } from '../../auth.component';
import { ConfigService } from '../../services/config.service';
import { IAuthAction } from '../../models/action.model';
import { UserActionService } from '../../services/user-action.service';

@Injectable()
export class SendAuthDoneEventAction implements IAuthAction {
  constructor(
    @Inject(HOST_NAME) private readonly hostName: string,
    @Inject(ConfigService) private ConfigServ: ConfigService,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void,
    @Inject(UserActionService)
    private readonly UserActionServ: UserActionService,

  ) {}

  public execute() {
    const lastUserAction = this.UserActionServ.getUserAction()?.action
    if (lastUserAction === 'SEND_LOGIN_REQUEST') {
      
    }
    const busEvent: BusEvent = {
      from: process.env['PROJECT_ID']!,
      to: this.hostName,
      event: 'AUTH_DONE',
      payload: { 
        // status: 'AUTH_DONE',
        // username: 1
      },
    };

    this.eventBusPusher(busEvent);
  }
}
