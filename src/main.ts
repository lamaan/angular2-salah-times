import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode,provide } from '@angular/core';
import {ANGULAR2_GOOGLE_MAPS_PROVIDERS,LazyMapsAPILoaderConfig} from 'angular2-google-maps/core';
import { HTTP_PROVIDERS } from '@angular/http';
import { Angular2SalahTimesAppComponent, environment } from './app/';

if (environment.production) {
  enableProdMode();
}

bootstrap(Angular2SalahTimesAppComponent, [ANGULAR2_GOOGLE_MAPS_PROVIDERS, HTTP_PROVIDERS,
	provide(LazyMapsAPILoaderConfig, {
		useFactory: () => {
			let config = new LazyMapsAPILoaderConfig();
			config.apiKey = 'AIzaSyCckoyU8WKZBOyNvwiBpljj_i-80H2KdBk';
			return config;
		}
	})]);

