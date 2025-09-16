import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { GetProvidersResItem, User, UserRes } from '../../login2/models';
import { BehaviorSubject, map, merge, Observable, of, skipWhile, startWith, Subject, switchMap, tap, withLatestFrom } from 'rxjs';
import { LoginService } from '../../login2/login.service';
import { FormsModule } from '@angular/forms';
import { GuiDirective } from '../web-component-wrapper/gui.directive';
  
@Component({
  selector: 'app-user-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, GuiDirective],
  templateUrl: './user-selector.component.html',
  styleUrl: './user-selector.component.scss'
})
export class UserSelectorComponent {

  @Input() selectedUsers: any[] = [];
  @Output() valueChange = new EventEmitter<number | string>();

  public userSelectorInputs = {}
  public userSelectorOutputs = {}

  // allUsers: any[] = [];
  // filteredUsers: any[] = [];

  provider: any = null
  provider$: any = new Subject<number>()
  providers$: Observable<GetProvidersResItem[]>
  providerType: boolean = false;
  users$: Observable<User[]>
  // users$: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  
  user$: Subject<number | string | null> = new Subject()
  isProviderChanged$: Subject<number> = new Subject()

  constructor(
    private http: HttpClient,
    private _loginService: LoginService,
  ) {
    this.providers$ = this._loginService.getProviders().pipe(
      map(res => {
        // res.unshift({ id: 0, name: 'Выбрать поставщика' })
        return [{ id: 0, name: 'Выбрать поставщика' }, ...res]
      }),
      tap(res => {
        if (this.providerType && res.length) {
          // this.provider = res[0].id
          // this.providerOnChange()
        }
      })
    )

    this.users$ = this.provider$
      .pipe(
        startWith(0),
        switchMap((providerId: number) => {
          if (Number(providerId) !== 0) {
            return this._loginService.getProviderUsers(providerId);
          } else {
            return of([]);
          }
        }),
        map((res: User[]) => {
          return [{ id: 0, name: 'Выбрать пользователя' }, ...res]
        }),
        tap(() => {
          this.user$.next(0)
        }),
      )
  }

  public providerTypeOnChange(data: boolean) {
    this.providerType = data
    this.provider$.next(0)
  }
  
  public providerOnChange(data: number) {
    this.provider$.next(data)
  }

  public userOnChange(data: number | string) {
    this.user$.next(data)
    this.valueChange.emit(data)
    console.log(data)
  }

  ngOnInit() {
   
  }
}