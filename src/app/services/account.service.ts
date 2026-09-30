import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  
private baseUrl = 'http://localhost:8080/EmployeeRestApi/api/secure/accounts/';

  constructor(private http: HttpClient) { }

saveAccount(Account: any): Observable<any> {
 return this.http.post(this.baseUrl, Account);
   }

   deleteByMobileNumber(mobileNumber: any): Observable<any> {
    const deleteUrl = `${this.baseUrl}mobile/${mobileNumber}`;
    return this.http.delete(deleteUrl);
  }
  getAccountByMobileNumber(mobileNumber: any):Observable<any> {
    const getActUrl=`${this.baseUrl}mobile/${mobileNumber}`;
    return this.http.get(getActUrl);
  }

}
