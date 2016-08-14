import { Component, OnInit, Input } from '@angular/core';
import {QuranService} from '../quran.service'
@Component({
  selector: '.quran-ref',
  templateUrl: 'quran-reference.component.html',
  styleUrls: ['quran-reference.component.css'],
  providers:[QuranService]
})
export class QuranReferenceComponent implements OnInit {

  constructor(private quranService:QuranService) { }
  arabicQuranSurahs:any[];
	@Input('surah') surah:number;
	@Input('verse') verse:number;
	@Input('firstWord') firstWord:number;
	@Input('wordCount') wordCount:number;
  	ngOnInit() {
  	
  }
 
  arabicText(){
  	var quranSurahs=this.quranService.getSurahs()
  	if(this.surah && this.verse){
  	var verse=quranSurahs[this.surah-1][this.verse-1];
  		var words=[];
  		if(this.firstWord!=null && this.wordCount!=null){
  			var startIndex=Number(this.firstWord)-1;
  			var endIndex=Number(this.wordCount)+Number(this.firstWord)-1;
  			words=verse.slice(startIndex,endIndex);
  			console.log("words="+words.join(" "));
  		
  			console.log("word",this.firstWord);
  			console.log("word count",this.wordCount);
  			console.log("start",startIndex);
  			console.log("end",endIndex);
  		}
  		else{
  			words=verse;
  		}
  		return words.join(" ");
  	}
  	return "...";
  }

  url(){
  	return 'http://www.recitequran.com/'+this.surah+':'+this.verse;
  }
}
