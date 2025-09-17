import { Component, Input, OnInit, OnChanges, SimpleChanges, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';
import { EVENT_BUS, EVENT_BUS_LISTENER } from 'typlib';
import { Router } from '@angular/router';
import { eventBusFilterByProject } from '../../../utilites/eventBusFilterByProject';
import { Injectable } from '@angular/core';
import { BusEvent, EVENT_BUS_PUSHER, HOST_NAME } from 'typlib';
import { share, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppStateService, UserData } from '../../../services/app-state.service';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export interface LogoutRes {
  success: boolean,
  message: string
}

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss',
  providers: [
    { 
      provide: EVENT_BUS_LISTENER, 
      useFactory: (eventBus$: BehaviorSubject<BusEvent>) => {
        return eventBus$
          .asObservable()
          .pipe(
            filter(eventBusFilterByProject)
          );
      },
      deps: [EVENT_BUS], 
    },
  ]
})
export class UserAvatarComponent implements OnInit, OnChanges {
  @Input() avatarUrl: string | null = null;
  @Input() name: string = '';
  @Input() size: AvatarSize = 'md';
  @Input() backgroundColor: string = '';

  initials: string = '';
  sizeClass: string = 'avatar-md';
  customSize: number | null = null;
  fontSize: number = 14;
  hasImageError: boolean = false;
  public isOpened: boolean = false
  isLoggedIn: boolean = false
  auPath: string = ''
  constructor(
    @Inject(EVENT_BUS_LISTENER)
    private readonly eventBusListener$: Observable<BusEvent>,
    private router: Router,
    private _appStateService: AppStateService,
    @Inject(HttpClient) private readonly http: HttpClient,
  ) {}

  ngOnInit() {
    this.updateAvatar();
    
    this.eventBusListener$
      .subscribe((res: BusEvent) => {
        if (res.event === 'TRIGGER_ACTION') {
          if (res.payload.action === 'INIT_AUTH_CONFIG') {
            if (res.payload.payload.routerPath) {
              this.auPath = res.payload.payload.routerPath
              this._goToPath(this.auPath)
            }
          }
        }
      })
    this._listenUserData()

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['name'] || changes['avatarUrl'] || changes['size'] || changes['backgroundColor']) {
      this.updateAvatar();
    }
  }

  private updateAvatar(): void {
    this.hasImageError = false;
    this.generateInitials();
    this.setSize();
    
    if (!this.backgroundColor && !this.avatarUrl) {
      this.generateBackgroundColor();
    }
  }
  
  private generateInitials(inputString?: string): void {

    const name: string = this.name.length 
      ? this.name
      : String(inputString)
    
    if (!name.trim() || inputString === undefined) {
      this.initials = '?';
      return;
    }
    console.log(name)
    const words = name.trim().split(/\s+/).filter(word => word.length > 0);
    
    if (words.length === 0) {
      this.initials = '?';
    } else if (words.length === 1) {
      this.initials = words[0].charAt(0).toUpperCase();
    } else {
      this.initials = words[0].charAt(0).toUpperCase() + words[words.length - 1].charAt(0).toUpperCase();
    }
    console.log(this.initials)
  }

  private setSize(): void {
    if (typeof this.size === 'number') {
      this.customSize = this.size;
      this.fontSize = Math.max(10, this.size * 0.35);
      this.sizeClass = '';
    } else {
      this.customSize = null;
      this.sizeClass = `avatar-${this.size}`;
    }
  }

  private generateBackgroundColor(): void {
    if (!this.name.trim()) {
      this.backgroundColor = 'rgb(29 36 71)';
      return;
    }

    let hash = 0;
    for (let i = 0; i < this.name.length; i++) {
      hash = this.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash % 360);
    const saturation = 65;
    const lightness = 60;
    
    this.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  onImageError(): void {
    this.hasImageError = true;
    this.generateBackgroundColor();
  }

  get displayImage(): boolean {
    return !!this.avatarUrl && !this.hasImageError;
  }

  get displayInitials(): boolean {
    return !this.avatarUrl || this.hasImageError;
  }

  public onLogoutHandler() {
    this.logout().subscribe(res => {
      console.log(res)
      if (res.success) {
        this.isOpened = false
        this.name = ''
        this.updateAvatar();
        this.removeLocalStorageValue('accessToken')
        this.removeLocalStorageValue('refreshToken')
        this._goToPath('/')
        this.isLoggedIn = false;
      }
    })
  }
  // COMMON todo move

  /**
   * Remove a value from localStorage
   * @param {string} key - The key to remove
   * @returns {boolean} - True if successful, false if failed
   */
  public removeLocalStorageValue(key: string) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing localStorage value:', error);
      return false;
    }
  }

  public logout(): Observable<LogoutRes> {
    const url = `${process.env['AU_BACK_URL']}/auth-token/logout`
    
    return this.http.post<LogoutRes>(url, {});
  }


  private _goToPath(routerPath: string): Promise<boolean> {
    return this.router.navigateByUrl(routerPath)
  }

  private _listenUserData() {
    this._appStateService.userProfile.listen
      .pipe(
        filter(res => res !== null),
        map((res) => {
          return res !== null 
            ? res
            : { userName: '' }
        })
      )
      .subscribe((res: UserData) => {
        console.log(res)
        this.generateInitials(res.userName)
        this.isLoggedIn = true;
        this.isOpened = false;
      })
  }

  handleCheckboxClick() {
    if (!this.isLoggedIn) {
      this._goToPath(this.auPath)  
    }
    
  }
}  