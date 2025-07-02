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
  private readonly USER_KEY = 'loggedInUsername'; //for storing username in session storage


constructor(private userService: UserService, private router: Router) { }
  
 loginUser(): void {
  this.userService.loginUserService(this.loginData).subscribe({
       next: () => {
        this.showSuccess("Login Success !!")
         sessionStorage.setItem(this.USER_KEY,this.loginData.username)
         setTimeout(() => {
        this.router.navigate(['/employee-list']);
        }, 3000);
      },
      error: (err:any) => {
         this.showError(err)
     }
  });
}

showSuccess(msg: string) {
  this.message = msg;
}

showError(error: any) {
  if (error.status == 401) {
    this.message = "Invalid username or password"; 
  }
  else {
      this.message = "Server down! try after some time!!";
  }}
}