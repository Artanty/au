import { Inject, Injectable } from '@angular/core';
import { BusEvent, EVENT_BUS_LISTENER, EVENT_BUS_PUSHER, HOST_NAME } from 'typlib';
import { ConfigService } from '../../services/config.service';
import { IAuthAction } from '../../models/action.model';
import { filter, map, Observable, of, ReplaySubject, scan, Subject, take, takeUntil, timeout } from 'rxjs';
import { eventBusFilterByProject } from '../../auth.module';
import { eventBusFilterByEvent } from './askProjectsIds.action';

export const filterIdByProjectId = (id: string, exclude?: boolean): boolean => {
  return exclude
  ? id !== process.env['PROJECT_ID']
  : id === process.env['PROJECT_ID']
  
}
@Injectable()
export class AskBackUrlsAction implements IAuthAction {
  constructor(
    // @Inject(HOST_NAME) private readonly hostName: string,
    // @Inject(ConfigService) private ConfigServ: ConfigService,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void,
    @Inject(EVENT_BUS_LISTENER)
    private readonly eventBusListener$: Observable<BusEvent>,
  ) {}

  public execute(projectIds: string[]): Observable<Array<{project_id: string, back_url: string}>> {
    // Filter out our own project ID if needed
    const targetProjects = new Set(projectIds.filter(id => filterIdByProjectId(id, true)));

    // Send the initial request
    const busEvent: BusEvent = {
        from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
        to: `faq@web-host`,
        event: 'ASK_BACK_URLS',
        payload: {},
    };
    this.eventBusPusher(busEvent);

    return this.eventBusListener$.pipe(
        // Filter relevant events
        filter(eventBusFilterByProject),
        filter(event => eventBusFilterByEvent(event, 'BACK_URLS')),
        
        // Accumulate responses in an object {project_id: back_url}
        scan((acc, event) => {
            const { project_id, back_url } = event.payload;
            if (targetProjects.has(project_id)) {
                return {...acc, [project_id]: back_url};
            }
            return acc;
        }, {} as Record<string, string>),
        
        // Check if we have all required projects
        filter(collectedUrls => {
            return Array.from(targetProjects).every(projectId => 
                projectId in collectedUrls
            );
        }),
        
        // Convert to array format when complete
        map(collectedUrls => {
            return Array.from(targetProjects).map(projectId => ({
                project_id: projectId,
                back_url: collectedUrls[projectId]
            }));
        }),
        
        // Complete after first emission
        take(1),
        
        // Optional timeout
        timeout(10000)
    );
  }

// before refactor
  // public execute(projectIds: string[]): Observable<void> {
    
  //   const targetProjects = projectIds.filter(id => filterIdByProjectId(id, true));
  //   const requiredCount = targetProjects.length;

  //   const isAllCollected$ = new ReplaySubject<void>(1)
  //   const collectedProjects = new Set<string>();
    
  //   const subscription = this.waitForResponse().subscribe({
  //     next: (event) => {
  //         const projectId = event.payload.project_id;
          
  //         if (targetProjects.includes(projectId)) {
  //             collectedProjects.add(projectId);
  //             if (collectedProjects.size === requiredCount) {
  //                 isAllCollected$.next();
  //                 isAllCollected$.complete();
  //                 subscription.unsubscribe();
  //             }
  //         }
  //     },
  //     error: (err) => {
  //         isAllCollected$.error(err);
  //         subscription.unsubscribe();
  //     }
  // });

  //   const busEvent: BusEvent = {
  //       from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
  //       to: `faq@web-host`,
  //       event: 'ASK_BACK_URLS',
  //       payload: {},
  //   };
  //   this.eventBusPusher(busEvent);

  //   return isAllCollected$.asObservable();
  // }

  // waitForResponse () {
  //   return this.eventBusListener$.pipe(
  //     filter(eventBusFilterByProject),
  //     filter(event => eventBusFilterByEvent(event, 'BACK_URLS'))
  //   )
  // }
}

