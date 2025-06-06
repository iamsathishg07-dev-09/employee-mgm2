import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControlName, FormsModule, NgForm } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'; 
import { AccountListComponent } from '../account-list/account-list.component';
import { MessageComponent } from '../message/message.component';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, FormsModule,AccountListComponent,RouterOutlet,RouterLink,MessageComponent],
  templateUrl: './employee-form.component.html'
}) 
export class EmployeeFormComponent implements OnInit {
  showModal = false;            //to determine to show modl or not
  selectedAccount: any = null;  //to show in account-list model
  mode: string = 'add';
  @ViewChild('employeeForm', { static: false }) employeeForm!: NgForm;  //accessing the ngform for disable
  today!: string; //for setting the date field validation
  hasAccount: boolean = true; //to ensure whether employee has existing account or want to add new

  //below is for model view of success and error messages
  message:string | null=null;

  //view of account details for who don't added accounts
  newAccountDetails = {
    mobileNumber:'',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    branchAddress: ''
  };

  //view for employee details
  employee = {
    id: 0,
    name: '',
    dob: '',
    email:'',
    gender: 'Male',
    department: 'IT',
    skills: '',
    account: {
      mobileNumber:'',
    }
  };

  constructor(private employeeService: EmployeeService,
     private accountService:AccountService,
     private route: ActivatedRoute,  //angular uses dependency injection by declaring in constructor it will automatically inject the instance
     private router: Router) {}  //router for navigation & route for getting route parameters from route url

  ngOnInit(): void {
  const now = new Date();
  this.today = now.toISOString().split('T')[0];
 
  this.route.paramMap.subscribe(params => {
    const id = params.get('id');
    this.mode = params.get('mode') || "add"; 
 
    if (id) {
      this.employeeService.getEmployeeById(+id).subscribe(emp => {  //+ converts a string to number
        this.employee = emp;
 
        this.selectedAccount = emp.account;
 
        if (this.mode === 'view') {
          setTimeout(() => this.disable());
        }
      });
    }
  });
  }
saveEmployee(): void {
  if (!this.hasAccount) {
    this.employeeService.checkEmailExistence(this.employee.email).subscribe({
      next:(response)=>{
            this.accountService.saveAccount(this.newAccountDetails).subscribe({
      next: (savedAccount) => { 
        this.employee.account.mobileNumber = this.newAccountDetails.mobileNumber;
        this.saveEmployeeDetails(); // Call after account is saved 
      },
      error: (accountSaveError: any) => {
        this.showError(accountSaveError);
      }
    });
  },
   error: (error: any) => {
      this.showError(error);
    }
    })
  } else {
    this.saveEmployeeDetails(); // Call directly if existing account.
  }
}


private saveEmployeeDetails(): void {
  this.employee.id = 0; // Ensure for new employee creation
  this.employeeService.saveEmployee(this.employee).subscribe({
    next: () => {
      this.showSuccess("Employee Saved successfully !!");
      setTimeout(() => {
        this.router.navigate(['/employee-list']);
      }, 3000);
    },
    error: (err: any) => {
      this.showError(err);
    }
  });
}


  updateEmployee(): void {
    this.employeeService.updateEmployee(this.employee).subscribe({
      next: () => {
       // alert('Employee updated successfully');
       this.showSuccess("Employee updated successfully !!")
        setTimeout(() => {
        this.router.navigate(['/employee-list']);
        }, 3000);
      },
      error: (err) => {
        console.error('Error updating Employee:', err);
      //  alert('Error updating Employee');
      this.showError(err)
      }
    });
  }

  openAccountModal() {
    this.showModal = true;
  }

  onAccountSelected(account: any) {
    if (account) {
      this.employee.account.mobileNumber = account.mobileNumber;
      this.selectedAccount = account;
    } 
    else if(!(this.employee.account.mobileNumber)){
      this.selectedAccount = null;
    }
    this.showModal = false;
  }
  
 disable(): void {
  if (this.employeeForm) {
    Object.keys(this.employeeForm.controls).forEach(field => {
      const control = this.employeeForm.controls[field];
        control?.disable?.();
    });
  }
}
showSuccess(msg:string)
{
  this.message=msg;
}
showError(error:any)
{
  console.log(error);
  this.message=error.error.message;
}
filterNumericInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const originalValue = inputElement.value;
    const filteredValue = originalValue.replace(/[^0-9]/g, '');

    if (originalValue !== filteredValue) {
      inputElement.value = filteredValue;
      if (inputElement.id === 'newMobileNumber') {
        this.newAccountDetails.mobileNumber = filteredValue;
      } else if (inputElement.id === 'Mobile') { 
        this.employee.account.mobileNumber = filteredValue;
      }
    }
  }
  filterTextInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const originalValue = inputElement.value;
    const filteredValue = originalValue.replace(/[^a-zA-Z\s]/g, '');

    if (originalValue !== filteredValue) {
      inputElement.value = filteredValue;

      if (inputElement.name === 'name') {
        this.employee.name = filteredValue;
      }
      else if (inputElement.name === 'newBankName') {
        this.newAccountDetails.bankName = filteredValue;
      }
    }
  }

onAccountOptionChange(): void {
    if (this.hasAccount) {
      this.newAccountDetails = {mobileNumber:'', accountNumber: '', bankName: '', ifscCode: '', branchAddress: '' };
      if (!this.employee.id) { 
        this.employee.account.mobileNumber= '';
        this.selectedAccount = null;
      }
    } else {
      this.employee.account.mobileNumber = '';
      this.selectedAccount = null;
    }
  }


 
}