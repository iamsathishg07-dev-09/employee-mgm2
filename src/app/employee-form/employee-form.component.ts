import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControlName, FormsModule, NgForm } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'; 
import { AccountListComponent } from '../account-list/account-list.component';
import { MessageComponent } from '../message/message.component';
import { AccountService } from '../services/account.service';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, FormsModule,AccountListComponent,RouterLink,MessageComponent,HeaderComponent],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
}) 
export class EmployeeFormComponent implements OnInit {
  showModal = false;            //to determine to show modl or not
  selectedAccount: any = null;  //to show in account-list model
  mode: string = 'add';
  @ViewChild('employeeForm', { static: false }) employeeForm!: NgForm;  //accessing the ngform for disable
  today!: string; //for setting the date field validation
  hasAccount: boolean = true; //to ensure whether employee has existing account or want to add new

  fromPage:string='';   //to get the page from which we navigate here
  searchSkill:string='';
  projectId!:number;
  

  //below is for model view of success and error messages
  message:string | null=null;

  private readonly USER_KEY = 'loggedInUsername';
  loggedInUsername:string | null=null;
  pageName:string='Employee'

  //employeeForm: string = 'employee-form';

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
    doj:'',
    account: {
      mobileNumber:'',
    }
  };

  constructor(private employeeService: EmployeeService,
     private accountService:AccountService, //angular uses dependency injection by declaring in constructor it will automatically inject the instance
     private route: ActivatedRoute,  //will get & hold the route parameters from the active route page
     private router: Router,         //router for navigation & route for getting route parameters from route url
    ) 
    {
      this.route.queryParams.subscribe(params=>
        {this.fromPage=params['from'];
        this.searchSkill=params['search'];
        this.projectId=params['projectid'];
        }
      )
    }  
     

  ngOnInit(): void {

  // if(!sessionStorage.getItem(this.USER_KEY))
  //   {
  //   this.router.navigate(['/login']);    
  //   }
  
  // Check if we're in browser environment before accessing sessionStorage
  if (typeof window !== 'undefined') {
    this.loggedInUsername = sessionStorage.getItem(this.USER_KEY);
  } else {
    this.loggedInUsername = 'Demo User'; // Default value for SSR
  }
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
        this.employee.account.mobileNumber = '';
        this.selectedAccount = null;
      }
    } else {
      this.employee.account.mobileNumber = '';
      this.selectedAccount = null;
    }
  }

  logOut(): void {
    sessionStorage.removeItem(this.USER_KEY);
    console.log('Logging out (placeholder action)');
    this.router.navigate(['/login']);
  }

  goBack(): void {
    if (this.fromPage === 'employee-list') {
      console.log('back to employee-list');
      this.router.navigate(['/employee-list']);
    } else if (this.fromPage === 'project-list') {
      console.log('back to project-list');
      this.router.navigate(['/project-list'], {
        queryParams: {
          search: this.searchSkill,
          projectid: this.projectId,
        }
      });
    }
  }

  gotoEmpList(): void {
    this.router.navigate(['/employee-list']);
  }
}
