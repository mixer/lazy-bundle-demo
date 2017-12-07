import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MainComponent } from './main.component';
import { DynamicLoaderModule } from '../dynamic-loader/dynamic-loader.bundle';

@NgModule({
  imports: [BrowserModule, DynamicLoaderModule],
  declarations: [MainComponent],
  bootstrap: [MainComponent],
})
export class MainModule {}
