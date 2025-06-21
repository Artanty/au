import { Inject, Injectable } from '@angular/core';
import { BusEvent, HOST_NAME } from 'typlib';
import { EVENT_BUS_PUSHER } from '../../auth.component';
import { ConfigService } from '../../services/config.service';
import { IAuthAction } from '../../models/action.model';
import { TokenShareService } from '../../services/token-share.service';
import { BackUrl } from './askBackUrls.action';


@Injectable()
export class StoreBackUrlsAction implements IAuthAction {
  constructor(
    private _tokenShareService: TokenShareService,
  ) {}

  public execute(data: BackUrl[]) {
    data.forEach((el: BackUrl) => {
      this._tokenShareService.setBackUrl(el.project_id, el.back_url)
    })
    
    return this._tokenShareService.getRequiredProjects();

  }
}