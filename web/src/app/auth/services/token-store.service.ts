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
    this.token$.next(data);
  }
  public getTokenStore(): Nullable<Token> {
    return this.token$.value;
  }
  
  public listenTokenStore(): Observable<Nullable<Token>> {
    return this.token$.asObservable();
  }
}
