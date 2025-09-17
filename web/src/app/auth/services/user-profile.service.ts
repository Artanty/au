import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Nullable } from '../utilites/utility.types';


export interface UserData {
  userName: string
}

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private _userData$ = new BehaviorSubject<Nullable<UserData>>(null);

  constructor() {}

  public setUserData(data: Nullable<UserData>) {
    this._userData$.next(data);
  }
  public getUserData(): Nullable<UserData> {
    return this._userData$.value;
  }
  public listenUserData(): Observable<Nullable<UserData>> {
    return this._userData$.asObservable();
  }
}
