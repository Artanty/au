import {
  Directive, ElementRef, Renderer2, ComponentFactoryResolver, 
  ViewContainerRef, Input, OnInit, OnDestroy, Injector
} from '@angular/core';
import { GuiService, NATIVE_ELEMENT } from './gui.service';
import { WebComponentWrapperComponent } from './web-component-wrapper';


@Directive({
  selector: '[gui]'
})
export class GuiDirective implements OnInit, OnDestroy {
  @Input() inputs: any = {};
  @Input() outputs: any = {};
  
  private nativeSelect: HTMLSelectElement;
  private customComponentRef: any;
  private isUsingCustomComponent = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private componentFactoryResolver: ComponentFactoryResolver,
    private viewContainerRef: ViewContainerRef,
    private guiService: GuiService,
    private injector: Injector
  ) {
    this.nativeSelect = this.el.nativeElement;
  }

  async ngOnInit() {
    console.log(this.inputs)
    try {
      const tagName = this.el.nativeElement.tagName;
      const customElementName = await this.guiService.getCustomElement(tagName)
      if (customElementName === NATIVE_ELEMENT) {
        // this.enhanceNativeSelect();
      } else {
        await this.replaceWithCustomComponent(customElementName)
      }
    } catch (error) {
      console.warn('Failed to initialize custom select, falling back to native', error);
      // this.enhanceNativeSelect();
    }
  }

  private async replaceWithCustomComponent(customElementName: string): Promise<void> {
    try {
      // Hide the native select element
      this.renderer.setStyle(this.nativeSelect, 'display', 'none');
      this.renderer.setAttribute(this.nativeSelect, 'aria-hidden', 'true');
      
      // Create the web component wrapper
      const factory = this.componentFactoryResolver.resolveComponentFactory(WebComponentWrapperComponent);
      this.customComponentRef = this.viewContainerRef.createComponent(factory, undefined, this.injector);
      
      // Set up the web component with inputs and outputs from the directive
      this.setupWebComponent(customElementName);
      
      this.isUsingCustomComponent = true;
      
      console.log('Successfully replaced native select with custom component');
      
    } catch (error) {
      console.error('Error creating custom component', error);
      this.fallbackToNative();
    }
  }

  private setupWebComponent(customElementName: string) {
    const instance = this.customComponentRef.instance as WebComponentWrapperComponent;
    
    // Prepare the inputs for the web component
    const webComponentInputs = {
      ...this.inputs, // Spread all inputs from the directive
      // Ensure we have required properties
      // label: this.inputs?.label || this.getLabelFromNative(),
      // value: this.inputs?.value !== undefined ? this.inputs.value : this.nativeSelect.value,
      // disabled: this.inputs?.disabled !== undefined ? this.inputs.disabled : this.nativeSelect.disabled,
      // required: this.inputs?.required !== undefined ? this.inputs.required : this.nativeSelect.required,
      // name: this.inputs?.name || this.nativeSelect.name,
      // id: this.inputs?.id || this.nativeSelect.id
    };
    
    // Prepare outputs - wrap valueChange to also update native select
    const webComponentOutputs = {
      ...this.outputs,
      // valueChange: (value: any) => {
      //   // Update native select value for form submission
      //   this.nativeSelect.value = value;
        
      //   // Trigger change event on native select for Angular forms
      //   this.triggerChangeEvent();
        
      //   // Call the original valueChange handler if provided
      //   if (this.outputs?.valueChange) {
      //     this.outputs.valueChange(value);
      //   }
      // },
      // error: (error: any) => {
      //   console.error('Custom component error:', error);
      //   if (this.outputs?.error) {
      //     this.outputs.error(error);
      //   }
      // }
    };
    
    // Configure the web component wrapper
    instance.componentName = customElementName;
    instance.inputs = webComponentInputs;
    instance.outputs = webComponentOutputs;
  }

  // private getLabelFromNative(): string {
  //   return this.nativeSelect.getAttribute('aria-label') || 
  //          this.nativeSelect.getAttribute('title') || 
  //          this.nativeSelect.getAttribute('name') || 
  //          '';
  // }

  // private triggerChangeEvent() {
  //   // Create and dispatch change event on native select
  //   const event = new Event('change', { bubbles: true });
  //   this.nativeSelect.dispatchEvent(event);
    
  //   // Also dispatch input event for reactive forms
  //   const inputEvent = new Event('input', { bubbles: true });
  //   this.nativeSelect.dispatchEvent(inputEvent);
  // }

  private fallbackToNative() {
    if (this.isUsingCustomComponent) {
      // Clean up custom component
      if (this.customComponentRef) {
        this.customComponentRef.destroy();
        this.customComponentRef = null;
      }
      
      // Show native select
      this.renderer.setStyle(this.nativeSelect, 'display', '');
      this.renderer.removeAttribute(this.nativeSelect, 'aria-hidden');
      
      this.isUsingCustomComponent = false;
      
      console.log('Fell back to native select');
    }
  }

  // private enhanceNativeSelect() {
  //   // Add some basic enhancements to native select when custom component is not used
  //   this.renderer.addClass(this.nativeSelect, 'enhanced-native-select');
    
  //   // Add custom styling
  //   this.renderer.setStyle(this.nativeSelect, 'padding', '10px 12px');
  //   this.renderer.setStyle(this.nativeSelect, 'border-radius', '6px');
  //   this.renderer.setStyle(this.nativeSelect, 'border', '2px solid #e2e8f0');
  //   this.renderer.setStyle(this.nativeSelect, 'font-size', '14px');
  //   this.renderer.setStyle(this.nativeSelect, 'min-width', '200px');
    
  //   // Add hover and focus styles
  //   this.nativeSelect.addEventListener('mouseenter', () => {
  //     this.renderer.setStyle(this.nativeSelect, 'border-color', '#cbd5e0');
  //   });
    
  //   this.nativeSelect.addEventListener('mouseleave', () => {
  //     this.renderer.setStyle(this.nativeSelect, 'border-color', '#e2e8f0');
  //   });
    
  //   this.nativeSelect.addEventListener('focus', () => {
  //     this.renderer.setStyle(this.nativeSelect, 'border-color', '#3b82f6');
  //     this.renderer.setStyle(this.nativeSelect, 'box-shadow', '0 0 0 3px rgba(59, 130, 246, 0.1)');
  //     this.renderer.setStyle(this.nativeSelect, 'outline', 'none');
  //   });
    
  //   this.nativeSelect.addEventListener('blur', () => {
  //     this.renderer.setStyle(this.nativeSelect, 'border-color', '#e2e8f0');
  //     this.renderer.setStyle(this.nativeSelect, 'box-shadow', 'none');
  //   });
  // }

  ngOnDestroy() {
    // Clean up
    if (this.customComponentRef) {
      this.customComponentRef.destroy();
    }
  }
}