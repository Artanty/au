import { Injectable } from '@angular/core';
import { IAuthAction } from '../../models/action.model';

import { AppStateService } from '../../services/app-state.service';

@Injectable()
export class GrantAuthAction implements IAuthAction {
  constructor(
    private _appStateService: AppStateService
  ) {}

  public execute() {
    this._appStateService.isLoggedIn.next(true)  
  }
}
