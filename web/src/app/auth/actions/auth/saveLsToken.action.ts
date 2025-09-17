import { Inject, Injectable } from '@angular/core';
import { HOST_NAME } from 'typlib';
import { IAuthAction } from '../../models/action.model';
import { ConfigService } from '../../services/config.service';
import { LoginResponse } from './singInByData.action';

import { dd } from '../../utilites/dd';

@Injectable()
export class SaveTokenInLsAction implements IAuthAction {
  constructor(
    @Inject(HOST_NAME) private readonly hostName: string,
    
  ) {}

  public execute(res: LoginResponse) {
    // localStorage.setItem(`${this.hostName}__accessToken`, res.accessToken);
    // localStorage.setItem(`${this.hostName}__refreshToken`, res.refreshToken);
    // todo понять, нужно ли тут хост префикс.
    // другая конфигурация этого же хоста может быть развернута на этом же адресе.
    // значит по входу будет попытка отправки старого токена из локал сторадж
    // добавить версию билда?
    localStorage.setItem(`accessToken`, res.accessToken);
    localStorage.setItem(`refreshToken`, res.refreshToken);

  }
}
