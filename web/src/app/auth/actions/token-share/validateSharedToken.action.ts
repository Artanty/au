import { Inject, Injectable } from '@angular/core';
import { BusEvent, EVENT_BUS_LISTENER, EVENT_BUS_PUSHER, HOST_NAME } from 'typlib';
import { IAuthAction } from '../../models/action.model';
import { BehaviorSubject, catchError, delay, filter, map, Observable, of, ReplaySubject, retryWhen, scan, share, Subject, take, takeUntil, tap, throwError, timeout } from 'rxjs';
import { eventBusFilterByEvent } from '../../utilites/eventBusFilterByEvent';
import { eventBusFilterByProject } from '../../utilites/eventBusFilterByProject';
import { ExternalUpdateBody, ExternalUpdates, TokenShareService } from '../../services/token-share.service';
import { dd } from '../../utilites/dd';
import { HttpClient } from '@angular/common/http';
import { AppStateService, getTokens } from '../../services/app-state.service';

const TOKEN_VALIDATE_API = 'save-temp/check'

interface ValidateTokenRes {
    validationResult: boolean
}

@Injectable()
export class ValidateSharedTokenAction implements IAuthAction {
    constructor(
        @Inject(HOST_NAME) private readonly hostName: string,
        @Inject(EVENT_BUS_PUSHER)
        private eventBusPusher: (busEvent: BusEvent) => void,
        @Inject(EVENT_BUS_LISTENER)
        private readonly eventBusListener$: Observable<BusEvent>,
        private _tokenShareService: TokenShareService,
        private http: HttpClient,
        private _appStateService: AppStateService
    ) {}

    public execute(remote: ExternalUpdateBody) {
        
        
        return this._makeRequest(remote).pipe(
            tap((res: ValidateTokenRes) => {
                const message = `${remote.projectId} validationResult: ${res.validationResult}`;
                console.log(message)
                this._tokenShareService.setValidState(remote.projectId, res.validationResult)
            }),
            map((res: ValidateTokenRes) => {
                if (res.validationResult !== true) {
                    const message = `${remote.projectId} validationResult: ${res.validationResult}`;
                    throw new Error(remote.projectId);
                }
                return remote;
                
            }),
            share()
        )
    }

    private _makeRequest(remote: ExternalUpdateBody) {
        const url = remote.backendUrl
        const api = TOKEN_VALIDATE_API
        const accessToken = getTokens()?.access
        const hostOrigin = this._appStateService.authConfig.req.hostOrigin;
        
        const payload = {
            hostOrigin: hostOrigin,
            data: { 
                accessToken
            }
        }

        const maxRetries = 3;
        const initialDelay = 1000; // 1 second
        return this.http.post<any>(`${url}/${api}`, payload).pipe(
            retryWhen(errors =>
                errors.pipe(
                    scan((acc, error) => {
                        if (acc >= maxRetries) {
                            throw error; // Re-throw the error after max retries
                        }
                        return acc + 1;
                    }, 0),
                    tap(retryAttempt => console.log(`Retry attempt #${retryAttempt}`)),
                    delay(initialDelay) // Delay before retrying
                )
            ),
            catchError(error => {
                console.error('Error fetching data after all retries:', error);
                return throwError(() => new Error('Failed to fetch data after multiple attempts with delays.'));
            }))
    }

    // перенести это. триггерить только когда все элементы закончили попытку проверить токен.
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

