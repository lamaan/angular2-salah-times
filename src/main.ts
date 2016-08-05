import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode,provide } from '@angular/core';
import {AlertComponent, DATEPICKER_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';
import {
	ANGULAR2_GOOGLE_MAPS_PROVIDERS,
	ANGULAR2_GOOGLE_MAPS_DIRECTIVES,
	LazyMapsAPILoaderConfig,
	MapsAPILoader,
	NoOpMapsAPILoader
} from 'angular2-google-maps/core';

import { HTTP_PROVIDERS } from '@angular/http';
import { Angular2SalahTimesAppComponent, environment } from './app/';
import { APP_ROUTER_PROVIDERS } from './app/routes';
if (environment.production) {
  enableProdMode();
}

bootstrap(Angular2SalahTimesAppComponent, [
	ANGULAR2_GOOGLE_MAPS_PROVIDERS, 
	ANGULAR2_GOOGLE_MAPS_DIRECTIVES,
	HTTP_PROVIDERS, 
	DATEPICKER_DIRECTIVES,
	APP_ROUTER_PROVIDERS,
	//provide(MapsAPILoader, {useClass: NoOpMapsAPILoader})
	provide(LazyMapsAPILoaderConfig, {
		useFactory: () => {
			let config = new LazyMapsAPILoaderConfig();
			config.apiKey = 'AIzaSyCckoyU8WKZBOyNvwiBpljj_i-80H2KdBk';
			return config;
		}
	})
]);

