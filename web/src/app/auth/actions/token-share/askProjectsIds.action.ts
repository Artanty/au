import { Inject, Injectable } from '@angular/core';
import { BusEvent, EVENT_BUS_LISTENER, HOST_NAME } from 'typlib';
import { EVENT_BUS_PUSHER } from '../../auth.component';
import { ConfigService } from '../../services/config.service';
import { IAuthAction } from '../../models/action.model';
import { Observable, of } from 'rxjs';

@Injectable()
export class AskProjectIdsAction implements IAuthAction {
  constructor(
    @Inject(HOST_NAME) private readonly hostName: string,
    @Inject(ConfigService) private ConfigServ: ConfigService,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void,
    @Inject(EVENT_BUS_LISTENER)
        private readonly eventBusListener$: Observable<BusEvent>,
  ) {}

  public execute(): Observable<any> {
    const busEvent: BusEvent = {
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: this.hostName,
      event: 'ASK_PROJECTS_IDS',
      payload: {},
    };

    this.eventBusPusher(busEvent);
    return of([])
  }

  /**
   * Дождаться id-шников
   */
  waitForIds () {
    this.eventBusListener$
    .pipe(
      
    )
  }
}