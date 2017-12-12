import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  Input,
  NgModuleRef,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { DynamicCompilerService } from './dynamic-compiler.service';

/**
 * The DynamicLoaderComponent creates a component from a hot-loaded bundle. To
 * use it, create a property in your component:
 *
 * ```
 * class MyAwesomeComponent {
 *   public bundle = System.import('lazy.module.ts');
 * // ...
 * ```
 *
 * Then in the template:
 *
 * ```
 * <lz-dynamic-loader
 *   [bundle]="bundle"
 *   component="LazyModule#LazyComponent"
 *   [inputs]="{ foo: 'bar' }">
 * </lz-dynamic-loader>
 * ```
 */
@Component({
  selector: 'lz-dynamic-loader',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicLoaderComponent implements OnChanges, OnInit, OnDestroy {
  /**
   * The bundle as imported from `System.import`
   */
  @Input()
  public bundle: Promise<{
    [key: string]: any;
  }>;

  /**
   * Reference to the component to load, in the format `Module#selector`.
   * The `Module` name must match the export from the bundle.
   */
  @Input() public component: string;

  /**
   * An optional list of inputs to provide to the component. Note that
   * (currently) these cannot be changed dynamically.
   */
  @Input() public inputs: { [key: string]: any } = {};

  /**
   * If true, Observable instances in the input will be subscribed to and
   * their emissions passed in as input to the component. This is equivalent
   * to an automatic application of the Angular `| async` pipe.
   */
  @Input() public unwrapObservables = true;

  /**
   * Fired when the component loads in.
   */
  @Output() public loaded = new EventEmitter<void>();

  private modRef: NgModuleRef<any>;
  private compRef: ComponentRef<any>;
  private destroyed = false;
  private subscriptions: { [input: string]: Subscription } = Object.create(null);

  constructor(
    private readonly compiler: DynamicCompilerService,
    private readonly element: ElementRef,
    private readonly viewRef: ViewContainerRef,
  ) {}

  public ngOnInit() {
    const [moduleName, componentName] = this.component.split('#');
    this.compiler
      .createComponent(this.bundle, moduleName, componentName)
      .then(({ module, component }) => {
        this.modRef = module;
        this.compRef = this.viewRef.createComponent(
          component,
          this.viewRef.length,
          this.modRef.injector,
        );

        const element = (<EmbeddedViewRef<any>>this.compRef.hostView).rootNodes[0];
        this.element.nativeElement.appendChild(element);
        this.setInputs(this.inputs);
        this.loaded.emit();
      })
      .catch(err => {
        throw new Error(`Error loading ${this.component}: ${err.stack || err.message}`);
      });
  }

  /**
   * setInputs updates the component's inputs to the set of data. Any
   * observables provided in the set of changes are subscribed to when
   * passed to the child.
   */
  private setInputs(next: any, previous: any = {}) {
    const cdRef: ChangeDetectorRef = this.compRef.injector.get(ChangeDetectorRef);
    const cls: any = this.compRef.instance;

    Object.keys(next).forEach(key => {
      const value = next[key];
      if (value === previous[key]) {
        return;
      }

      if (this.subscriptions[key] instanceof Observable) {
        this.subscriptions[key].unsubscribe();
        delete this.subscriptions[key];
      }

      if (!this.unwrapObservables || !(value instanceof Observable)) {
        cls[key] = value;
        return;
      }

      cls[key] = null; // For partity with the async pipe, which is null initially.
      this.subscriptions[key] = value.subscribe(data => {
        cls[key] = data;
        cdRef.markForCheck();
        cdRef.detectChanges();
      });
    });

    cdRef.markForCheck();
    cdRef.detectChanges();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.inputs && this.compRef) {
      this.setInputs(changes.inputs.currentValue, changes.inputs.previousValue);
    }
  }

  public ngOnDestroy() {
    this.destroyed = true;

    if (this.compRef) {
      this.compRef.destroy();
      this.modRef.destroy();
    }
  }
}
