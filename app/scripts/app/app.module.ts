import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppRoutingModule } from './modules/routing';

import { AppComponent }  from './app.component';
import { ApppComponent }  from './appp.component';
import { NavbarComponent }  from './components/navbar';
import { PageNotFoundComponent }  from './components/404';

@NgModule({
  imports:      [
    BrowserModule,
    AppRoutingModule
  ],
  declarations: [
    NavbarComponent,
    PageNotFoundComponent,
    ApppComponent,
    AppComponent
  ],
  bootstrap:    [
    NavbarComponent
  ]
})
export class AppModule { }

/*
const appRoutes: Routes = [
  { path: '', component: DemoCtrl },
  { path: 'demo', component: DemoCtrl },
  { path: 'show/:dataset/:xDim/:yDim/:colorDim/:relativeMode', component: ShowCtrl },
  { path: 'dropbox/:dropbox_key/:dropbox_filename', component: DemoCtrl },
  { path: 'login', component: DemoCtrl },
  { path: 'account', component: DemoCtrl },
  { path: 'load/:csvKey/:comment?', component: DemoCtrl },
  { path: 'inspect/:csvKey/:comment?', component: DemoCtrl },
  { path: 'matrix/:csvKey', component: DemoCtrl },
  { path: 'inspect/:csvKey/:comment?', component: DemoCtrl },
  { path: 'upload', component: DemoCtrl },
  { path: 'browse', component: DemoCtrl },
  { path: '**',
    redirectTo: '/heroes',
    pathMatch: 'full' }
];*/
