import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { IAuthAction } from '../../models/action.model';
import { Observable } from 'rxjs';
import { LogoutRes } from '../../components/_remotes/user-avatar/user-avatar.component';

@Injectable()
export class SendLogoutRequestAction implements IAuthAction {
    constructor(
        @Inject(HttpClient) private readonly http: HttpClient,
    ) {}

    public execute(): Observable<LogoutRes> {

        const url = `${process.env['AU_BACK_URL']}/auth-token/logout`

        return this.http.post<LogoutRes>(url, {});
    }
}
    