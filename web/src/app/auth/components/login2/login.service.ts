//login.service.ts

import { Inject, Injectable } from "@angular/core"
import { GetProvidersRes, GetProvidersResItem } from "./models"
import { HttpClient } from "@angular/common/http"
import { pipe, map, Observable } from "rxjs"
@Injectable({
	providedIn: 'root'
})

export class LoginService {
	constructor(
		@Inject(HttpClient) private readonly http: HttpClient,
	) {}
	public getProviders(): Observable<GetProvidersResItem[]> {
		const url = `${process.env['AU_BACK_URL']}/provider/getProviders`
		return this.http.post<GetProvidersRes>(url, null)
			.pipe(
				map(res => res.data)
			)
	}
}