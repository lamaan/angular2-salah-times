import { provideRouter, RouterConfig } from '@angular/router';

import {PrayerTimesComponent} from './prayer-times/prayer-times.component'
import {AboutUsComponent} from './about-us/about-us.component'
import {WordDefinitionsComponent} from './word-definitions/word-definitions.component'
import {wordDefinitionsRoutes} from './word-definitions/word-definitions.routes'
export const routes: RouterConfig = [
  ...wordDefinitionsRoutes,
  { path: '', component: PrayerTimesComponent },
  { path: 'about-us', component: AboutUsComponent }
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];
