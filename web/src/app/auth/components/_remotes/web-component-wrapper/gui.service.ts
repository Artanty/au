import { Injectable } from "@angular/core";
import { waitForWebComponent } from "./gui.utils";

export const NATIVE_ELEMENT = 'NATIVE_ELEMENT'
export const ElementsMap = {
  SELECT: 'gui-select'
}
@Injectable({
  providedIn: 'root',
})
export class GuiService {
  async shouldUseCustomSelect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(false)
    })
  }

  public async getCustomElement(tagName: keyof typeof ElementsMap): Promise<string> {
    return new Promise(async (resolve, reject) => {
      let result = NATIVE_ELEMENT
      if (ElementsMap[tagName]) {
        result = ElementsMap[tagName]
        const res = await waitForWebComponent(result)
      }
      console.log(`tagName: ${tagName}. Custom element: ${result}`);
      resolve(result)
    })
    
  }

  notifyFallback(data: any) {
    
  }
}


// async ngOnInit() {
//     try {
//       const tagName = this.el.nativeElement.tagName;
//       const element = await this.guiService.getCustomElement(tagName)
//       if (element === NATIVE_ELEMENT) {
//         this.enhanceNativeSelect();
//       } else {
//         await this.replaceWithCustomSelect(element)
//       }
//     } catch (error) {
//       console.warn('Failed to initialize custom select, falling back to native', error);
//       this.enhanceNativeSelect();
//     }
//   }


// private async setupWebComponent(elementName: string): Promise<void> {
// const instance = this.customComponentRef.instance as WebComponentWrapperComponent;
    
// // Configure the web component wrapper
// instance.componentName = elementName; //'gui-select';