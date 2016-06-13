import {Component, AfterViewInit, ViewChild} from '@angular/core'
import {NgZone} from '@angular/core'
import {PrayerTimesCalculatorService, prayerTime, prayerTimesForDay, timeZoneInfo} from '../prayer-times-calculator.service';
import {
	MapsAPILoader, 
	NoOpMapsAPILoader, 
	LazyMapsAPILoader,
	GoogleMapsAPIWrapper,
	MouseEvent, 
	ANGULAR2_GOOGLE_MAPS_PROVIDERS,  
	ANGULAR2_GOOGLE_MAPS_DIRECTIVES} from 'angular2-google-maps/core';
declare var $: any;
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
	startOfLunarMonth: boolean;
	fajrIsAdjusted: boolean;
	fajrAdjustedLatitude: number;
	maghribIsAdjusted: boolean;
	maghribAdjustedLatitude: number;
	locationFound: string;
	searchLocation: string;
	locationNotFound: boolean=false;
	showNewMonthLegend: boolean;
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
		$('#datetimepicker1').datetimepicker({
			format: "YYYY-MM-DD",

		}).on("dp.change",function(e) {
			self.setDate(e.date.format("YYYY-MM-DD"));
		});
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
	getFullDate() {
		return moment(this.date).format("dddd Do MMMM");
	}
	removeCalendar(){
		this.numberOfDaysInCalendar = null;
		this.buildCalendar();
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
							self.buildCalendar();
							self.searchLocation = '';
						}
					}
					if (status === google.maps.GeocoderStatus.ZERO_RESULTS){
						self.locationNotFound = true;
					}
					self.ngZone.run(function() { });
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
	prayerTimes: prayerTime[]=[]
	calendar: prayerTimesForDay[] = [];
	numberOfDaysInCalendar:number
	buildingCalendar: boolean = false;
	buildCalendar(){
		this.getPrayerTimeTableForNextNDays(this.numberOfDaysInCalendar);
	}

	calendarHeadings: string[] = []

	getPrayerTimeTableForNextNDays(days:number){
		var self = this;
		self.showNewMonthLegend = false;
		self.calendar = [];
		if(days==null){
			return;
		}
		return self.prayerTimesCalculatorService.getDefaultTimeZone(this.date, self.latitude, self.longitude)
			.subscribe(timeZone => {
				self.calendar = [];
				var dateMoment = moment(self.date, "YYYY-MM-DD").startOf('d');
				for (var i = 0; i < days; i++) {
					var date = moment(dateMoment).add(i, 'd').format("YYYY-MM-DD");
					self.calendar.push(self.getPrayerTimesForDate(date, timeZone));
				}
				var firstDay = self.calendar[0];
				self.calendarHeadings = firstDay.times.map(function(time) {
					return time.name;
				});
				self.showNewMonthLegend = self.calendar.some(function(day){
					return day.startOfLunarMonth;
				})
			});
	}
	getPrayerTimes() {
		var self = this;
		return self.prayerTimesCalculatorService.getDefaultTimeZone(this.date, self.latitude, self.longitude)
			.subscribe(timeZone => {
				var prayerTimesDay = self.getPrayerTimesForDate(self.date, timeZone);
				self.prayerTimes = prayerTimesDay.times;
				self.startOfLunarMonth = prayerTimesDay.startOfLunarMonth;
				self.timeZone = prayerTimesDay.timeZoneName;
				self.fajrIsAdjusted = prayerTimesDay.fajrIsAdjusted;
				self.fajrAdjustedLatitude = prayerTimesDay.fajrAdjustedLatitude;
				self.maghribIsAdjusted = prayerTimesDay.maghribIsAdjusted;
				self.maghribAdjustedLatitude = prayerTimesDay.sunriseAdjustedLatitude;
			});
	}
	getPrayerTimesForDate(date:string,timeZone:timeZoneInfo) {
		var self = this;
		return self.prayerTimesCalculatorService.getPrayerTimes(date,
			self.latitude, self.longitude, timeZone);
	}
	setDate(value: string) {
		this.date = value;
		this.getPrayerTimes();
		this.getPrayerTimeTableForNextNDays(this.numberOfDaysInCalendar);
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
		this.getPrayerTimeTableForNextNDays(this.numberOfDaysInCalendar);
    }
}
