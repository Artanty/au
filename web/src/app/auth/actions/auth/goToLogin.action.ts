import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { UserActionService } from '../../services/user-action.service';
import { IAuthAction } from '../../models/action.model';
import { BehaviorSubject, take } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class GoToLoginAction implements IAuthAction {
  private _routerPath = ''
  private _router: any = null
  constructor(
    private injector: Injector, 
    // private router: Router,
    // @Inject('ROUTER_PATH') private _routerPath$: BehaviorSubject<string>,
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
    // const formDataUserAction = this.UserActionServ.getUserAction()?.payload
    // const config = this.ConfigServ.getConfig()
    // let requestData = {} as any
    // if (config?.from === 'AU') {
    //   requestData.username = formDataUserAction?.['username']
    //   requestData.email = formDataUserAction?.['username']
    //   requestData.password = formDataUserAction?.['password']
    // } else {
    //   requestData.username = formDataUserAction?.['username']
    //   requestData.password = formDataUserAction?.['password']
    // }
    
    // const signUpUrl = config?.payload?.['signUpByDataUrl'];
    // if (!signUpUrl) throw new Error('No signUpByDataUrl in configured');
    // return this.http.post(signUpUrl, requestData);
    // routerPath
    console.log(this._routerPath)
    this._router.navigateByUrl(this._routerPath)
  }
}
