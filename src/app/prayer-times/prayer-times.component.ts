import {Component,AfterViewInit,ViewChild} from '@angular/core'
import {PrayerTimesCalculatorService, prayerTime} from '../prayer-times-calculator.service';
import {
	MapsAPILoader, 
	NoOpMapsAPILoader, 
	LazyMapsAPILoader,
	GoogleMapsAPIWrapper,
	MouseEvent, 
	ANGULAR2_GOOGLE_MAPS_PROVIDERS,  
	ANGULAR2_GOOGLE_MAPS_DIRECTIVES} from 'angular2-google-maps/core';
declare var google: any;
declare var moment: any;
@Component({
//  moduleId: module.id,
	templateUrl: './app/prayer-times/prayer-times.component.html',
  styleUrls: ['./app/prayer-times/prayer-times.component.css'],
  selector: 'prayer-times',
  directives: [ANGULAR2_GOOGLE_MAPS_DIRECTIVES],
  providers: [PrayerTimesCalculatorService, GoogleMapsAPIWrapper]
}) export class PrayerTimesComponent implements AfterViewInit {
	@ViewChild('theMapDirective') theMapDirective: any;
	date: string;
	latitude: number;
	longitude: number;
	//	utcOffset:number;
	initialiseMap: any;
	qiblaLine: any;
	fajrAngle: number;
	ishaAngle: number;
	timeZone: string;
	fajrIsAdjusted: boolean;
	fajrAdjustedLatitude: number;
	maghribIsAdjusted: boolean;
	maghribAdjustedLatitude: number;
	constructor(private prayerTimesCalculatorService: PrayerTimesCalculatorService) {
		this.date = moment().format("YYYY-MM-DD");
		this.latitude = 53.482863;
		this.longitude = -2.3459968;
		//this.utcOffset=moment().utcOffset()/60.0;
		this.fajrAngle = 6;
		this.ishaAngle = 6;
	}
	ngAfterViewInit() {
		this.placeQiblaOnMap();
		this.getPrayerTimes();
		var self = this;
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(p) {
				self.latitude = p.coords.latitude;
				self.longitude = p.coords.longitude;
				self.placeQiblaOnMap();
				self.getPrayerTimes();
			},function(e){
				console.log("could not get your current location:"+e.message)
			});
		}
	}

	placeQiblaOnMap() {
		var self = this;

		var qiblaLineCoords = [
			{ lat: this.latitude, lng: this.longitude },
			{ lat: 21.422441833015604, lng: 39.82616901397705 }
		];
		if (this.qiblaLine != null) {
			this.qiblaLine.setMap(null);
		}
		this.theMapDirective._mapsWrapper.getMap().then(function(map) {
			self.qiblaLine = new google.maps.Polyline({
				path: qiblaLineCoords,
				geodesic: true,
				strokeColor: '#FF0000',
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			self.qiblaLine.setMap(map);
		});
	}
	prayerTimes: [prayerTime]
	getPrayerTimes() {
		this.prayerTimesCalculatorService.getPrayerTimes(this.date,
			this.latitude, this.longitude,
			//this.utcOffset,
			this.fajrAngle,
			this.ishaAngle).subscribe(prayerTimesDay => {
				this.prayerTimes = prayerTimesDay.times;
				this.timeZone = prayerTimesDay.timeZoneName;
				this.fajrIsAdjusted = prayerTimesDay.fajrIsAdjusted;
				this.fajrAdjustedLatitude = prayerTimesDay.fajrAdjustedLatitude;
				this.maghribIsAdjusted = prayerTimesDay.maghribIsAdjusted;
				this.maghribAdjustedLatitude = prayerTimesDay.sunriseAdjustedLatitude;
			});
	}
	setDate(value: string) {
		this.date = value;
		this.getPrayerTimes();
	}
	setLatitude(value: number) {
		this.latitude = value;
	}
	setLongitude(value: number) {
		this.longitude = value;
	}
	setFajrAngle(value: number) {
		this.fajrAngle = value;
		this.getPrayerTimes();
	}
	setIshaAngle(value: number) {
		this.ishaAngle = value;
		this.getPrayerTimes();
	}
	centreChanged($event: MouseEvent, theMapDirective: any) {
		// 	this.map._mapsWrapper.getMap().then(this.initialiseMap);
    }
	mapClicked($event: MouseEvent, theMapDirective: any) {
		this.latitude = $event.coords.lat;
		this.longitude = $event.coords.lng;
		this.placeQiblaOnMap();
		this.getPrayerTimes();
    }
}
