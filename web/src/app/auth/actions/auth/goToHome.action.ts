import { Injectable } from '@angular/core';
import { IAuthAction } from '../../models/action.model';
import { Router } from '@angular/router';

@Injectable()
export class GoToHomeAction implements IAuthAction {
 
	constructor(
		private _router: Router
	) {}

	public execute() {
		this._router.navigateByUrl('/')
	}
}
