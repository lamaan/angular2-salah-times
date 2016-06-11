import {Component, AfterViewInit, ViewChild} from '@angular/core'
import {NgZone} from '@angular/core'
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
	locationFound: string;
	searchLocation: string;
	locationNotFound: boolean=false;
	constructor(private prayerTimesCalculatorService: PrayerTimesCalculatorService,
		private ngZone: NgZone) {
		this.date = moment().format("YYYY-MM-DD");
		this.latitude = 53.482863;
		this.longitude = -2.3459968;
		//this.utcOffset=moment().utcOffset()/60.0;
		this.fajrAngle = 6;
		this.ishaAngle = 6;
	}
	ngAfterViewInit() {
		var self = this;
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(p) {
				self.latitude = p.coords.latitude;
				self.longitude = p.coords.longitude;
				self.placeQiblaOnMap();
				self.getPrayerTimes();
			},function(e){
				self.placeQiblaOnMap();
				self.getPrayerTimes();
				console.log("could not get your current location:"+e.message)
			});
		}
	}
	searchForLocation(){
		var self = this;

		self.locationNotFound = false;
		if (self.searchLocation != null && self.searchLocation != '') {
			self.theMapDirective._mapsWrapper.getMap().then(function(map) {
				var geocoder = new google.maps.Geocoder;
				var infowindow = new google.maps.InfoWindow;
				var latlng = { lat: self.latitude, lng: self.longitude };
				geocoder.geocode({ 'address': self.searchLocation }, function(results, status) {
					if (status === google.maps.GeocoderStatus.OK) {
						if (results[0]) {
							self.locationFound = results[0].formatted_address;
							self.latitude = results[0].geometry.location.lat();
							self.longitude = results[0].geometry.location.lng();
							self.placeQiblaOnMap();
							self.getPrayerTimes();
							self.searchLocation = '';
						}else{
							self.locationNotFound = true;
						}
						self.ngZone.run(function() { });
					}
				});
			});
		}
	}
	getLocationFound(){
		var self = this;
		self.theMapDirective._mapsWrapper.getMap().then(function(map) {
			var geocoder = new google.maps.Geocoder;
			var infowindow = new google.maps.InfoWindow;
			var latlng = { lat: self.latitude, lng: self.longitude };
			geocoder.geocode({ 'location': latlng }, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					if(results[0]){
						self.locationFound = results[0].formatted_address;
						self.ngZone.run(function(){});
					} 
				}
			});
		});
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
			self.getLocationFound();

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
	setSearchLocation(value:string){
		this.searchLocation = value;
	}
	centreChanged($event: MouseEvent, theMapDirective: any) {
		// 	this.map._mapsWrapper.getMap().then(this.initialiseMap);
    }
	mapClicked($event: MouseEvent, theMapDirective: any) {
		this.locationNotFound = false;
		this.latitude = $event.coords.lat;
		this.longitude = $event.coords.lng;
		this.placeQiblaOnMap();
		this.getPrayerTimes();
    }
}
