import { Component } from '@angular/core';
import {PrayerTimesComponent} from './prayer-times/prayer-times.component'
import {
	MapsAPILoader,
	NoOpMapsAPILoader,
	MouseEvent,
	LazyMapsAPILoaderConfig,
	ANGULAR2_GOOGLE_MAPS_PROVIDERS,
	ANGULAR2_GOOGLE_MAPS_DIRECTIVES
} from 'angular2-google-maps/core';
@Component({
 // moduleId: module.id,
  selector: 'angular2-salah-times-app',
  templateUrl: './app/angular2-salah-times.component.html',
  styleUrls: ['./app/angular2-salah-times.component.css'],
  directives: [PrayerTimesComponent,ANGULAR2_GOOGLE_MAPS_DIRECTIVES],
})
export class Angular2SalahTimesAppComponent {
  title = 'Muslim Prayer Times and Directions';
}
