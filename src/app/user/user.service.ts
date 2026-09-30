import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from './user.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl_register="http://localhost:8080/EmployeeRestApi/api/users/register";
  private apiUrl_login="http://localhost:8080/EmployeeRestApi/api/users/login";

  private readonly USER_KEY='LoggedInUserName';
  private readonly TOKEN_KEY='jwtToken';
  private readonly USER_ROLE='role';

  constructor(private httpClient:HttpClient) { }

  createUserService(newUser:User):Observable<any>
  {
      return this.httpClient.post<User>(this.apiUrl_register,newUser)
  }
  loginUserService(newUser:User): Observable<any> {

    return this.httpClient.post<User>(this.apiUrl_login,newUser,{observe:'response'}).pipe(
      tap(response=>{
        const token=response.headers.get('Authorization');
        const role=response.body?.role;
        if(token && role)
        {
          localStorage.setItem(this.TOKEN_KEY,token)
          localStorage.setItem(this.USER_KEY,newUser.username)
          localStorage.setItem(this.USER_ROLE,role)
        }
      })
    );
  }
  getUsername():string |null   
  {
    return localStorage.getItem(this.USER_KEY);
  }
  setUsername(name:string):void 
  {
    localStorage.setItem(this.USER_KEY,name);
   }
 getToken():string | null{
  return localStorage.getItem(this.TOKEN_KEY);
 }
}
