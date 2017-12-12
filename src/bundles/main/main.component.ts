import { Component } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'body',
  template: `
    This is the main module!

    <br><br>

    <lz-dynamic-loader
      [bundle]="bundle"
      component="LazyModule#lz-lazy"
      [inputs]="{ name: 'Connor', color: color }">
    </lz-dynamic-loader>
  `,
})
export class MainComponent {
  public bundle = System.import('../lazy/lazy.module');
  public color = Observable.interval(1000).map(x => (x % 2 ? '#000' : '#f00'));
}
