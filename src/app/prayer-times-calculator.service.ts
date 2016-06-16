import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';
//import { Observable }     from 'rxjs/Observable';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';

declare var SunCalc: any;
declare var moment: any;

export interface timeZoneInfo {
	rawOffset: number,
	dstOffset: number,
	timeZoneName: string
}
export interface prayerTime
{ name: string, time: string }

export interface prayerTimesForDay {
	startOfLunarMonth:boolean,
	//moonPhaseAtIsha:number,
	//lunarCalandarDayAtIsha: number,
	date:string,
	formatedDate:string,
	timeZoneName: string,
	maghribIsAdjusted: boolean,
	fajrIsAdjusted: boolean,
	fajrAdjustedLatitude: number,
	sunriseAdjustedLatitude: number,
	times: [prayerTime]
}


@Injectable()
export class PrayerTimesCalculatorService {

	constructor(private http: Http) {

	}
	getTimeZone(date: string, latitude: number, longitude: number): Observable<timeZoneInfo> {
		var dateMoment = moment(date, "YYYY-MM-DD").startOf('d').add(12, 'h');
		var timeStamp = dateMoment.unix();
		var url = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + latitude + "," + longitude
			+ "&timestamp=" + timeStamp;
		return this.http.get(url).map(this.extractData).catch(this.handleError);

	}
	private extractData(res: Response) {
		return res.json();
	}
	private handleError(error: any) {
		// In a real world app, we might use a remote logging infrastructure
		// We'd also dig deeper into the error to get a better message
		let errMsg = (error.message) ? error.message :
			error.status ? `${error.status} - ${error.statusText}` : 'Server error';
		console.error(errMsg); // log to console instead
		return Observable.throw(errMsg);
	}
	fullDaylightLengthInHours(times: any): number {
		if (moment(times.sunrise).isValid()) {
			var daylengthInSeconds = moment(times.sunset).diff(moment(times.sunrise), 's');
			return daylengthInSeconds / 3600.0;
		}
		return 0;
	}

	dayLengthInHours(times: any): number {
		if (moment(times.fajr).isValid()) {
			var daylengthInSeconds = moment(times.isha).diff(moment(times.fajr), 's');
			return daylengthInSeconds / 3600.0;
		}
		return 0;
	}
	hasNormalDayLength(times: any): boolean {
		return (this.dayLengthInHours(times) > 4
			&& this.dayLengthInHours(times) < 20);
	}
	hasNormalFullDaylightLength(times: any): boolean {
		return (this.fullDaylightLengthInHours(times) > 6
			&& this.fullDaylightLengthInHours(times) < 18);
	}
	getAdjustedTimes(latitude: number, longitude: number, date: Date, utcOffset: number): any {
		var unadjustedLatitude = latitude;
		var increment = 0.01;
		if (latitude > 0) {
			increment = -0.01;
		}
		var originaltimes = SunCalc.getTimes(date, latitude, longitude);
		var times = SunCalc.getTimes(date, latitude, longitude);
		while (Math.abs(latitude) > 10 && (
			!moment(times.sunrise).isValid()
			|| !this.hasNormalFullDaylightLength(times)
		)) {
			latitude = latitude + increment;
			times = SunCalc.getTimes(date, latitude, longitude);
		}
		var validSunriseTimes = times;
		var sunriseAdjustedLatitude = latitude;
		while (Math.abs(latitude) > 10 && (
			!moment(times.fajr).isValid()
			|| !this.hasNormalDayLength(times)
		)) {
			latitude = latitude + increment;
			times = SunCalc.getTimes(date, latitude, longitude);
		}
		var validFajrTimes = times;
		var fajrAdjustedLatitude = latitude;

		var noon = moment(originaltimes.solarNoon);
		var sunset = moment(validSunriseTimes.sunset);
		var minutesDifference = sunset.diff(noon, "minutes");
		var midAfternoon = moment(noon).add(minutesDifference * 2.0 / 3.0, "minutes");
		var timeFormat = "HH:mm:ss";
		var moonAtIsha = SunCalc.getMoonIllumination(validFajrTimes.isha);
		var ishaYesterday = moment(validFajrTimes.isha).subtract(1, 'd').toDate();;
		var moonAtPreviousIsha = SunCalc.getMoonIllumination(ishaYesterday);
		var response =
			{
				startOfLunarMonth: (moonAtPreviousIsha.phase > moonAtIsha.phase),
				maghribIsAdjusted: validSunriseTimes.sunset.valueOf() != originaltimes.sunset.valueOf(),
				fajrIsAdjusted: validFajrTimes.fajr.valueOf() != originaltimes.fajr.valueOf(),
				unadjustedLatitude: unadjustedLatitude,
				fajrAdjustedLatitude: fajrAdjustedLatitude,
				sunriseAdjustedLatitude: sunriseAdjustedLatitude,
				fajr: moment(validFajrTimes.fajr).utcOffset(utcOffset).format(timeFormat),
				sunrise: moment(validSunriseTimes.sunrise).utcOffset(utcOffset).format(timeFormat),
				zuhr: noon.utcOffset(utcOffset).format(timeFormat),
				asr: midAfternoon.utcOffset(utcOffset).format(timeFormat),
				maghrib: sunset.utcOffset(utcOffset).format(timeFormat),
				isha: moment(validFajrTimes.isha).utcOffset(utcOffset).format(timeFormat)
			};

		return response;
	}
		
	getDefaultTimeZone(date: string, latitude: number, longitude: number){
		return this.getTimeZone(date, latitude, longitude);
	}
	getPrayerTimes(date: string, latitude: number, longitude: number,
		timeZone:timeZoneInfo): prayerTimesForDay {

		var self = this;
	
				var dateMoment = moment().startOf('d').add(12, 'h');
				if (date != "" && moment(date, "YYYY-MM-DD").isValid()) {
					dateMoment = moment(date, "YYYY-MM-DD").add(12, 'h');
				}
				var utcOffset = (timeZone.dstOffset + timeZone.rawOffset) / 3600.0;

				SunCalc.addTime(-18, 'fajr', 'isha');
				var times = self.getAdjustedTimes(latitude, longitude, dateMoment.toDate(), utcOffset);
				return {
					startOfLunarMonth: times.startOfLunarMonth,
					date: date,
					formatedDate:moment(dateMoment).format("ddd Do MMM"),
					timeZoneName: timeZone.timeZoneName,
					maghribIsAdjusted: times.maghribIsAdjusted,
					fajrIsAdjusted: times.fajrIsAdjusted,
					fajrAdjustedLatitude: times.fajrAdjustedLatitude,
					sunriseAdjustedLatitude: times.sunriseAdjustedLatitude,
					times:times
				};

	}
}