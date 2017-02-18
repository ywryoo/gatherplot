/**
 * Created by Yangwook Ryoo on 2017.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { NgModule }              from '@angular/core';
import { FormsModule }      from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AccordionModule } from 'ng2-bootstrap/accordion';
import { ButtonsModule } from 'ng2-bootstrap/buttons';
import { AlertModule } from 'ng2-bootstrap/alert';

import { GatherplotComponent } from './demo/gatherplot/gatherplot.component';
import { GatherplotDirective } from './demo/gatherplot/gatherplot.directive';
import { SecondDirective } from './demo/gatherplot/second.directive';
import { PageNotFoundComponent }  from './error/404';


const appRoutes: Routes = [
    { path: '', component: GatherplotComponent },
    //  { path: 'demo', component: DemoCtrl },
    //  { path: 'show/:dataset/:xDim/:yDim/:colorDim/:relativeMode', component: ShowCtrl },
    //  { path: 'dropbox/:dropbox_key/:dropbox_filename', component: DemoCtrl },
    //  { path: 'login', component: DemoCtrl },
    //  { path: 'account', component: DemoCtrl },
    //  { path: 'load/:csvKey/:comment?', component: DemoCtrl },
    //  { path: 'inspect/:csvKey/:comment?', component: DemoCtrl },
    //  { path: 'matrix/:csvKey', component: DemoCtrl },
    //  { path: 'inspect/:csvKey/:comment?', component: DemoCtrl },
    //  { path: 'upload', component: DemoCtrl },
    //  { path: 'browse', component: DemoCtrl },
    { path: '**', component: PageNotFoundComponent }
];

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        AccordionModule.forRoot(),
        ButtonsModule.forRoot(),
        AlertModule.forRoot(),
        RouterModule.forRoot(appRoutes, { useHash: true })
    ],
    declarations: [
        PageNotFoundComponent,
        GatherplotComponent,
        SecondDirective,
        GatherplotDirective
    ],
    exports: [
        RouterModule
    ]
})

export class AppRoutingModule { }
