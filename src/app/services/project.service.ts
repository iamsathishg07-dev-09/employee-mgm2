import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { promises } from 'node:dns';
import { Observable } from 'rxjs';
import { project } from '../models/project/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
private baseUrl = 'http://localhost:8080/EmployeeRestApi/api/secure/projects/';

  constructor(private http:HttpClient) { 

  }
  getAllProjects():Observable<any>
  {
     return this.http.get(this.baseUrl);
  }
  AssignProjects(empId:number,proId:number):Observable<any>
  {
    return this.http.put(`${this.baseUrl}assign/${empId}/${proId}`,{})
  }
  CreateProject(pro:project):Observable<any>
  {
    return this.http.post(`${this.baseUrl}`,pro)
  }
  getProjectById(id:number):Observable<any>
  {
    return this.http.get(`${this.baseUrl}${id}`);
  }
  updateProject(pro:project):Observable<any>
  {
    return this.http.put(`${this.baseUrl}`,pro);
  }
  deleteProject(id:number):Observable<any>
  {
    return this.http.delete(`${this.baseUrl}${id}`);
  }
}
