import { Injectable, Injector } from "@angular/core";
import { IAuthStrategy } from "../../models/strategy.model";
import { AskProjectIdsAction } from "../../actions/token-share/askProjectsIds.action";
import { IAuthAction } from "../../models/action.model";
import { AskBackendRoutesAction } from "../../actions/token-share/askBackendRoutes.action";


@Injectable()
export class SaveTempDuplicateStrategy implements IAuthStrategy {

  constructor (
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
   * забрать конфиг,
   * разослать запросы на бэки
   */
  
  /**
   * Отсылаем в хост,
   * хост возвращает проекты
   * 
   */
  handleInitScenario () {
    console.log('handleInitScenario')
    this.injector
      .get<IAuthAction>(AuthActionMap.get('ASK_PROJECTS_IDS'))
      .execute(true);

    // this.injector
    //   .get<IAuthAction>(AuthActionMap.get('ASK_PROJECTS_IDS'))
    //   .execute(true);

          //ASK_BACKEND_ROUTES
  }
}

export const AuthActionMap = new Map<string, any>([
  ['ASK_PROJECTS_IDS', AskProjectIdsAction],
  ['ASK_BACKEND_ROUTES', AskBackendRoutesAction],
  
]);
