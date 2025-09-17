import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { IAuthAction } from '../../models/action.model';
import { Observable } from 'rxjs';

export interface CheckTokenResponse {
	error: string
	code: string
}

@Injectable()
export class CheckTokenAction implements IAuthAction {
	constructor(
		@Inject(HttpClient) private readonly http: HttpClient,
	) {}

	public execute(): Observable<CheckTokenResponse> {
		
		const lsAccessToken = localStorage.getItem(`accessToken`);
		const accessToken = lsAccessToken === 'undefined'
			? null
			: lsAccessToken
    
		let requestData = {
			accessToken: accessToken
		} as any
		// console.log(formDataUserAction)
		// requestData.username = formDataUserAction?.['username']
		// requestData.password = formDataUserAction?.['password']
		// requestData.provider = formDataUserAction?.['provider']

		// if (!formDataUserAction?.['email']) {
		//   requestData.email = formDataUserAction?.['username']
		// }

		// if (!process.env['AU_BACK_URL']) throw new Error('No URL PROVIDED');

		const url = `${process.env['AU_BACK_URL']}/auth-token/check-token`

		return this.http.post<CheckTokenResponse>(url, requestData);
	}
}
