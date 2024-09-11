import { Inject, Injectable } from '@angular/core';
import { HOST_NAME } from 'typlib';
import { IAuthAction } from '../auth-action.model';

@Injectable()
export class SaveTokenInLsAction implements IAuthAction {
  constructor(@Inject(HOST_NAME) private readonly hostName: string) {}

  public execute(token: string) {
    return localStorage.setItem(`${this.hostName}__authToken`, token);
  }
}
