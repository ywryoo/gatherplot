/**
 * Created by Yangwook Ryoo on 2017.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { NgModule }      from '@angular/core';
import { FormsModule }      from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppRoutingModule } from './app.routing.module';
import { AccordionModule, ButtonsModule, AlertModule } from 'ng2-bootstrap';

import { AppComponent }  from './app.component';
import { GatherplotComponent }  from './demo/gatherplot/gatherplot.component';
import { PageNotFoundComponent }  from './error/404';

@NgModule({
  imports:      [
    BrowserModule,
    FormsModule,
    AccordionModule.forRoot(),
    ButtonsModule.forRoot(),
    AlertModule.forRoot(),
    AppRoutingModule
  ],
  declarations: [
    PageNotFoundComponent,
    GatherplotComponent,
    AppComponent
  ],
  bootstrap:    [
    AppComponent
  ]
})

export class AppModule { }
