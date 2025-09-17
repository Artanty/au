import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private authState$ = new BehaviorSubject<boolean>(false)

  constructor() {}

  public setAuthState(data: boolean) {
    console.log('AuthStateService: ' + data)
    this.authState$.next(data);
  }
  public getAuthState(): boolean {
    return this.authState$.value;
  }
  
  public listenAuthState(): Observable<boolean> {
    return this.authState$.asObservable();
  }
}
