import { Inject, Injectable } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { IAuthAction } from '../../models/action.model';

import { BusEvent, EVENT_BUS_LISTENER, EVENT_BUS_PUSHER, HOST_NAME } from 'typlib';
import { filter, map, Observable, of, share, switchMap, take, tap } from 'rxjs';
import { ExternalUpdateBody, ExternalUpdates, TokenShareService } from '../../services/token-share.service';
import { eventBusFilterByEvent } from '../../utilites/eventBusFilterByEvent';
import { eventBusFilterByProject } from '../../utilites/eventBusFilterByProject';
import { AuthStateService } from '../../services/auth-state.service';
import { dd } from '../../utilites/dd';
import { HttpClient } from '@angular/common/http';
import { TokenStoreService } from '../../services/token-store.service';

export interface ShareTokenReq {
  projectId: string
  backendUrl: string
  hostOrigin: string
  token?: string
}

export interface ShareTokenRes {
  "success": boolean
  "receiverResponse": {
    "success": boolean
    "message": string
    "storagePath": string
  }
}

@Injectable()
export class ShareTokenAction implements IAuthAction {
  constructor(
    private _tokenShareService: TokenShareService,
    @Inject(EVENT_BUS_LISTENER)
    private readonly eventBusListener$: Observable<BusEvent>,
    private _authStateService: AuthStateService,
    private http: HttpClient,
    private _tokenStoreService: TokenStoreService,
    private _configService: ConfigService
  ) {}

  public execute(remote: ExternalUpdateBody): Observable<ExternalUpdateBody> {    
    
    return this._isAuthorized$().pipe(
      switchMap((res: boolean) => {

        const token = this._tokenStoreService.getTokenStore()

        const back = remote;

        const hostOrigin = (this._configService.getConfig() as any).hostOrigin

        const payload: ShareTokenReq = {
          projectId: back.projectId + '@back',
          backendUrl: back.backendUrl,
          hostOrigin: hostOrigin,
          token: String(token?.access)
        }
        
        return this._makeRequest(payload)
      }),
      tap((res: ShareTokenRes) => {
        this._tokenShareService.setSharedState(remote.projectId, res.success)
      }),
      map(() => remote),
      share()
    )
  }

  private _makeRequest(payload: ShareTokenReq): Observable<any> {
    return this.http.post<any>(`${process.env['AU_BACK_URL']}/token-share/share`, payload)
  }

  private _isAuthorized$(): Observable<boolean> {
    return this._authStateService.listenAuthState()
      .pipe(
        filter(el => el === true),
        take(1)
      )
  }
}

