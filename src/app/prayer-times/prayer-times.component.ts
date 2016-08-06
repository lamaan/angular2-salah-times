import {Component, AfterViewInit, ViewChild, ViewContainerRef} from '@angular/core'
import {NgZone} from '@angular/core'
import {PrayerTimesCalculatorService, prayerTime, prayerTimesForDay, timeZoneInfo} from '../prayer-times-calculator.service';

import {AlertComponent, DATEPICKER_DIRECTIVES, MODAL_DIRECTVES} from 'ng2-bootstrap/ng2-bootstrap';
import {BS_VIEW_PROVIDERS} from 'ng2-bootstrap/ng2-bootstrap';
import 'moment';
declare var $: any;
declare var google: any;
declare var moment: any;
@Component({
//  moduleId: module.id,
	templateUrl: './prayer-times.component.html',
  styleUrls: ['./prayer-times.component.css'],
  selector: 'prayer-times',
  directives: [DATEPICKER_DIRECTIVES, MODAL_DIRECTVES],
  providers: [PrayerTimesCalculatorService],
  viewProviders:[BS_VIEW_PROVIDERS],
}) export class PrayerTimesComponent implements AfterViewInit {
	date: Date;
	latitude: number;
	longitude: number;
	initialiseMap: any;
	qiblaLine: any;
	fajrAngle: number;
	ishaAngle: number;
	timeZone: string;
	startOfLunarMonth: boolean;
	fajrIsAdjusted: boolean;
	fajrIsAdjustedEarlier: boolean;
	maghribIsAdjustedLater: boolean;
	maghribIsAdjusted: boolean;
	locationFound: string;
	searchLocation: string;
	locationNotFound: boolean=false;
	showNewMonthLegend: boolean;
	map:any;
	constructor(private prayerTimesCalculatorService: PrayerTimesCalculatorService,
		private viewContainerRef: ViewContainerRef,
		private ngZone: NgZone) {
		this.date = moment().format("YYYY-MM-DD");
		this.latitude = 53.482863;
		this.longitude = -2.3459968;
		//this.utcOffset=moment().utcOffset()/60.0;
		this.fajrAngle = 6;
		this.ishaAngle = 6;

	}
	ngAfterViewInit() {
		var self=this;
		var mapProp = {
            center: new google.maps.LatLng(this.latitude, this.longitude),
            zoom: 5,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        // console.log("initialising map...");
        this.map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
		this.map.addListener('click', function(e){
			// console.log("clicked "+ JSON.stringify(e) );
			self.mapClicked(e);
		});
		this.resetLocation();
	}
	getFullDate() {
		return moment(this.date).format("dddd Do MMMM");
	}
	removeCalendar(){
		this.numberOfDaysInCalendar = null;
		this.buildCalendar();
	}
	resetLocation(){
		//console.log("resetting location on map"+this.map);
		var self = this;
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(p) {
				self.latitude = p.coords.latitude;
				self.longitude = p.coords.longitude;
				self.placeQiblaOnMap();
				self.getPrayerTimes();
				self.buildCalendar();
			},function(e){
				self.placeQiblaOnMap();
				self.getPrayerTimes();
				self.buildCalendar();

				console.log("could not get your current location:"+e.message)
			});
		}
		this.map.setZoom(10);
	}
	searchForLocation(){
		var self = this;
		//console.log("searching location on map"+this.map);

		self.locationNotFound = false;
		if (self.searchLocation != null && self.searchLocation != '') {
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
						this.map.setZoom(10);
					}
				}
				if (status === google.maps.GeocoderStatus.ZERO_RESULTS){
					self.locationNotFound = true;
				}
				self.ngZone.run(function() { });
			});
		};
	}
	getLocationFound(){
		var self = this;
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
	}
	placeQiblaOnMap() {
		var self = this;
		// console.log("placing qibla on map"+this.map);

		var qiblaLineCoords = [
			{ lat: this.latitude, lng: this.longitude },
			{ lat: 21.422441833015604, lng: 39.82616901397705 }
		];
		if (this.qiblaLine != null) {
			this.qiblaLine.setMap(null);
		}
		self.qiblaLine = new google.maps.Polyline({
			path: qiblaLineCoords,
			geodesic: true,
			strokeColor: '#FF0000',
			strokeOpacity: 1.0,
			strokeWeight: 2
		});
		self.qiblaLine.setMap(this.map);
		this.map.setCenter({ lat: this.latitude, lng: this.longitude });

		self.getLocationFound();
	}
	prayerTimes: prayerTime[]=[]
	calendar: prayerTimesForDay[] = [];
	numberOfDaysInCalendar:number
	buildingCalendar: boolean = false;
	buildCalendar(){
		this.getPrayerTimeTableForNextNDays(this.numberOfDaysInCalendar);
	}

	getPrayerTimeTableForNextNDays(days:number){
		var self = this;
		self.showNewMonthLegend = false;
		self.calendar = [];
		if(days==null){
			return;
		}
		return self.prayerTimesCalculatorService.getDefaultTimeZone(self.date, self.latitude, self.longitude)
			.subscribe(timeZone => {
				self.calendar = [];
				var dateMoment = moment(self.date).startOf('d');
				for (var i = 0; i < days; i++) {
					var date = moment(dateMoment).add(i, 'd');
					self.calendar.push(self.getPrayerTimesForDate(date, timeZone));
				}
				var firstDay = self.calendar[0];
				self.showNewMonthLegend = self.calendar.some(function(day){
					return day.startOfLunarMonth;
				})
			});
	}
	getPrayerTimes() {
		var self = this;
		return self.prayerTimesCalculatorService.getDefaultTimeZone(self.date, self.latitude, self.longitude)
			.subscribe(timeZone => {
				var prayerTimesDay = self.getPrayerTimesForDate(self.date, timeZone);
				self.prayerTimes = prayerTimesDay.times;
				self.startOfLunarMonth = prayerTimesDay.startOfLunarMonth;
				self.timeZone = prayerTimesDay.timeZoneName;
				self.fajrIsAdjusted = prayerTimesDay.fajrIsAdjusted;
				self.maghribIsAdjusted = prayerTimesDay.maghribIsAdjusted;
				self.fajrIsAdjustedEarlier = prayerTimesDay.fajrIsAdjustedEarlier;
				self.maghribIsAdjustedLater = prayerTimesDay.maghribIsAdjustedLater;
			});
	}
	getPrayerTimesForDate(date:Date,timeZone:timeZoneInfo) {
		var self = this;
		return self.prayerTimesCalculatorService.getPrayerTimes(date,
			self.latitude, self.longitude, timeZone);
	}
	dateChanged(){
		this.getPrayerTimes();
		this.getPrayerTimeTableForNextNDays(this.numberOfDaysInCalendar);
	}
	mapClicked($event: any) {
		// console.log($event);
		this.locationNotFound = false;
		this.latitude = $event.latLng.lat();
		this.longitude = $event.latLng.lng();
		this.placeQiblaOnMap();
		this.getPrayerTimes();
		this.getPrayerTimeTableForNextNDays(this.numberOfDaysInCalendar);
    }
}
