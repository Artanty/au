import { Injectable } from '@angular/core';
import { IAuthAction } from '../../models/action.model';
import { UserData, UserProfileService } from '../../services/user-profile.service';


@Injectable()
export class SetUserDataAction implements IAuthAction {
  constructor(
    private readonly _userProfileService: UserProfileService,
  ) {}

  public execute(data: UserData): void {
    console.log('SetUserDataAction')
    this._userProfileService.setUserData(data)
  }
}
