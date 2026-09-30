import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-project-assign-model',
  imports: [CommonModule,FormsModule,RouterLink],
  standalone:true,
  templateUrl: './project-assign-model.component.html',
  styleUrl: './project-assign-model.component.css'  
})
export class ProjectAssignModelComponent {

 @Input() selectedProject: any;
 @Input() allEmployeesUnAssigned: any[] = [];
 @Output() employeeAssigned = new EventEmitter<any>();
 @Output() close = new EventEmitter<void>();


searchSkill: string = '';
filteredEmployees: any[] = [];

ngOnChanges() {  //it will set filtered employees list to empty every time selected project and employee input are changed
  this.filteredEmployees =[];  //so that shows empty at first when model shows
}


 filterEmployeesBySkill() {
 const skill = this.searchSkill.toLowerCase();
 if(skill==='')
 {
   this.filteredEmployees=[];
 }
 else{
  this.filteredEmployees = this.allEmployeesUnAssigned.filter(emp =>
     emp.skills.toLowerCase().includes(skill)
  
 );
}
 }

assignEmployee(emp: any) {
this.employeeAssigned.emit({ employee: emp, project: this.selectedProject });
 }

 
closeModal() {
this.close.emit();
console.log("close modal");
}

}


