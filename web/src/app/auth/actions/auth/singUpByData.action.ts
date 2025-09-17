import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ConfigService } from '../../services/config.service';

import { IAuthAction } from '../../models/action.model';
import { AppStateService } from '../../services/app-state.service';

@Injectable()
export class SignUpByDataAction implements IAuthAction {
  constructor(
   
    @Inject(HttpClient) private readonly http: HttpClient,
    @Inject(ConfigService) private ConfigServ: ConfigService,
    private _appStateService: AppStateService
  ) {}

  public execute() {
    const formDataUserAction = this._appStateService.userAction.value?.payload
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
