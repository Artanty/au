// Obs$

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { obs$ } from '../utilites/observable-variable';
import { BusEvent } from 'typlib';
import { Nullable } from '../utilites/utility.types';


export type UserActionPayload = Record<string, any>
export type UserAction = BusEvent<UserActionPayload>

export interface UserData {
  userName: string
}


@Injectable({
  providedIn: 'root'
})
export class AppStateService {

  public userAction = obs$<Nullable<UserAction>>(null)
  public isLoggedIn = obs$<boolean>(false)
  public userProfile = obs$<Nullable<UserData>>(null)

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


// private _appStateService: AppStateService