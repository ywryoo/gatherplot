/**
 * Created by Yangwook Ryoo on 2017.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppRoutingModule } from './app.routing.module';

import { AppComponent }  from './app.component';
import { ApppComponent }  from './appp.component';
import { AppppComponent }  from './apppp.component';
import { ApppppComponent }  from './appppp.component';
import { PageNotFoundComponent }  from './error/404';

@NgModule({
  imports:      [
    BrowserModule,
    AppRoutingModule
  ],
  declarations: [
    PageNotFoundComponent,
    ApppppComponent,
    AppppComponent,
    ApppComponent,
    AppComponent
  ],
  bootstrap:    [
    AppComponent
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
