import { provideRouter, RouterConfig } from '@angular/router';

import {PrayerTimesComponent} from './prayer-times/prayer-times.component'
import {AboutUsComponent} from './about-us/about-us.component'

export const routes: RouterConfig = [
  { path: '', component: PrayerTimesComponent },
  { path: 'about-us', component: AboutUsComponent }
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];
