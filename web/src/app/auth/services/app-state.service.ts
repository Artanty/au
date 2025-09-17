// Obs$

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { obs$ } from '../utilites/observable-variable';
import { BusEvent } from 'typlib';
import { Nullable } from '../utilites/utility.types';

// private _appStateService: AppStateService

export type UserActionPayload = Record<string, any>
export type UserAction = BusEvent<UserActionPayload>

export interface UserData {
  userName: string
}
export interface ViewState {
  action: string
  payload?: Record<string, string | boolean>
  scope?: string
}

export interface Tokens {
  access: string,
  refresh: string
}

export interface IAuthDto {
  productName?: string;
  authStrategy: string;
  tokenShareStrategy: string;
  hostOrigin: string;
  payload?: {
    checkBackendUrl: string;
    signUpByDataUrl?: string
    signInByDataUrl: string;
    signInByTokenUrl: string;
  };
  from?: string;
  status?: string;
}

// const defaultConfig: IAuthDto = {
//   productName: "AU",
//   authStrategy: "backend",
//   tokenShareStrategy: 'saveTempDuplicate',
//   payload: {
//     checkBackendUrl: `${process.env['AU_BACK_URL']}/getUpdates`,
//     signUpByDataUrl: `${process.env['AU_BACK_URL']}/auth-token/signup`,
//     signInByDataUrl: `${process.env['AU_BACK_URL']}/auth-token/login`,
//     signInByTokenUrl: "",
//   },
//   from: "AU",
//   status: "init",
// }


@Injectable({
  providedIn: 'root'
})
export class AppStateService {

  public userAction = obs$<Nullable<UserAction>>(null)
  public isLoggedIn = obs$<boolean>(false)
  public userProfile = obs$<Nullable<UserData>>(null)
  public view = obs$<Nullable<ViewState>>(null)
  public authConfig = obs$<Nullable<IAuthDto>>(null)

  // private userAction$ = new BehaviorSubject<Nullable<IUserAction>>(null)

  // user = new ObservableVariable<User | null>(null);
  // isAuthenticated = new ObservableVariable<boolean>(false);
  // cartItems = new ObservableVariable<CartItem[]>([]);
  // theme = new ObservableVariable<'light' | 'dark'>('light');
  
  // // Derived state
  // get cartItemCount$() {
  //   return this.cartItems.map(items => items.length);
  // }
  
  // constructor() {
  //   // Initialize from localStorage
  //   const savedTheme = localStorage.getItem('theme');
  //   if (savedTheme === 'light' || savedTheme === 'dark') {
  //     this.theme.value = savedTheme;
  //   }
    
  //   // Persist theme changes
  //   this.theme.subscribe(theme => {
  //     localStorage.setItem('theme', theme);
  //   });
  // }
}

export const getInnerBusEventFlow = (): { from: string, to: string } => ({ from: 'au@web', to: 'au@web' })

export const getTokens = (): Nullable<Tokens> => {
  if (localStorage.getItem(`accessToken`)) {
    return {
      access: localStorage.getItem(`accessToken`) as string,
      refresh: localStorage.getItem(`refreshToken`) as string    
    }
  } else {
    return null
  }
}

