import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Department, NodeUrl } from '../Models';
import { AuthenticationService } from './auth.service';

@Injectable()
export class DepartmentService {

    url = NodeUrl + 'dept/';
    headers = new Headers({
        'Authorization': this.authService.token,
        'Salt': this.authService.salt
    });
    options = new RequestOptions({ headers: this.headers });

    constructor(private http: Http, private authService: AuthenticationService) { }

    getDept(id?: number) {
        let geturl = this.url;
        if (id != null) {
            geturl = this.url + id;
        }
        return this.http.get(geturl, this.options).map(res => res.json());
    }
    getCompDepts(compId: number) {
        return this.http.get(this.url + 'CompDept/' + compId, this.options).map(res => res.json());
    }
    getBranchDepts(brncId: number) {
        return this.http.get(this.url + 'BranchDept/' + brncId, this.options).map(res => res.json());
    }
}
