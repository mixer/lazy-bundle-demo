import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'lz-lazy',
  template: 'This is the lazy module! Hello {{ name }}!',
})
export class LazyComponent {
  @Input() public name: string;

  @HostBinding('style.color')
  @Input()
  public color: string;
}
