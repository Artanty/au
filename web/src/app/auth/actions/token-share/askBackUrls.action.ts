import { Inject, Injectable } from '@angular/core';
import { BusEvent, EVENT_BUS_LISTENER, EVENT_BUS_PUSHER, HOST_NAME } from 'typlib';
import { ConfigService } from '../../services/config.service';
import { IAuthAction } from '../../models/action.model';
import { filter, map, Observable, of, ReplaySubject, scan, Subject, take, takeUntil, timeout } from 'rxjs';
import { eventBusFilterByProject } from '../../auth.module';
import { eventBusFilterByEvent } from './askProjectsIds.action';

export interface BackUrl { project_id: string, back_url: string }

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

    public execute(projectIds: string[]): Observable<BackUrl[]> {
        
        const targetProjects = new Set(projectIds);

        const busEvent: BusEvent = {
            from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
            to: `faq@web-host`,
            event: 'ASK_BACK_URLS',
            payload: {},
        };
        this.eventBusPusher(busEvent);

        return this.eventBusListener$.pipe(
            filter(eventBusFilterByProject),
            filter(event => eventBusFilterByEvent(event, 'BACK_URLS')),
        
            // Accumulate responses in an object {project_id: back_url}
            scan((acc, event) => {
                const { project_id, back_url } = event.payload;
                if (targetProjects.has(project_id)) {
                    return { ...acc, [project_id]: back_url };
                }
                return acc;
            }, {} as Record<string, string>),
        
            // Check if we have all required projects
            filter(collectedUrls => {
                return Array.from(targetProjects).every(projectId => 
                    projectId in collectedUrls
                );
            }),
            // todo add timeout
            // Convert to array format when complete
            map(collectedUrls => {
                return Array.from(targetProjects).map(projectId => ({
                    project_id: projectId,
                    back_url: collectedUrls[projectId]
                }));
            }),
        
            take(1),
        );
    }
}

