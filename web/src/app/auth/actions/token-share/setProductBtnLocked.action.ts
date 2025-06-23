import { Inject, Injectable } from '@angular/core';
import { BusEvent, EVENT_BUS_LISTENER, EVENT_BUS_PUSHER, HOST_NAME } from 'typlib';

import { ConfigService } from '../../services/config.service';
import { IAuthAction } from '../../models/action.model';
import { filter, map, Observable, of, take } from 'rxjs';

import { eventBusFilterByEvent } from '../../utilites/eventBusFilterByEvent';
import { eventBusFilterByProject } from '../../utilites/eventBusFilterByProject';
import { ExternalUpdateBody } from '../../services/token-share.service';



@Injectable()
export class SetProductBtnLockedAction implements IAuthAction {
  constructor(
    @Inject(HOST_NAME) private readonly hostName: string,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void,
  ) {}

  public execute(project: ExternalUpdateBody | string): Observable<ExternalUpdateBody | string> {

    let projectId
    if (typeof project === 'string') {
      projectId = project
    } else {
      projectId = project.projectId
    }
    
    
    const busEvent: BusEvent = {
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: this.hostName,
      event: 'PRODUCT_BTN_LOCKED',
      payload: {
        projectId
      },
    };

    this.eventBusPusher(busEvent);

    return of(project)
  }
}