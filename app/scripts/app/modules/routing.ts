import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';

import { AppComponent }  from '../app.component';
import { ApppComponent }  from '../appp.component';
import { NavbarComponent }  from '../components/navbar';
import { PageNotFoundComponent }  from '../components/404';

const appRoutes: Routes = [
  { path: '', component: AppComponent },
  { path: 'browse', component: ApppComponent },
  { path: 'load', component: PageNotFoundComponent },
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
