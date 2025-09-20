import { Injectable } from '@angular/core';
import { IAuthAction } from '../../models/action.model';
import { ExternalUpdateBody, TokenShareService } from '../../services/token-share.service';

@Injectable()
export class GetExternalsForTokenShare implements IAuthAction {
	constructor(
		private _tokenShareService: TokenShareService
	) {}

	public execute(): ExternalUpdateBody[] {
    
		return this._tokenShareService.getRequiredProjectsArr()
	}
}

