import { Inject, Injectable } from '@angular/core';
import { HOST_NAME } from 'typlib';
import { IAuthAction } from '../../models/action.model';

@Injectable()
export class RemoveProductAuthTokenAction implements IAuthAction {
  constructor(@Inject(HOST_NAME) private readonly hostName: string) {}

  public execute() {
    localStorage.removeItem(`${this.hostName}__accessToken`);
    localStorage.removeItem(`${this.hostName}__refreshToken`);
    return true
  }
}
