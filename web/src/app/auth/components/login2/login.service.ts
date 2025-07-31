//login.service.ts

import { Inject, Injectable } from "@angular/core"
import { GetSourcesRes, GetSourcesResItem } from "./models"
import { HttpClient } from "@angular/common/http"
import { pipe, map, Observable } from "rxjs"
@Injectable({
	providedIn: 'root'
})

export class LoginService {
	constructor(
		@Inject(HttpClient) private readonly http: HttpClient,
	) {}
	public getSources(): Observable<GetSourcesResItem[]> {
		const url = `${process.env['AU_BACK_URL']}/provider/getProviders`
		return this.http.post<GetSourcesRes>(url, null)
			.pipe(
				map(res => res.data)
			)
	}
}