import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Nullable } from './user-action.service';

export interface Token {
  access: string,
  refresh: string
}

@Injectable({
  providedIn: 'root',
})
export class TokenStoreService {
  private token$ = new BehaviorSubject<Nullable<Token>>(null)

  constructor() {}

  public setTokenStore(data: Nullable<Token>) {
    console.log('token saved')
    this.token$.next(data);
  }
  public getTokenStore(): Nullable<Token> {
    // return this.token$.value;
    return this._getTokenFromLs()
  }
  
  // public listenTokenStore(): Observable<Nullable<Token>> {
  //   return this.token$.asObservable();
  // }

  private _getTokenFromLs(): Nullable<Token> {
    if (localStorage.getItem(`accessToken`)) {
      return {
        access: localStorage.getItem(`accessToken`) as string,
        refresh: localStorage.getItem(`refreshToken`) as string    
      }
    } else {
      return null
    }
  }
}
 