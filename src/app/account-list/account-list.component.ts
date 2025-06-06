import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Account } from '../account/account.model';
 
@Component({
  selector: 'app-account-list',
  imports:[CommonModule,FormsModule],
  templateUrl: './account-list.component.html'
})
export class AccountListComponent implements OnInit {
  @Input() accountId!: string;
  @Output() accountSelected = new EventEmitter<any>();
  account: any = null;
  url="http://localhost:8080/EmployeeRestApi/api/accounts/mobile/";
 
  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    this.http.get<Account>(`${this.url}${this.accountId}`).subscribe(data => {
      this.account = data;
    }, error => {
    });
  }
  
  selectAccount() {
    this.accountSelected.emit(this.account);
  }
    closeModal() {
    this.accountSelected.emit(null); 
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }
}