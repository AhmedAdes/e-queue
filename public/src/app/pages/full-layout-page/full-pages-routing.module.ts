import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../services/auth.guard';

import { FullLayoutPageComponent } from 'app/pages/full-layout-page/full-layout-page.component';
import { UsersComponent } from '../users/users.component';
import { CompanyComponent } from '../company/company.component';


const routes: Routes = [
  {
    path: '', component: FullLayoutPageComponent, data: { title: 'Full Layout Page' }, canActivate: [AuthGuard]
  },
  {
    path: 'users', component: UsersComponent, data: { title: 'Users' }, canActivate: [AuthGuard]
  },
  {
    path: 'dashboard', component: UsersComponent, canActivate: [AuthGuard]
  },
  {
    path: 'company',
    component: CompanyComponent,
    data: {
      title: 'Company'
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FullPagesRoutingModule { }
