import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Plus, Search, MessageSquare, Trash2, MoreHorizontal } from 'lucide-angular';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);

  sessions$ = this.chatService.sessions$;
  activeSessionId$ = this.chatService.activeSessionId$;
  currentUser$ = this.authService.currentUser$;

  // Icons
  readonly icons = { Plus, Search, MessageSquare, Trash2, MoreHorizontal };

  createNewChat() {
    this.chatService.createNewSession();
  }

  selectSession(id: string) {
    this.chatService.loadSession(id);
  }
}
