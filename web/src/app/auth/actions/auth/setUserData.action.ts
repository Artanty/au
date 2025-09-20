import { Injectable } from '@angular/core';
import { IAuthAction } from '../../models/action.model';
import { AppStateService, UserData } from '../../services/app-state.service';

@Injectable()
export class SetUserDataAction implements IAuthAction {
  constructor(
    private _appStateService: AppStateService,
  ) {}

  public execute(data: UserData): void {
    this._appStateService.userProfile.next(data)
  }
}
