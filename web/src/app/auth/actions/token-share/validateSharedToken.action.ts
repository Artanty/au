import { Inject, Injectable } from '@angular/core';
import { BusEvent, EVENT_BUS_LISTENER, EVENT_BUS_PUSHER, HOST_NAME } from 'typlib';
import { ConfigService } from '../../services/config.service';
import { IAuthAction } from '../../models/action.model';
import { BehaviorSubject, filter, map, Observable, of, ReplaySubject, scan, share, Subject, take, takeUntil, tap, timeout } from 'rxjs';
import { eventBusFilterByEvent } from '../../utilites/eventBusFilterByEvent';
import { eventBusFilterByProject } from '../../utilites/eventBusFilterByProject';
import { ExternalUpdateBody, ExternalUpdates, TokenShareService } from '../../services/token-share.service';
import { dd } from '../../utilites/dd';
import { HttpClient } from '@angular/common/http';
import { TokenStoreService } from '../../services/token-store.service';

const TOKEN_VALIDATE_API = 'save-temp/check'

@Injectable()
export class ValidateSharedTokenAction implements IAuthAction {
    constructor(
        @Inject(HOST_NAME) private readonly hostName: string,
        @Inject(EVENT_BUS_PUSHER)
        private eventBusPusher: (busEvent: BusEvent) => void,
        @Inject(EVENT_BUS_LISTENER)
        private readonly eventBusListener$: Observable<BusEvent>,
        private _tokenStoreService: TokenStoreService,
        private _tokenShareService: TokenShareService,
        private http: HttpClient,
        private _configService: ConfigService,
    ) {}

    public execute(remote: ExternalUpdateBody) {
        
        // this._tokenShareService.listenStore().pipe(
        //     filter(res => (typeof res === 'object' && res !== null) && !!Object.values(res).find(body => body.isShared && !body.isValid)),
        //     map(res => {
        //         const found = Object.entries(res).find(([_, value]) => value.isShared && !value.isValid)
        //         return found![1] // [string, ExternalUpdateBody]
        //     })
        // )
        //     .subscribe((remote: ExternalUpdateBody) => {
        //         this._makeRequest(remote)

        //     })
        return this._makeRequest(remote).pipe(
            tap(() => {
                this._tokenShareService.setValidState(remote.projectId, true)
            }),
            map(() => remote),
            share()
        )
    }

    private _makeRequest(remote: ExternalUpdateBody) {
        const url = remote.backendUrl
        const api = TOKEN_VALIDATE_API
        const token = this._tokenStoreService.getTokenStore()?.access
        const hostOrigin = (this._configService.getConfig() as any).hostOrigin
        
        const payload = {
            hostOrigin: hostOrigin,
            data: { 
                token: token, 
                hostOrigin: hostOrigin
            } 
        }

        console.log(url, api)
        return this.http.post<any>(`${url}/${api}`, payload)
        // .subscribe(res => {
        //     console.log('faq back res:')
        //     console.log(res)
        //     this._sendAuthDoneEvent()
        // })
    }

    // пеенести это. триггерить только когда все элементы закончили попытку проверить токен.
    private _sendAuthDoneEvent() {
        const busEvent: BusEvent = {
            from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
            to: this.hostName,
            event: 'AUTH_DONE',
            payload: {},
        };

        this.eventBusPusher(busEvent);
    }
}

