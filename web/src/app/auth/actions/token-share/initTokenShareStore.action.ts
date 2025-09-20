import { Injectable } from '@angular/core';
import { IAuthAction } from '../../models/action.model';
import { ExternalUpdates, TokenShareService } from '../../services/token-share.service';

@Injectable()
export class InitTokenShareStoreAction implements IAuthAction {
  constructor(
    private _tokenShareService: TokenShareService
  ) {}

  public execute(ids: string[]): void {
    this._tokenShareService.addProjects(ids)
  }
}

