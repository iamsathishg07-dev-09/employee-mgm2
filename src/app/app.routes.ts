import { Routes } from '@angular/router';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectFormComponent } from './project-form/project-form.component';
import { EmployeeHomeComponent } from './employee-home/employee-home.component';
import { ReportComponent } from './report/report.component';

export const appRoutes: Routes = [
  {path:'',redirectTo:"/employee-list",pathMatch:'full'},
  {path:'register',component:UserComponent},
  {path:'login',component:LoginComponent},
  { path: 'employee-list', component: EmployeeListComponent },
  { path: 'employee-form', component: EmployeeFormComponent }, 
  { path: 'employee-form/:id/:mode', component: EmployeeFormComponent },
  {path:'project-list',component:ProjectListComponent},
  {path:'project-form',component:ProjectFormComponent},
  {path:'project-form/:id/:mode',component:ProjectFormComponent},
  {path:'employee-home',component:EmployeeHomeComponent},
  {path:'reports',component:ReportComponent}
];
