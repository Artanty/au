import { Injectable } from '@angular/core';
import { Observable, from, mergeMap, switchMap, of, tap } from 'rxjs';
import { ActionFactoryService } from './action-factory.service';
import { ActionType } from '../models/action-types';

@Injectable()
export class PipelineHelperService {
  constructor(private actionFactory: ActionFactoryService) {}

  // Helper to shorten action execution (synchronous)
  exec<T>(action: ActionType, ...args: any[]): T {
    return this.actionFactory.executeAction(action, ...args);
  }

  // Helper for observable actions
  exec$<T>(action: ActionType, ...args: any[]): Observable<T> {
    return this.actionFactory.executeAction(action, ...args);
  }

  // Helper for processing arrays with actions (returns observable)
  forEachExec$(action: ActionType, items: any[]): Observable<void> {
    return from(items).pipe(
      mergeMap(item => this.exec$<void>(action, item))
    );
  }

  // Helper for synchronous array processing
  forEachExec(action: ActionType, items: any[]): void {
    items.forEach(item => this.exec(action, item));
  }
}
