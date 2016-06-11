import { Component } from '@angular/core';
import {PrayerTimesComponent} from './prayer-times/prayer-times.component'
@Component({
 // moduleId: module.id,
  selector: 'angular2-salah-times-app',
  templateUrl: './app/angular2-salah-times.component.html',
  styleUrls: ['./app/angular2-salah-times.component.css'],
  directives: [PrayerTimesComponent]
})
export class Angular2SalahTimesAppComponent {
  title = 'Muslim Prayer Times and Directions';
}
