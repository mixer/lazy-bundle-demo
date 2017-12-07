import { Component, Input } from '@angular/core';

@Component({
  selector: 'lz-lazy',
  template: 'This is the lazy module! Hello {{ name }}!',
})
export class LazyComponent {
  @Input() public name: string;
}
