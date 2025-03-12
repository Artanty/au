import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { UserActionService } from '../../services/user-action.service';
import { IAuthAction } from '../../models/action.model';
import { Observable } from 'rxjs';

export interface LoginResponse {
  "accessToken": string
  "refreshToken": string
  "user": {
      "id": number,
      "username": string
      "email": string
      "password": string
      "created_at": string
  }
}


@Injectable()
export class SignInByDataAction implements IAuthAction {
  constructor(
    @Inject(UserActionService)
    private readonly UserActionServ: UserActionService,
    @Inject(HttpClient) private readonly http: HttpClient,
    @Inject(ConfigService) private ConfigServ: ConfigService
  ) {}

  public execute(): Observable<LoginResponse> {
    const formDataUserAction = this.UserActionServ.getUserAction()?.payload
    const config = this.ConfigServ.getConfig()
    let requestData = {} as any
    if (config?.from === 'AU') {
      requestData.username = formDataUserAction?.['username']
      requestData.email = formDataUserAction?.['username']
      requestData.password = formDataUserAction?.['password']
    } else {
      requestData.username = formDataUserAction?.['username']
      requestData.password = formDataUserAction?.['password']
    }

    const signInUrl = config?.payload?.['signInByDataUrl'];
    if (!signInUrl) throw new Error('No signInByDataUrl in payload');
    return this.http.post<LoginResponse>(signInUrl, requestData);
  }
}
