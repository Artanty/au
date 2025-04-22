import { Injectable, Injector } from "@angular/core";
import { IAuthStrategy } from "../../models/strategy.model";
import { AskProjectIdsAction } from "../../actions/token-share/askProjectsIds.action";
import { IAuthAction } from "../../models/action.model";
import { AskBackendRoutesAction } from "../../actions/token-share/askBackendRoutes.action";
import { AskBackUrlsAction } from "../../actions/token-share/askBackUrls.action";
import { Observable } from "rxjs";
import { BusEvent } from "typlib";
import { InitTokenShareStoreAction } from "../../actions/token-share/initTokenShareStore.action";
import { GetRequiredProjectsIdsAction } from "../../actions/token-share/getRequiredProjectsIds.action";


@Injectable()
export class SaveTempDuplicateStrategy implements IAuthStrategy {

  constructor(
    private injector: Injector
  ) {}
  
  runScenario(scenario: string) {
    
    switch (scenario) {
      case 'init':
        this.handleInitScenario();
        break;
      
      default:
        throw new Error(`Unknown scenario: ${scenario}`);
    }
  }
  
  /**
   * 1 забрать конфиг ASK_PROJECTS_IDS,
   * 2 записать их в стор для заполнения INIT_TOKEN_SHARE_STORE
   * 3 спросить адреса бэков всех проектов ASK_BACK_URLS
   * 4 добавить полученные адреса в стор
   * разослать запросы на бэки
   */
  handleInitScenario() {
    /**
     * todo: 
     * check on host that all the remotes are loaded.
     * if one is not - remove it from projectIds for @au
     * try to reconnect it for 10 sec? )
     */
    const projectIds$ = this.injector
      .get<IAuthAction>(AuthActionMap.get('ASK_PROJECTS_IDS'))
      .execute()

    projectIds$.subscribe((res: string[]) => {
      
      const externals = this.injector
        .get<IAuthAction>(AuthActionMap.get('INIT_TOKEN_SHARE_STORE'))
        .execute(res)

      const requiredProjectsIds: any = []
      // this.injector
      //   .get('GET_REQUIRED_PROJECTS_IDS')
      //   .execute()

      const backUrls$ = this.injector
        .get<IAuthAction>(AuthActionMap.get('ASK_BACK_URLS'))
        .execute(requiredProjectsIds)

      backUrls$.subscribe((res: any) => { 
        console.log(res)
      })
    })

    // const backUrls$ = this.injector
    //     .get<IAuthAction>(AuthActionMap.get('ASK_BACK_URLS'))
    //     .execute(['au', 'faq'])

    //   backUrls$.subscribe((res: any) => {
    //     console.log(res)
    //   })
      

    
      
  }
}

export const AuthActionMap = new Map<string, any>([
  ['ASK_PROJECTS_IDS', AskProjectIdsAction],
  ['ASK_BACK_URLS', AskBackUrlsAction],
  // ['ASK_BACKEND_ROUTES', AskBackendRoutesAction],
  ['INIT_TOKEN_SHARE_STORE', InitTokenShareStoreAction],
  ['GET_REQUIRED_PROJECTS_IDS', GetRequiredProjectsIdsAction],
]);
