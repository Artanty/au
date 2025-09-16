
import { NgModule, Injector, ApplicationRef, DoBootstrap } from '@angular/core';
import { createCustomElement } from '@angular/elements';

import { CommonModule } from '@angular/common';
import { UserAvatarComponent } from './components/_remotes/user-avatar/user-avatar.component';

const mapping: any = {
  'au-user-avatar': UserAvatarComponent
}

export function defineCustomElement(customElementName: string, injector?: Injector): void {
  if (typeof customElements !== 'undefined' && !customElements.get(customElementName)) {
    // If no injector is provided, use a fallback (less ideal but works)
    const effectiveInjector = injector || (window as any).ngInjector;
    
    if (effectiveInjector) {
      const customElement = createCustomElement(mapping[customElementName], { 
        injector: effectiveInjector 
      });
      customElements.define(customElementName, customElement);
      // console.log('customElement: ' + customElementName + ' defined')
    } else {
      console.warn('No injector available for custom element registration');
    }
  }
}

// Also export the component for direct usage
// export { UserAvatarComponent } from './user-avatar.component';