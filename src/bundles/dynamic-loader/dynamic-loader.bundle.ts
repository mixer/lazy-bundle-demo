import { NgModule } from '@angular/core';

import { DynamicCompilerService } from './dynamic-compiler.service';
import { DynamicLoaderComponent } from './dynamic-loader.component';

// @if IS_AOT
import { NgModuleFactoryLoader, SystemJsNgModuleLoader } from '@angular/core';
import { DynamicAoTCompilerService } from './dynamic-compiler.service';
// @endif
// @if !IS_AOT
import { DynamicJiTCompilerService } from './dynamic-compiler.service';
// @endif

@NgModule({
  declarations: [DynamicLoaderComponent],
  providers: [
    // @if IS_AOT
    {
      provide: DynamicCompilerService,
      useClass: DynamicAoTCompilerService,
    },
    {
      provide: NgModuleFactoryLoader,
      useClass: SystemJsNgModuleLoader,
    },
    // @endif
    // @if !IS_AOT
    {
      provide: DynamicCompilerService,
      useClass: DynamicJiTCompilerService,
    },
    // @endif
  ],
  exports: [DynamicLoaderComponent],
})
export class DynamicLoaderModule {}
