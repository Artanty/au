import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';
import { ConfigService } from '../../services/config.service';

import { IAuthAction } from '../../models/action.model';
import { BehaviorSubject, take } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class GoToLoginAction implements IAuthAction {
  private _routerPath = ''
  private _router: any = null
  constructor(
    private injector: Injector, 
  ) {
    console.log('ACTION GO TO LOGIN CREATED')
    this._router = this.injector.get(Router);
    const routerPath$ = this.injector.get('ROUTER_PATH') as BehaviorSubject<string>;

    console.log(routerPath$.getValue())
    routerPath$.asObservable().pipe(take(1)).subscribe((res: string) => {
      this._routerPath = `/${res}/login`
    })
  }

  public execute() {
    this._router.navigateByUrl(this._routerPath)
  }
}
