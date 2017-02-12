/**
 * Created by Yangwook Ryoo on 2017.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';

import { AppComponent }  from './app.component';
import { ApppComponent }  from './appp.component';
import { AppppComponent }  from './apppp.component';
import { ApppppComponent }  from './appppp.component';
import { PageNotFoundComponent }  from './error/404';

const appRoutes: Routes = [
  { path: '', component: ApppComponent },
  { path: 'browse', component: AppppComponent },
  { path: 'load', component: ApppppComponent },
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
