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

    let requestData = {} as any

    requestData.username = formDataUserAction?.['username']
    requestData.password = formDataUserAction?.['password']
    requestData.source = formDataUserAction?.['source']

    if (!formDataUserAction?.['email']) {
      requestData.email = formDataUserAction?.['username']
    }

    if (!process.env['AU_BACK_URL']) throw new Error('No URL PROVIDED');

    const url = `${process.env['AU_BACK_URL']}/auth-token/login`

    return this.http.post<LoginResponse>(url, requestData);
  }
}
