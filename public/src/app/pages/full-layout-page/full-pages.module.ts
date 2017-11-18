import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2SmartTableModule } from 'ng2-smart-table'

import { FullPagesRoutingModule } from './full-pages-routing.module';

import { FullLayoutPageComponent } from './full-layout-page.component';

import { UsersComponent } from '../users/users.component';
import { UserService } from '../../services'
import { AuthenticationService } from '../../services'
import { CompanyComponent } from '../company/company.component';
import { FormsModule ,ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'app/material.module';

const Services = [AuthenticationService, UserService]

@NgModule({
    imports: [
        CommonModule,
        FullPagesRoutingModule,
        Ng2SmartTableModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule
    ],
    declarations: [
        FullLayoutPageComponent,
        UsersComponent,
        CompanyComponent
    ],
    providers: [
        ...Services
    ]
})
export class FullPagesModule { }
