import { Routes } from '@angular/router';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';

export const appRoutes: Routes = [
  {path: '', component:LoginComponent},
  {path:'register',component:UserComponent},
  {path:'login',component:LoginComponent},
  { path: 'employee-list', component: EmployeeListComponent },
  { path: 'employee-form', component: EmployeeFormComponent }, 
  { path: 'employee-form/:id/:mode', component: EmployeeFormComponent },
];
