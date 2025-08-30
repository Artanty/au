import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { GetProvidersResItem, User, UserRes } from '../../login2/models';
import { map, merge, Observable, Subject, switchMap, tap, withLatestFrom } from 'rxjs';
import { LoginService } from '../../login2/login.service';
import { FormsModule } from '@angular/forms';
  


@Component({
  selector: 'app-user-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-selector.component.html',
  styleUrl: './user-selector.component.scss'
})
export class UserSelectorComponent {

  @Input() selectedUsers: any[] = [];
  @Output() usersSelected = new EventEmitter<any[]>();

  public userSelectorInputs = {}
  public userSelectorOutputs = {}

  // allUsers: any[] = [];
  // filteredUsers: any[] = [];

  provider: any = null
  providers$: Observable<GetProvidersResItem[]>
  providerType: boolean = false;
  users$: Observable<User[]>
  user: any = null
  isProviderChanged$: Subject<number> = new Subject()

  constructor(
    private http: HttpClient,
    private _loginService: LoginService,
  ) {
    this.providers$ = this._loginService.getProviders().pipe(
      tap(res => {
        if (this.providerType && res.length) {
          this.provider = res[0].id
          this.providerOnChange()
        }
      })
    )

    this.users$ = this.isProviderChanged$
      .pipe(
        tap(res => console.log(res)),
        switchMap(providerId => {
          return this._loginService.getProviderUsers(providerId)
        })
      )
  }

  public providerTypeOnChange(event: Event) {
    const data = (event.target as HTMLInputElement).checked
    this.providerType = data
    
  }
  
  public providerOnChange() {
    this.isProviderChanged$.next(this.provider)
  }

  ngOnInit() {
   
  }
}