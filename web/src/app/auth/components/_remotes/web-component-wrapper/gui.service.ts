import { Injectable } from "@angular/core";
import { waitForWebComponent } from "./gui.utils";

export const ElementsMap = {
  SELECT__SELECT_ONE: 'gui-select',
  INPUT__RADIO: 'gui-toggle',
  INPUT__TEXT: 'gui-input',
  INPUT__PASSWORD: 'gui-input',
  BUTTON__SUBMIT: 'gui-button',
  BUTTON__BUTTON: 'gui-button'
}
@Injectable({
  providedIn: 'root',
})
export class GuiService {
  
  public async getCustomElement(elementName: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      
      try {
        if (ElementsMap[elementName as keyof typeof ElementsMap]) {
          const elName = ElementsMap[elementName as keyof typeof ElementsMap]
          const isRegistered = customElements.get(elName)
          if (!isRegistered) throw new Error(`${elName} is not registered`);
          resolve(elName)
        } else {
          throw new Error(`unknown element: ${elementName}`);
        }
      } catch (e) {
        reject(e)
      }
    })
  }
}