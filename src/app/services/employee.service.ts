import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee/employee.model';
 
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
private baseUrl = 'http://localhost:8080/EmployeeRestApi/api/secure/employees/';
 
  constructor(private http: HttpClient) {}
 
  saveEmployee(employee: any): Observable<any> {
return this.http.post(this.baseUrl, employee);
  }
  
  getAllEmployees(): Observable<any[]> {
    return this.http.get<Employee[]>(this.baseUrl);
  }

  getEmployeeById(id: number): Observable<any> {
    return this.http.get<Employee>(`${this.baseUrl}${id}`);
  }

  updateEmployee(employee:any):Observable<any>{
     return this.http.put<Employee>(`${this.baseUrl}`,employee);
  }

  deleteEmployee(id:number):Observable<any>
  {
    return this.http.delete<Employee>(`${this.baseUrl}${id}`);
  }

    checkEmailExistence(email: string): Observable<any> {
    return this.http.get(`${this.baseUrl}check-email/${email}`);
  }
}