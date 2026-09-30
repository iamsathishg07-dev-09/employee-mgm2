import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink,RouterOutlet],
  templateUrl: './header.component.html',
  standalone: true,
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() pageTitle: string = '';
  @Input() subTitle: string = '';
  @Input() loggedInUsername: string | null = '';
  @Output() logout = new EventEmitter<void>();


  onLogout() {
    this.logout.emit();
  }

}