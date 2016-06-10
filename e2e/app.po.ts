export class Angular2SalahTimesPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('angular2-salah-times-app h1')).getText();
  }
}
