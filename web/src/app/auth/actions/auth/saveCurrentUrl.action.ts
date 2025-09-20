import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';
import { IAuthAction } from '../../models/action.model';
import { BehaviorSubject, take } from 'rxjs';
import { Router } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';

@Injectable()
export class SaveCurrentUrlAction implements IAuthAction {

  private _router: any = null
  constructor(
    private injector: Injector, 
    private _appStateService: AppStateService
  ) {
    this._router = this.injector.get(Router);
    
  }

  public execute() {
    this._appStateService.lastRoute.next(this._router.url)
  }
}
