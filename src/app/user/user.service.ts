import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from './user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl_register="http://localhost:8080/EmployeeRestApi/api/users/register";
  private apiUrl_login="http://localhost:8080/EmployeeRestApi/api/users/login";

  constructor(private httpClient:HttpClient) { }

  createUserService(newUser:User):Observable<any>
  {
      return this.httpClient.post<User>(this.apiUrl_register,newUser)
  }
  loginUserService(newUser:User): Observable<User> {

    return this.httpClient.post<User>(this.apiUrl_login,newUser);
  }
 
}
