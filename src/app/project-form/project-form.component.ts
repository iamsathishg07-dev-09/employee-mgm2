import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { MessageComponent } from '../message/message.component';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-project-form',
  imports: [CommonModule,FormsModule,RouterLink,MessageComponent,HeaderComponent],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css'
})
export class ProjectFormComponent implements OnInit{

  mode:string='add';
  today='';
  message:string | null=null;

  @ViewChild('projectForm',{ static: false }) projectForm!: NgForm;

  private readonly USER_KEY = 'loggedInUsername';
  loggedInUsername:string | null=null;
  pageName="Project Form"

  project:any={
    name:'',
    description:'',
    startDate:'',
    endDate:'',
    requiredSkill:'',
    client:''
  };

   constructor(
      private router: Router,
      private projectservice:ProjectService,
      private route: ActivatedRoute
    ) {}

  ngOnInit(): void {
    // if(!sessionStorage.getItem(this.USER_KEY))
    // {
    //   this.router.navigate(['/login']);
    // }
    
    // Check if we're in browser environment before accessing sessionStorage
    if (typeof window !== 'undefined') {
      this.loggedInUsername = sessionStorage.getItem(this.USER_KEY);
    } else {
      this.loggedInUsername = 'Demo User'; // Default value for SSR
    }

    const now=new Date();
    this.today=now.toISOString().split('T')[0];


    this.route.paramMap.subscribe(params => {
    const id = params.get('id');
    this.mode = params.get('mode') || "add"; 
 
    if (id) {
      this.projectservice.getProjectById(+id).subscribe(emp => {  //+ converts a string to number
        this.project = emp;
      });
    }
  });
  }

  saveProject()
  {
    this.projectservice.CreateProject(this.project).subscribe({
    next: () => {
      this.showSuccess("Project Created successfully !!");
      setTimeout(() => {
        this.router.navigate(['/project-list']);
      }, 3000);
    },
    error: (err: any) => {
      this.showError(err.error.message);
    }
  });
  }
  updateProject(): void {
    this.projectservice.updateProject(this.project).subscribe({
      next: () => {
       this.showSuccess("Project updated successfully !!")
        setTimeout(() => {
        this.router.navigate(['/project-list']);
        }, 3000);
      },
      error: (err) => {
      console.error('Error updating Employee:', err);
      this.showError(err.error.message);
      }
    });
  }
  filterTextInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const originalValue = inputElement.value;
    const filteredValue = originalValue.replace(/[^a-zA-Z\s]/g, '');

    if (originalValue !== filteredValue) {
      inputElement.value = filteredValue;

      if (inputElement.name === 'name') {
        this.project.name = filteredValue;
      }
    }
  }
    logOut()
  {
    sessionStorage.removeItem(this.USER_KEY);
    console.log('Logging out (placeholder action)');
    
    this.router.navigate(['/login']);
  }
showSuccess(msg:string)
{
  this.message=msg;
}
showError(msg:any)
{
  console.log(msg);
  this.message=msg;
}
disable(): void {
  if (this.projectForm) {
    Object.keys(this.projectForm.controls).forEach(field => {
      const control = this.projectForm.controls[field];
        control?.disable?.();
    });
  }

}
}
