import { Inject, Injectable } from "@angular/core";
import { IViewState, ViewService } from "../../services/view.service";
import { IAuthAction } from "../../models/action.model";
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class DisplayUnknownErrorAction implements IAuthAction {

  constructor (
    @Inject(ViewService) private readonly ViewServ: ViewService
  ) {}

  public execute (err: HttpErrorResponse) {
    console.log(err)

    let errorText

    if (err instanceof Error && err.message.includes('NullInjectorError')) {
      const match = err.message.match(/NullInjectorError: No provider for [\w]+!/);
      if (match) {

        // Extract the module name (AuthModule)
        const moduleStart = err.message.indexOf('R3InjectorError(') + 'R3InjectorError('.length;
        const moduleEnd = err.message.indexOf(')', moduleStart);
        const moduleName = err.message.slice(moduleStart, moduleEnd); // AuthModule

        // Extract the service name (GoToLoginAction)
        const serviceStart = err.message.lastIndexOf('No provider for ') + 'No provider for '.length;
        const serviceEnd = err.message.lastIndexOf('!');
        const serviceName = err.message.slice(serviceStart, serviceEnd); // GoToLoginAction

        if (serviceName && moduleName) {
          errorText = `NullInjectorError: No provider for ${serviceName} in ${moduleName}`
        } else {
          errorText = match[0]
        }
      } else {
        errorText = `Dependency Injection Error:, ${err}`
      }
    }
    if (err.error?.message) {
      errorText = err.error?.message
    }
    if (err.error?.error) {
      errorText = err.error?.error
    }

    const viewState: IViewState = {
      scope: 'FORM',
      action: 'DISPLAY_ERROR',
      payload: {
        message: errorText || 'Неизвестная ошибка'
      }
    }
    this.ViewServ.setViewState(viewState)
  }

}
