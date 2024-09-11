import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { UserActionService } from '../../services/user-action.service';
import { IAuthAction } from '../auth-action.model';

@Injectable()
export class SignInByDataAction implements IAuthAction {
  constructor(
    @Inject(UserActionService)
    private readonly UserActionServ: UserActionService,
    @Inject(HttpClient) private readonly http: HttpClient,
    @Inject(ConfigService) private ConfigServ: ConfigService
  ) {}

  public execute() {
    const { username, password } = this.UserActionServ.getUserAction()
      ?.payload as any;
    const signInUrl = this.ConfigServ.getConfig()?.payload?.['signInByDataUrl'];
    if (!signInUrl) throw new Error('No signInByDataUrl in payload');
    return this.http.post(signInUrl, { username, password });
  }
}
