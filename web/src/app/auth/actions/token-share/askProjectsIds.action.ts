import { Inject, Injectable } from '@angular/core';
import { BusEvent, EVENT_BUS_LISTENER, EVENT_BUS_PUSHER, HOST_NAME } from 'typlib';

import { ConfigService } from '../../services/config.service';
import { IAuthAction } from '../../models/action.model';
import { filter, map, Observable, of, take } from 'rxjs';
import { eventBusFilterByProject } from '../../auth.module';

export const eventBusFilterByEvent = (res: BusEvent, event: string) => {
  return res.event === `${event}`
}

@Injectable()
export class AskProjectIdsAction implements IAuthAction {
  constructor(
    @Inject(ConfigService) private _configService: ConfigService,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void,
    @Inject(EVENT_BUS_LISTENER)
        private readonly eventBusListener$: Observable<BusEvent>,
  ) {}

  // todo this can be a race
  public execute(): Observable<any> | any{
    const busEvent: BusEvent = {
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: String(this._configService.getConfig()!.from),
      event: 'ASK_PROJECTS_IDS',
      payload: {},
    };

    this.eventBusPusher(busEvent);

    return this.waitForResponse()
  }

  waitForResponse () {
    return this.eventBusListener$
    .pipe(
      filter(eventBusFilterByProject),
      filter(res => eventBusFilterByEvent(res, 'PROJECTS_IDS')),
      map(res => res.payload.projectsIds),
      take(1)
    )
  }
}