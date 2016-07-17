import { RouterConfig }          from '@angular/router';
import { WordDefinitionsComponent }   from './word-definitions.component';

export const wordDefinitionsRoutes: RouterConfig = [
  { path: 'words', component: WordDefinitionsComponent },
  { path: 'words/:word', component: WordDefinitionsComponent },
];