import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent {

  @Input() message: string | null = null;
  @Input() title: string = 'Confirm Operation'; 

  @Output() confirmed = new EventEmitter<boolean>();

  constructor() { }

 
  onConfirm(): void {
    this.confirmed.emit(true);
    this.closeModal(); 
  }

 
  onCancel(): void {
    this.confirmed.emit(false);
    this.closeModal();
  }


  closeModal(): void {
    this.message = null; 
  }
}