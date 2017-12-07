import 'core-js/es7/reflect';
import 'zone.js/dist/zone';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { MainModule } from './bundles/main/main.module';

platformBrowserDynamic().bootstrapModule(MainModule);
