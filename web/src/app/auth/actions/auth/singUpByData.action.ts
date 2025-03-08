import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { UserActionService } from '../../services/user-action.service';
import { IAuthAction } from '../../models/action.model';

@Injectable()
export class SignUpByDataAction implements IAuthAction {
  constructor(
    @Inject(UserActionService)
    private readonly UserActionServ: UserActionService,
    @Inject(HttpClient) private readonly http: HttpClient,
    @Inject(ConfigService) private ConfigServ: ConfigService
  ) {}

  public execute() {
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
    
    const signUpUrl = config?.payload?.['signUpByDataUrl'];
    if (!signUpUrl) throw new Error('No signUpByDataUrl in configured');
    return this.http.post(signUpUrl, requestData);
  }
}
