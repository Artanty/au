import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ExternalUpdateBody {
  backendUrl: string,
  isShared: boolean,
  isValid: boolean,
  isValidated: boolean,
  lastUpdated: string,
  ignore?: boolean,
  projectId: string,
}
export interface ExternalUpdates {
  [key: string]: ExternalUpdateBody
}

@Injectable()
export class TokenShareService {

  private initial: ExternalUpdates = {
    au: {
      projectId: 'au',
      backendUrl: `${process.env['AU_BACK_URL']}`,
      lastUpdated: '',
      ignore: true,
      isShared: false,
      isValid: true,
      isValidated: true,
    }
  }

  private store$ = new BehaviorSubject<ExternalUpdates>(this.initial)

  public setStore(data: ExternalUpdates) {
    this.store$.next(data)
  }

  public getStore(): ExternalUpdates {
    return this.store$.value
  }

  public getRequiredProjects(): ExternalUpdates {
    const data = this.store$.value
    if (!Object.keys(data).length) throw new Error('store is empty')
    return Object.entries(data).reduce((acc, [key, body]) => {
      if (!body.ignore) {
        acc[key] = body
      }
      return acc;
    }, {} as ExternalUpdates)
  }

  public getRequiredProjectsIds(): string[] {
    const data = this.store$.value
    if (!Object.keys(data).length) throw new Error('store is empty')
    return Object.entries(data).reduce((acc, [key, body]) => {
      if (!body.ignore) {
        acc.push(key)
      }
      return acc;
    }, [] as string[])
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
        current[projectId] = this.getProjectBodyTemplate(projectId)
      }
    })
    this.setStore(current)
  }

  /**
   * Добавляет в стор адрес {url} бэка  
   * определенного mfe приложения {projectId}
   */
  public setBackUrl(projectId: string, url: string): void {
    const current = { ...this.getStore() }
    if (!current[projectId]) {
      throw new Error('project id ' + projectId + ' not exist')
    } else {
      current[projectId]['backendUrl'] = url
    }
    this.setStore(current)
  }

  public setSharedState(projectId: string, isShared: boolean): void {
    const current = { ...this.getStore() }
    if (!current[projectId]) {
      throw new Error('project id ' + projectId + ' not exist')
    } else {
      current[projectId]['isShared'] = isShared
    }
    this.setStore(current)
  }

  public setValidState(projectId: string, isValid: boolean): void {
    const current = { ...this.getStore() }
    if (!current[projectId]) {
      throw new Error('project id ' + projectId + ' not exist')
    } else {
      current[projectId]['isValid'] = isValid
      current[projectId]['isValidated'] = true

    }
    this.setStore(current)
  }  

  constructor() {}

  private getProjectBodyTemplate(projectId: string): ExternalUpdateBody {
    return {
      projectId: projectId,
      backendUrl: '',
      lastUpdated: '',
      ignore: false,
      isShared: false,
      isValid: false,
      isValidated: false,
    }
  }
}