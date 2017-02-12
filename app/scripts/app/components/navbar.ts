import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
  <div class="navbar navbar-default navbar-fixed-top">
      <div class="container-fluid">
          <div class="navbar-header">
              <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                  <span class="sr-only">Toggle navigation</span>
                  <span class="icon-bar"></span>
                  <span class="icon-bar"></span>
                  <span class="icon-bar"></span>
              </button>
              <a class="navbar-brand" routerLink="/" routerLinkActive="active">Gatherplot</a>
          </div>
          <div id="navbar" class="navbar-collapse collapse">
              <ul class="nav navbar-nav">
                  <li><a routerLink="/load" routerLinkActive="active">Load new data</a></li>
                  <li><a routerLink="/browse" routerLinkActive="active">Browse data</a></li>
              </ul>
          </div>
      </div>
  </div>
  <router-outlet></router-outlet>
`
})

export class NavbarComponent {}
