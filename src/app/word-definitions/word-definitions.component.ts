import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute }       from '@angular/router';

interface WordDefinition{
	word:string,
	definition:DefinitionText
}
interface DefinitionSequentialContent{
  text:string,
  isADefinedWord:boolean
}
interface DefinitionText{
  contents:[DefinitionSequentialContent]
}


@Component({
  //moduleId: module.id,
  selector: 'app-word-definitions',
  templateUrl: './app/word-definitions/word-definitions.component.html',
  styleUrls: ['./app/word-definitions/word-definitions.component.css']
})
export class WordDefinitionsComponent implements OnInit, OnDestroy  {
  public word:string;
  public definition:DefinitionText;
  //private route:ActivatedRoute;
  constructor( 
  	private route:ActivatedRoute,
    private router:Router
  	) {}
 ;

  private getRouteParamsSubscribe:any;
  ngOnInit() {
  	 this.definitions=[
  	 { word:"Allah",
       definition:{
         contents:[{
           text:"God, the all caring the all giving, the lord of everyone, the master of the day of obligations",
           isADefinedWord:false
         }]
       }},
    { word:"Muslim",
       definition:{
         contents:[{
           text:"A human being who has freely chooses to follow the religion of",
           isADefinedWord:false
         },
         {
           text:"Islam",
           isADefinedWord:true
         }
         ,
         {
           text:"by declaring the",
           isADefinedWord:false
         },,
         {
           text:"Shahada",
           isADefinedWord:true
         }]
       }},
    { word:"Islam",
       definition:{
         contents:[{
           text:"The religion established based on the teachings found in the Qur'an given to the prophet Muhammad",
           isADefinedWord:false
         }]
       }},
       ,
    { word:"Shahada",
       definition:{
         contents:[{
           text:"A declaration made by an",
           isADefinedWord:false
         },
         {
           text:"adult",
           isADefinedWord:true
         },
         {
           text:"in front of at least 2 witnesses free from any coersion with the following words 'I see that there is no god except",
           isADefinedWord:false
         },
         {
           text:"Allah",
           isADefinedWord:true
         },
         {
           text:"and I see that Muhammad is the messenger of",
           isADefinedWord:false
         }
         ,
         {
           text:"Allah",
           isADefinedWord:true
         }
         ]
       }},
    { word:"Adult",
       definition:{
         contents:[{
           text:"A human being over the age of 18 years",
           isADefinedWord:false
         }]
       }},
     ]

  	 this.getRouteParamsSubscribe=this.route.params.subscribe(params=>{
  	 	this.word=params['word'];
  	 	this.wordChanged();
  	 });
  }
  wordChanged(){
  	if(!this.word || this.word==''){
  		this.definition={
        contents:[{
          text:"no word specified",
          isADefinedWord:false
        }]
      };
  	}else{
  		if(this.definitions.some((defn)=>{
  			return this.word && defn.word.toLowerCase()==this.word.toLowerCase()
  		})){
  			this.definition = this.definitions.filter((defn)=>{
  					return this.word && defn.word.toLowerCase()==this.word.toLowerCase()
  				})[0].definition;
          this.router.navigate(["/words/"+this.word]);
     	}else{
		  	this.definition=
        {
          contents:[{
            text: "'"+this.word+"' is not defined",
            isADefinedWord:false
          }]
        };
       ;
  		}
  	}
  }
  goToWord(text:string){
    this.word=text;
    this.wordChanged();
  }
  ngOnDestroy() {
  	this.getRouteParamsSubscribe.unsubscribe();
  }
  public definitions:[WordDefinition];

}
