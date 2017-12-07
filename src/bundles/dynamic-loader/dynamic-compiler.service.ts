import {
  Compiler,
  ComponentFactory,
  Injectable,
  Injector,
  NgModuleFactory,
  NgModuleFactoryLoader,
  NgModuleRef,
  Type,
} from '@angular/core';

/**
 * The DynamicCompilerService imports NgModuleFactories appropriate for
 * the current build envionrment.
 */
export abstract class DynamicCompilerService {
  constructor(protected readonly injector: Injector) {}

  /**
   * Lazy loads the bundle from the specified path. This does some trickery to
   * work in both AoT and development. The provided path should be relative
   * to the base `src` path.
   *
   * Note: in JIT, bundle will be a promise from System.import, AoT will
   * rewrite it to a special object.
   */
  public abstract lazyLoadBundle<T>(bundle: any, moduleName: string): Promise<NgModuleFactory<T>>;

  /**
   * createComponent instantiates the module and creates a component
   * factory after looking up the component by name. Like `lazyLoadBundle`,
   * the path is relative to `src`. When you're done with the module,
   * you should call `module.destroy()`. The component must be an
   * entryComponent of the target bundle.
   */
  public createComponent<C, M>(
    bundle: any,
    moduleName: string,
    selector: string,
  ): Promise<{ module: NgModuleRef<M>; component: ComponentFactory<C> }> {
    return this.lazyLoadBundle<M>(bundle, moduleName).then(factory => {
      const modRef = factory.create(this.injector);

      // Little hack here: Angular doesn't give us a way to directly look up
      // a component factory by its name.
      const factories: Map<Type<C>, { selector: string }> = (<any>modRef.componentFactoryResolver)
        ._factories;
      const resolved = Array.from(factories.entries()).find(([, value]) => {
        return value.selector === selector;
      });

      if (!resolved) {
        modRef.destroy();
        throw new Error(
          `Cannot find component ${selector} in ${moduleName}. ` +
            'Make sure it exists and is in the module entryComponents.',
        );
      }

      return {
        module: modRef,
        component: modRef.componentFactoryResolver.resolveComponentFactory(resolved[0]),
      };
    });
  }
}

@Injectable()
export class DynamicAoTCompilerService extends DynamicCompilerService {
  constructor(private readonly loader: NgModuleFactoryLoader, injector: Injector) {
    super(injector);
  }

  /**
   * @override
   */
  public lazyLoadBundle<T>(
    bundle: { loadAoT: string },
    moduleName: string,
  ): Promise<NgModuleFactory<T>> {
    const [, name] = /([a-z]+)\.module/.exec(bundle.loadAoT);
    return this.loader.load(`../${name}/${name}.module.ts#${moduleName}`);
  }
}

@Injectable()
export class DynamicJiTCompilerService extends DynamicCompilerService {
  constructor(private readonly compiler: Compiler, injector: Injector) {
    super(injector);
  }

  /**
   * @override
   */
  public lazyLoadBundle<T>(
    bundle: Promise<{ [key: string]: any }>,
    moduleName: string,
  ): Promise<NgModuleFactory<T>> {
    return bundle.then(result => {
      const module = result[moduleName];
      if (!module) {
        throw new Error(`Bundle has no export ${moduleName}`);
      }

      return this.compiler.compileModuleAsync<T>(module);
    });
  }
}
