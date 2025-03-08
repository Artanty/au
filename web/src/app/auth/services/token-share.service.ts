import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ExternalUpdateBody {
  backendUrl: string,
  // status: string,
  lastUpdated: string,
  ignore?: boolean
}
export interface ExternalUpdates {
  [key: string]: ExternalUpdateBody
}

@Injectable()
export class TokenShareService {

  private initial: ExternalUpdates = {
    au: {
      backendUrl: `${process.env['AU_BACK_URL']}`,
      lastUpdated: '',
      ignore: true
    }
  }

  private store$ = new BehaviorSubject<ExternalUpdates>(this.initial)

  public setStore (data: ExternalUpdates) {
    this.store$.next(data)
  }

  public getStore (): ExternalUpdates {
    return this.store$.value
  }

  public listenStore (): Observable<ExternalUpdates> {
    return this.store$.asObservable()
  }

  public addProjects (projectIds: string | string[]) {
    if (!Array.isArray(projectIds)) {
      projectIds = [projectIds]
    }
    const current = { ...this.getStore()}
    projectIds.forEach((projectId: string) => {
      if (!current[projectId]) {
        current[projectId] = this.getProgectBodyTemplate()
      }
    })
    this.setStore(current)
  }

  /**
   * Добавляет в стор адрес {url} бэка  
   * определенного mfe приложения {projectId}
   */
  public addRouteToExternalUpdates (projectId: string, url: string) {
    const current = { ...this.getStore()}
    if (!current[projectId]) {
      current[projectId] = {
        backendUrl: url,
        lastUpdated: ''
      }
    } else {
      current[projectId]['backendUrl'] = url
    }
    console.log(current)
    this.setStore(current)
  }

  

  constructor() { }

  private getProgectBodyTemplate (): ExternalUpdateBody {
    return {
      backendUrl: '',
      lastUpdated: '',
      ignore: false
    }
  }

  

}