import { NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-message',
  imports: [NgClass,NgIf],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {
  @Input() message:string | null=null;
  @Output() closed = new EventEmitter<void>();
 

  closeModal() {
  this.closed.emit(); // Let parent hide it
}

}
