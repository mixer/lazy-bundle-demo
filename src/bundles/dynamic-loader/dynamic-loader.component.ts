import {
  ChangeDetectionStrategy,
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
 * </b-dynamic-loader>
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
   * Fired when the component loads in.
   */
  @Output() public loaded = new EventEmitter<void>();

  private modRef: NgModuleRef<any>;
  private compRef: ComponentRef<any>;
  private destroyed = false;

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
        Object.assign(this.compRef.instance, this.inputs);
        this.loaded.emit();
      })
      .catch(err => {
        throw new Error(`Error loading ${this.component}: ${err.stack || err.message}`);
      });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.inputs && this.compRef) {
      Object.assign(this.compRef.instance, changes.inputs.currentValue);
    }

    // Homework assignment: look for rxjs observables in the input,
    // unwrap them automatically, updating the target and triggering
    // change detection when they emit!
  }

  public ngOnDestroy() {
    this.destroyed = true;

    if (this.compRef) {
      this.compRef.destroy();
      this.modRef.destroy();
    }
  }
}
