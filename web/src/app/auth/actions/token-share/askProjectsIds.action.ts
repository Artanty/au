import { Inject, Injectable } from '@angular/core';
import { BusEvent, EVENT_BUS_LISTENER, EVENT_BUS_PUSHER, HOST_NAME } from 'typlib';
import { IAuthAction } from '../../models/action.model';
import { filter, map, Observable, of, take } from 'rxjs';
import { eventBusFilterByEvent } from '../../utilites/eventBusFilterByEvent';
import { eventBusFilterByProject } from '../../utilites/eventBusFilterByProject';
import { AppStateService } from '../../services/app-state.service';

@Injectable()
export class AskProjectIdsAction implements IAuthAction {
  constructor(
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void,
    @Inject(EVENT_BUS_LISTENER)
    private readonly eventBusListener$: Observable<BusEvent>,
    private _appStateService: AppStateService
  ) {}

  // todo this can be a race
  public execute(): Observable<any> | any {
    const busEvent: BusEvent = {
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: String(this._appStateService.authConfig.req.from),
      event: 'ASK_PROJECTS_IDS',
      payload: {},
    };

    this.eventBusPusher(busEvent);

    return this.waitForResponse()
  }

  // todo add timeout
  waitForResponse() {
    return this.eventBusListener$
      .pipe(
        filter(eventBusFilterByProject),
        filter(res => eventBusFilterByEvent(res, 'PROJECTS_IDS')),
        map(res => res.payload.projectsIds),
        take(1)
      )
  }
}