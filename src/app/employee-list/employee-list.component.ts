import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 
import { EmployeeService } from '../services/employee.service';
import { Router, RouterLink } from '@angular/router';
import { Employee } from '../employee/employee.model'; 
import { MessageComponent } from '../message/message.component';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterLink, FormsModule,MessageComponent],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
  allEmployees: Employee[] = [];
  paginatedEmployees: Employee[] = [];
  message:string | null=null;


  currentPage: number = 1;
  pageSize: number = 5; 
  totalItems: number = 0; //this is for length of employee list 
  totalPages: number = 0; 



  constructor(
    private employeeService: EmployeeService,
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({  //subscibes the observable to handle async data
      next: (data: Employee[]) => {
        this.allEmployees = data;
        this.totalItems = this.allEmployees.length;
        this.calculatePagination(); 
      },
      error: (err) => {
        console.error('Error loading employees:', err);
      }    
    });
  }


  calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }
    this.updatePaginatedEmployees();
  }

  updatePaginatedEmployees(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEmployees = this.allEmployees.slice(startIndex, endIndex);
  }

  onPageSizeChange(): void {
    this.currentPage = 1; 
    this.calculatePagination();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedEmployees();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedEmployees();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedEmployees();
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }


  addNewEmployee(): void {
    this.router.navigate(['/employee-form']);
  }

  onEdit(employee: Employee): void {
    this.router.navigate(['/employee-form', employee.id, { mode: 'edit' }]); 
  }

  view(employee: Employee): void {
    this.router.navigate(['/employee-form', employee.id, { mode: 'view' }]); 
  }
  

   deleteEmployee(employee: any): void {
         this.employeeService.deleteEmployee(employee.id).subscribe({
        next:() => {
            this.accountService.deleteByMobileNumber(employee.account.mobileNumber).subscribe({
            next:()=>
            {
            this.showSuccess('Employee and associated account deleted successfully!');
            this.loadEmployees();
            },
            error:(err)=>
            {
              this.showError(err.message);
            }
          });
        },
        error: (err) => {
          this.showError('Error deleting employee: ' + (err.error?.message || err.message || 'Unknown error'));
          console.error('Error deleting employee:', err);
        }
      });
    
    }

  showSuccess(msg: string): void
  {
    this.message = msg;
  }
  showError(msg:string):void
  {
    this.message=msg
  }
  
}