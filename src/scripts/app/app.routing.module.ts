/**
 * Created by Yangwook Ryoo on 2017.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';

import { GatherplotComponent }  from './demo/gatherplot/gatherplot.component';
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
    RouterModule.forRoot(appRoutes, { useHash: true })
  ],
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule {}
