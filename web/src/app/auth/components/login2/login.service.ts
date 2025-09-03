import { Inject, Injectable } from "@angular/core"
import { GetProvidersRes, GetProvidersResItem, User, UserRes } from "./models"
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

	public getProviderUsers(providerId: number): Observable<User[]> {
		const data = { id: providerId }
		const url = `${process.env['AU_BACK_URL']}/provider/getProviderUsers`
		return this.http.post<UserRes>(url, data)
			.pipe(
				map((res) => res.data)
			)
	}
}