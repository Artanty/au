import { Injectable } from '@angular/core';
import { IAuthAction } from '../../models/action.model';
import { TokenShareService } from '../../services/token-share.service';


@Injectable()
export class ResetTokenShareAction implements IAuthAction {
  constructor(
    private _tokenShareService: TokenShareService,
  ) {}

  public execute() {
    this._tokenShareService.resetStore();
  }
}