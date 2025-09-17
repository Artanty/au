import { Inject, Injectable } from '@angular/core';
import { BusEvent, EVENT_BUS_PUSHER, HOST_NAME } from 'typlib';
import { IAuthAction } from '../../models/action.model'
import { filter, Observable, take } from 'rxjs';
import { AppStateService } from '../../services/app-state.service';

@Injectable()
export class ListenGrantAuthAction implements IAuthAction {
  constructor(
    @Inject(HOST_NAME) private readonly hostName: string,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void,
    private _appStateService: AppStateService,
  ) {}

  public execute(): Observable<boolean> {
    return this._appStateService.isLoggedIn.listen
      .pipe(
        filter(res => res === true),
        take(1),
      )
  }
}
