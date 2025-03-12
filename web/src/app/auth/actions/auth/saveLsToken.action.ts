import { Inject, Injectable } from '@angular/core';
import { HOST_NAME } from 'typlib';
import { IAuthAction } from '../../models/action.model';
import { ConfigService } from '../../services/config.service';
import { LoginResponse } from './singInByData.action';

@Injectable()
export class SaveTokenInLsAction implements IAuthAction {
  constructor(
    @Inject(HOST_NAME) private readonly hostName: string,
    
) {}

  public execute(res: LoginResponse) {
    localStorage.setItem(`${this.hostName}__accessToken`, res.accessToken);
    localStorage.setItem(`${this.hostName}__refreshToken`, res.refreshToken);
  }
}
