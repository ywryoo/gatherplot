import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DataService {
    private dataSource = new BehaviorSubject<any>({});
    public data$ = this.dataSource.asObservable();

    public setData(data: any): void {
        this.dataSource.next(data);
    }
}
