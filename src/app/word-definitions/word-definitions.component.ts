import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute }       from '@angular/router';

interface WordDefinition{
	word:string,
	definition:string
}


@Component({
  //moduleId: module.id,
  selector: 'app-word-definitions',
  templateUrl: './app/word-definitions/word-definitions.component.html',
  styleUrls: ['./app/word-definitions/word-definitions.component.css']
})
export class WordDefinitionsComponent implements OnInit, OnDestroy  {
  public word:string;
  public definition:string;
  private route:ActivatedRoute;
  constructor( 
  	//private route:ActivatedRoute
  	) {}
 ;

  private getRouteParamsSubscribe:any;
  ngOnInit() {
  	 this.definitions=[
  	 {
  	 	word:"Allah", definition:"God"
  	 }]

  	 this.getRouteParamsSubscribe=this.route.params.subscribe(params=>{
  	 	this.word=params['word'];
  	 	this.wordChanged();
  	 });
  }
  wordChanged(){
  	if(!this.word || this.word==''){
  		this.definition="no word specified";
  	}else{
  		if(this.definitions.some((defn)=>{
  			return this.word && defn.word.toLowerCase()==this.word.toLowerCase()
  		})){
  			this.definition = this.definitions.filter((defn)=>{
  					return this.word && defn.word.toLowerCase()==this.word.toLowerCase()
  				})[0].definition;


  		}else{
		  	this.definition="'"+this.word+"' is not defined";
  		}
  	}
  }
  ngOnDestroy() {
  	this.getRouteParamsSubscribe.unsubscribe();
  }
  public definitions:[WordDefinition];

}
