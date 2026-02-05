import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Send, Paperclip, Mic } from 'lucide-angular';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.css',
})
export class ChatInput {
  @Output() sendMessage = new EventEmitter<string>();

  messageText: string = '';
  readonly icons = { Send, Paperclip, Mic };

  onSend() {
    if (this.messageText.trim()) {
      this.sendMessage.emit(this.messageText);
      this.messageText = '';
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }
}
