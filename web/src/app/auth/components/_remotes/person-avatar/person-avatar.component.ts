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
import { AppStateService, getInnerBusEventFlow, UserAction, UserData } from '../../../services/app-state.service';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export interface LogoutRes {
  success: boolean,
  message: string
}

@Component({
  selector: 'app-person-avatar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './person-avatar.component.html',
  styleUrl: './person-avatar.component.scss',
})
export class PersonAvatarComponent implements OnInit, OnChanges {
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
    private router: Router,
    @Inject(HttpClient) private readonly http: HttpClient,
  ) {}

  ngOnInit() {
    //
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

  private _goToPath(routerPath: string): Promise<boolean> {
    return this.router.navigateByUrl(routerPath)
  }

  private _listenUserData() {
    // this._appStateService.userProfile.listen
    //   .pipe(
    //     filter(res => res !== null),
    //     map((res) => {
    //       return res !== null 
    //         ? res
    //         : { userName: '' }
    //     })
    //   )
    //   .subscribe((res: UserData) => {
    //     console.log(res)
    //     this.generateInitials(res.userName)
    //     this.isLoggedIn = true;
    //     this.isOpened = false;
    //   })
  }

  handleCheckboxClick() {
    if (!this.isLoggedIn) {
      this._goToPath(this.auPath)  
    }
    
  }
}  