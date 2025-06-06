import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { User } from './user.model';
import { UserService } from './user.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { Router, RouterLink, RouterModule } from '@angular/router';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule,MessageComponent,RouterLink,RouterModule], // Add FormsModule to imports
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  constructor(private userService: UserService,private router: Router) { }
   message: string | null = null; 

  newUser: User = { username: "", password: "" };

 createUser(): void {
  this.userService.createUserService(this.newUser).subscribe({
       next: () => {
        this.showSuccess("User Registration success!!")
         setTimeout(() => {
        this.router.navigate(['/login']);
        }, 3000);
       this.newUser = { username: "", password: "" };
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
  if (error.status == 409) {
    this.message = "UserName already exist try some other name!!"; 
  }
  else {
      this.message = "An unexpected error occurred. Please try again.";
  }}


}
