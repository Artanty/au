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

  public setStore(data: ExternalUpdates) {
    this.store$.next(data)
  }

  public getStore(): ExternalUpdates {
    return this.store$.value
  }

  public getRequiredProjectsIds(): string[] {
    // const data = this.store$.value
    // if (Object.keys(data).length > 0) throw new Error('wrong data in store')
    
    // return Object.entries(data).reduce((acc, [key, body]) => {
    //   if (!body.ignore) {
    //     acc.push(key)
    //   }
    //   return acc;
    // }, [] as string[])
    return []
  }

  public showStore(): void {
    console.log('TOKEN_SHARE_STORE: ')
    console.log(this.getStore())
  }

  public listenStore(): Observable<ExternalUpdates> {
    return this.store$.asObservable()
  }

  public addProjects(projectIds: string | string[]): void {
    if (!Array.isArray(projectIds)) {
      projectIds = [projectIds]
    }
    const current = { ...this.getStore() }
    projectIds.forEach((projectId: string) => {
      if (!current[projectId]) {
        current[projectId] = this.getProjectBodyTemplate()
      }
    })
    this.setStore(current)
  }

  /**
   * Добавляет в стор адрес {url} бэка  
   * определенного mfe приложения {projectId}
   */
  public addRouteToExternalUpdates(projectId: string, url: string) {
    const current = { ...this.getStore() }
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

  

  constructor() {}

  private getProjectBodyTemplate(): ExternalUpdateBody {
    return {
      backendUrl: '',
      lastUpdated: '',
      ignore: false
    }
  }

  

}