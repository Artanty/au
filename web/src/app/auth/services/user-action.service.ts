import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Nullable<T> = T | null;

export interface IUserAction {
  action: string,
  payload: Record<string, string | number>
}

@Injectable({
  providedIn: 'root'
})
export class UserActionService {

  private userAction$ = new BehaviorSubject<Nullable<IUserAction>>(null)

  constructor() { }

  public setUserAction (data: Nullable<IUserAction>) {
    console.log(data)
    this.userAction$.next(data)
  }
  public getUserAction (): Nullable<IUserAction> {
    return this.userAction$.value
  }
  public listenUserAction (): Observable<Nullable<IUserAction>> {
    return this.userAction$.asObservable()
  }
}
