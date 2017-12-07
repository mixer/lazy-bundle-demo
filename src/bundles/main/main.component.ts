import { Component } from '@angular/core';

@Component({
  selector: 'body',
  template: `
    This is the main module!

    <br><br>

    <lz-dynamic-loader
      [bundle]="bundle"
      component="LazyModule#lz-lazy"
      [inputs]="{ name: 'Connor' }">
    </lz-dynamic-loader>
  `,
})
export class MainComponent {
  public bundle = System.import('../lazy/lazy.module');
}
