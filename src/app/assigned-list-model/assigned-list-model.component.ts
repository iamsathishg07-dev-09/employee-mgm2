import { Component, Input, Output,EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assigned-list-model',
  imports: [CommonModule],
  standalone:true,
  templateUrl: './assigned-list-model.component.html',
  styleUrl: './assigned-list-model.component.css'
})
export class AssignedListModelComponent {

 
@Input() selectedProject: any;
@Input() AllocatedEmployees: any[] = [];

@Output() close = new EventEmitter<void>();
@Output() confirmDeallocateEmployee = new EventEmitter<any>();

 closeModal() {
 this.close.emit(); 
}

 deallocate(emp: any) {
 this.confirmDeallocateEmployee.emit({
   employee:emp,
   project:this.selectedProject
 })
}


}
