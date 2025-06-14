import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IAuthDto } from '../auth.component';
import { Nullable } from './user-action.service';
import { dd } from '../utilites/dd';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private authState$ = new BehaviorSubject<boolean>(false)

  constructor() {}

  public setAuthState(data: boolean) {
    dd('setAuthState: ' + data)
    
    this.authState$.next(data);
  }
  public getAuthState(): boolean {
    return this.authState$.value;
  }
  
  public listenAuthState(): Observable<boolean> {
    return this.authState$.asObservable();
  }
}
