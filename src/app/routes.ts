import { provideRouter, RouterConfig } from '@angular/router';

import {PrayerTimesComponent} from './prayer-times/prayer-times.component'
import {AboutUsComponent} from './about-us/about-us.component'
import {TermDefinitionsComponent} from './term-definitions/term-definitions.component'
import {termDefinitionsRoutes} from './term-definitions/term-definitions.routes'
export const routes: RouterConfig = [
  ...termDefinitionsRoutes,
  { path: '', component: PrayerTimesComponent },
  { path: 'about-us', component: AboutUsComponent }
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];

