import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../user/user.model';
import { UserService } from '../user/user.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { MessageComponent } from '../message/message.component';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule,MessageComponent,RouterModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginData: User = { username: '', password: '' };
  message: string | null = null;
  isLightTheme = false;

  private readonly USER_KEY = 'loggedInUsername'; //for storing username in session storage


constructor(private userService: UserService, private router: Router) { }

  toggleTheme(): void {
    this.isLightTheme = !this.isLightTheme;
  }
  
 loginUser(): void {
  this.userService.loginUserService(this.loginData).subscribe({
       next: () => {
         sessionStorage.setItem(this.USER_KEY,this.loginData.username)
         setTimeout(() => {
      
const role = localStorage.getItem('role');
      if (role === 'Admin') {
        this.router.navigate(['/employee-list']);
      } else if (role === 'employee') {
        this.router.navigate(['/employee-home']);
      } else if (role === 'Manager') {
        this.router.navigate(['/manager-home']);
      } else {
        this.message = "Unknown role. Access denied.";
      }
        }, 3000);
      },
      error: (err:any) => {
         this.showError(err)
     }
  });
}


showError(error: any) {
  if (error.status == 401) {
    this.message = "Invalid username or password"; 
  }
  else {
      this.message = "Server down! try after some time!!";
  }}
}