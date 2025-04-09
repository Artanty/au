import { Inject, Injectable } from '@angular/core';
import { HOST_NAME } from 'typlib';
import { IAuthAction } from '../../models/action.model';

@Injectable()
export class GetProductAuthTokenAction implements IAuthAction {
  constructor(@Inject(HOST_NAME) private readonly hostName: string) {}

  public execute() {
    const token = localStorage.getItem(`${this.hostName}__authToken`);
    return token === 'undefined'
      ? null
      : token
  }
}
