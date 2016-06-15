/***********************************************************************************************
 * User Configuration.
 **********************************************************************************************/
/** Map relative paths to URLs. */
const map: any = {
  'angular2-google-maps':'vendor/angular2-google-maps',
};

/** User packages configuration. */
const packages: any = {
 // 'moment':{ defaultExtension: 'js' },
  'angular2-google-maps': { defaultExtension: 'js' },

};
// cache busting snippet from https://github.com/systemjs/systemjs/issues/172
declare var Promise: any;

var systemLocate = System.locate;
System.locate = function(load) {
    var System = this;
    return Promise.resolve(systemLocate.call(this, load)).then(function(address) {
        return address + System.cacheBust;
    });
};
System.cacheBust = '?v=' + 1.14;

////////////////////////////////////////////////////////////////////////////////////////////////
/***********************************************************************************************
 * Everything underneath this line is managed by the CLI.
 **********************************************************************************************/
const barrels: string[] = [
  // Angular specific barrels.
  '@angular/core',
  '@angular/common',
  '@angular/compiler',
  '@angular/http',
  '@angular/router',
  '@angular/platform-browser',
  '@angular/platform-browser-dynamic',

  // Thirdparty barrels.
  'rxjs',

  // App specific barrels.
  'app',
  'app/shared',
  'app/prayer-times',
  /** @cli-barrel */
];

const cliSystemConfigPackages: any = {};
barrels.forEach((barrelName: string) => {
  cliSystemConfigPackages[barrelName] = { main: 'index' };
});

/** Type declaration for ambient System. */
declare var System: any;


// Apply the CLI SystemJS configuration.
System.config({
  map: {
    '@angular': 'vendor/@angular',
    'rxjs': 'vendor/rxjs',
    'main': 'main.js'
  },
  packages: cliSystemConfigPackages
});

// Apply the user's configuration.
System.config({ map, packages });
