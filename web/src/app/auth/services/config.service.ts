import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { IAuthDto } from '../auth.component';
import { Nullable } from './user-action.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config$ = new BehaviorSubject<Nullable<IAuthDto>>(null);

  constructor() {}

  public setConfig(data: Nullable<IAuthDto>) {
    this.config$.next(data);
  }
  public getConfig(): Nullable<IAuthDto> {
    return this.config$.value;
  }
  public getConfigAuthStrategy(): string {
    return this.config$.value?.authStrategy || '';
  }
  public listenConfig(): Observable<Nullable<IAuthDto>> {
    return this.config$.asObservable();
  }
}
