import { Component, OnInit } from '@angular/core';
import {TermComponent} from '../term/term.component'

@Component({
  selector: 'app-standards',
  templateUrl: 'standards.component.html',
  styleUrls: ['standards.component.css'],
  directives:[TermComponent]
})
export class StandardsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
