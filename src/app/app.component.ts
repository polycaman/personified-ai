import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './components/chat/chat.component';
import { ConfigComponent } from './components/config/config.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ChatComponent, ConfigComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  currentView: 'chat' | 'config' = 'chat';

  switchView(view: 'chat' | 'config'): void {
    this.currentView = view;
  }
}
