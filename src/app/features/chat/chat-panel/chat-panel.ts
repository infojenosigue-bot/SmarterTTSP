import { Component, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../core/services/chat.service';
import { ChatMessage } from '../chat-message/chat-message';
import { ChatInput } from '../chat-input/chat-input';
import { ChatHeader } from '../chat-header/chat-header';

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [CommonModule, ChatMessage, ChatInput, ChatHeader],
  templateUrl: './chat-panel.html',
  styleUrl: './chat-panel.css',
})
export class ChatPanel implements AfterViewChecked {
  private chatService = inject(ChatService);

  messages$ = this.chatService.messages$;
  isLoading$ = this.chatService.isLoading$;

  @ViewChild('scrollContainer') privatescrollContainer!: ElementRef;

  sendMessage(text: string) {
    this.chatService.sendMessage(text);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.privatescrollContainer.nativeElement.scrollTop = this.privatescrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
